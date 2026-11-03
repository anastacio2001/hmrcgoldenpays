/// <reference lib="deno.ns" />
// Companies House → public.leads
//
// Runs every active row in public.lead_searches against the Companies House advanced search API,
// stores new companies as leads and attaches their active directors.
//
// Secrets:
//   COMPANIES_HOUSE_API_KEY  REST API key from developer.company-information.service.gov.uk
//   CRON_SECRET              shared with the Vault secret `leads_cron_secret` used by pg_cron
// Callers: pg_cron (x-cron-secret header) or a signed-in admin (Authorization: Bearer <jwt>).

import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

const CH_BASE = 'https://api.company-information.service.gov.uk';
const PAGE_SIZE = 100;
// Companies House allows 600 requests per 5 minutes; stay well below it per run.
const MAX_OFFICER_LOOKUPS = 300;
const OFFICER_CONCURRENCY = 4;

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const chAuth = () => 'Basic ' + btoa(`${Deno.env.get('COMPANIES_HOUSE_API_KEY')}:`);

async function chGet(path: string, params: Record<string, string | number | undefined> = {}) {
  const url = new URL(CH_BASE + path);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') url.searchParams.set(k, String(v));
  const res = await fetch(url, { headers: { Authorization: chAuth() } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Companies House ${res.status} on ${path}`);
  return res.json();
}

const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

async function authorize(req: Request): Promise<'cron' | 'manual' | null> {
  const cronSecret = Deno.env.get('CRON_SECRET');
  const provided = req.headers.get('x-cron-secret');
  if (cronSecret && provided && timingSafeEqual(provided, cronSecret)) return 'cron';

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.app_metadata?.role === 'admin' ? 'manual' : null;
}

// "SMITH, John Paul" → "John Paul Smith"
const formatOfficerName = (name: string) => {
  const [surname, given] = name.split(',').map((s) => s.trim());
  if (!given) return name;
  const title = (s: string) => s.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (m) => m.toUpperCase());
  return `${given} ${title(surname)}`;
};

async function activeDirectors(companyNumber: string): Promise<string[]> {
  const data = await chGet(`/company/${companyNumber}/officers`, { items_per_page: 20 });
  return (data?.items ?? [])
    // deno-lint-ignore no-explicit-any
    .filter((o: any) => !o.resigned_on && o.officer_role === 'director')
    // deno-lint-ignore no-explicit-any
    .map((o: any) => formatOfficerName(o.name));
}

interface LeadSearch {
  id: string;
  sic_codes: string[];
  location: string | null;
  company_type: string;
  incorporated_from: string | null;
  incorporated_to: string | null;
  incorporated_within_days: number | null;
  max_results: number;
}

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

async function runSearch(search: LeadSearch) {
  const incorporatedFrom = search.incorporated_within_days ? daysAgo(search.incorporated_within_days) : search.incorporated_from;
  // deno-lint-ignore no-explicit-any
  const companies: any[] = [];
  for (let start = 0; start < search.max_results; start += PAGE_SIZE) {
    const page = await chGet('/advanced-search/companies', {
      sic_codes: search.sic_codes.join(','),
      location: search.location ?? undefined,
      company_status: 'active',
      company_type: search.company_type,
      incorporated_from: incorporatedFrom ?? undefined,
      incorporated_to: search.incorporated_to ?? undefined,
      size: Math.min(PAGE_SIZE, search.max_results - start),
      start_index: start,
    });
    const items = page?.items ?? [];
    companies.push(...items);
    if (items.length < PAGE_SIZE) break;
  }

  if (companies.length === 0) return { found: 0, inserted: 0 };

  // Only insert companies we don't already have, so manual edits to existing leads are never overwritten.
  const numbers = companies.map((c) => c.company_number);
  const { data: existing, error: existingError } = await supabase.from('leads').select('company_number').in('company_number', numbers);
  if (existingError) throw existingError;
  const known = new Set((existing ?? []).map((e) => e.company_number));
  const fresh = companies.filter((c) => !known.has(c.company_number));

  const rows = fresh.map((c) => {
    const a = c.registered_office_address ?? {};
    return {
      company_number: c.company_number,
      company_name: c.company_name,
      company_type: c.company_type,
      incorporated_on: c.date_of_creation ?? null,
      sic_codes: c.sic_codes ?? [],
      address: [a.address_line_1, a.address_line_2, a.locality, a.region, a.postal_code].filter(Boolean).join(', ') || null,
      locality: a.locality ?? null,
      postcode: a.postal_code ?? null,
      search_id: search.id,
    };
  });

  if (rows.length > 0) {
    const { error } = await supabase.from('leads').upsert(rows, { onConflict: 'company_number', ignoreDuplicates: true });
    if (error) throw error;
  }
  return { found: companies.length, inserted: rows.length };
}

/** Fills in active directors for leads not yet checked, oldest first, within the request budget. */
async function backfillDirectors(budget: number) {
  const { data: pending, error } = await supabase
    .from('leads')
    .select('id, company_number')
    .is('directors_checked_at', null)
    .order('created_at')
    .limit(budget);
  if (error) throw error;

  let done = 0;
  const queue = [...(pending ?? [])];
  const worker = async () => {
    while (queue.length) {
      const lead = queue.shift()!;
      try {
        const directors = await activeDirectors(lead.company_number);
        await supabase.from('leads').update({ directors, directors_checked_at: new Date().toISOString() }).eq('id', lead.id);
        done++;
      } catch {
        // Leave unchecked; the next run retries it.
      }
    }
  };
  await Promise.all(Array.from({ length: OFFICER_CONCURRENCY }, worker));
  return done;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const trigger = await authorize(req);
  if (!trigger) return json({ error: 'Unauthorized' }, 401);
  if (!Deno.env.get('COMPANIES_HOUSE_API_KEY')) return json({ error: 'COMPANIES_HOUSE_API_KEY is not set' }, 500);

  const body = await req.json().catch(() => ({}));
  const onlySearchId: string | undefined = body.search_id;

  const { data: run } = await supabase.from('lead_runs').insert({ trigger }).select('id').single();

  let query = supabase.from('lead_searches').select('*');
  query = onlySearchId ? query.eq('id', onlySearchId) : query.eq('is_active', true);
  const { data: searches, error } = await query;
  if (error) return json({ error: error.message }, 500);

  const totals = { searches: 0, found: 0, inserted: 0, directors: 0 };
  const errors: string[] = [];

  for (const search of (searches ?? []) as LeadSearch[]) {
    try {
      const result = await runSearch(search);
      totals.searches++;
      totals.found += result.found;
      totals.inserted += result.inserted;
      await supabase.from('lead_searches')
        .update({ last_run_at: new Date().toISOString(), last_found: result.found, last_inserted: result.inserted })
        .eq('id', search.id);
    } catch (err) {
      errors.push(`${search.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  try {
    totals.directors = await backfillDirectors(MAX_OFFICER_LOOKUPS);
  } catch (err) {
    errors.push(`directors: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (run) {
    await supabase.from('lead_runs').update({
      finished_at: new Date().toISOString(),
      searches: totals.searches,
      found: totals.found,
      inserted: totals.inserted,
      error: errors.length ? errors.join('; ').slice(0, 2000) : null,
    }).eq('id', run.id);
  }

  return json({ ...totals, errors });
});
