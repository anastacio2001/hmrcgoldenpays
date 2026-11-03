/// <reference lib="deno.ns" />
// Lead enrichment: finds each lead's website from its company name and the business email
// published on that site. A site only counts when it mentions the company (name, postcode
// or company number), and only addresses on the site's own domain are kept.
//
// Callers: pg_cron (x-cron-secret = CRON_SECRET) or a signed-in admin.

import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

const BATCH_SIZE = 60;
const CONCURRENCY = 6;
const FETCH_TIMEOUT_MS = 6000;
const MAX_HTML_BYTES = 600_000;
const TIME_BUDGET_MS = 110_000;

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

async function authorized(req: Request) {
  const secret = Deno.env.get('CRON_SECRET');
  const provided = req.headers.get('x-cron-secret');
  if (secret && provided && timingSafeEqual(provided, secret)) return true;
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return false;
  const { data, error } = await supabase.auth.getUser(token);
  return !error && data.user?.app_metadata?.role === 'admin';
}

const LEGAL_WORDS = new Set(['limited', 'ltd', 'plc', 'llp', 'lp', 'cic', 'the', 'and', 'co', 'company']);
const GENERIC_WORDS = new Set(['uk', 'group', 'holdings', 'services', 'solutions', 'international', 'enterprises', 'trading', 'gb', 'england', 'manchester', 'london']);

const words = (name: string) =>
  name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);

function candidateDomains(companyName: string): string[] {
  const all = words(companyName).filter((w) => !LEGAL_WORDS.has(w));
  const core = all.filter((w) => !GENERIC_WORDS.has(w));
  const slugs = new Set<string>();
  for (const list of [all, core]) {
    if (list.length === 0) continue;
    slugs.add(list.join(''));
    if (list.length > 1) slugs.add(list.join('-'));
  }
  const domains: string[] = [];
  for (const slug of slugs) {
    if (slug.length < 3 || slug.length > 40) continue;
    for (const tld of ['co.uk', 'com', 'uk']) domains.push(`${slug}.${tld}`);
  }
  return domains.slice(0, 9);
}

async function fetchPage(url: string): Promise<{ url: string; html: string } | null> {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GOLDENPAYS-LeadCheck/1.0; +https://goldenpays.uk)' },
    });
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('text/html')) return null;
    const html = (await res.text()).slice(0, MAX_HTML_BYTES);
    return { url: res.url, html };
  } catch {
    return null;
  }
}

const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, '');

// Parked domains and marketplaces are not the company's site.
const PARKED = /domain (is )?for sale|buy this domain|parked free|godaddy|sedo|this domain may be for sale|hugedomains|dan\.com/i;

function siteConfidence(html: string, lead: Lead): 'high' | 'medium' | null {
  if (PARKED.test(html)) return null;
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  const compact = text.replace(/\s/g, '');
  if (compact.includes(lead.company_number.toLowerCase())) return 'high';
  if (lead.postcode && compact.includes(lead.postcode.toLowerCase().replace(/\s/g, ''))) return 'high';
  const tokens = words(lead.company_name).filter((w) => !LEGAL_WORDS.has(w) && w.length >= 3);
  if (tokens.length === 0) return null;
  // A single short word (e.g. "Rola") matches too many unrelated sites: require a hard identifier.
  if (tokens.length === 1 && tokens[0].length < 6) return null;
  const hits = tokens.filter((t) => text.includes(t)).length;
  if (hits / tokens.length < 0.6) return null;
  // A name match alone must come with signs of a UK business.
  return UK_SIGNAL.test(text) ? 'medium' : null;
}

const UK_SIGNAL = /\b[a-z]{1,2}\d[a-z\d]?\s?\d[a-z]{2}\b|\+44|united kingdom|\bltd\b|\blimited\b|companies house|registered in england/i;

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;
const BLOCKED_LOCAL = /^(no-?reply|donotreply|privacy|gdpr|dpo|data|abuse|postmaster|webmaster|careers|jobs|recruitment|unsubscribe|example|test|name|email|your)/i;
const GENERIC_LOCAL = ['info', 'hello', 'enquiries', 'enquiry', 'contact', 'sales', 'office', 'admin', 'team', 'mail', 'support', 'accounts'];

function pickEmail(html: string, siteHost: string): string | null {
  const found = new Set<string>();
  for (const m of html.matchAll(EMAIL_RE)) {
    const email = m[0].toLowerCase().replace(/\.(png|jpg|jpeg|gif|webp|svg)$/, '');
    const [local, domain] = email.split('@');
    if (!domain || BLOCKED_LOCAL.test(local)) continue;
    // Only addresses on the company's own domain (or a subdomain of it).
    if (domain !== siteHost && !domain.endsWith('.' + siteHost) && !siteHost.endsWith('.' + domain)) continue;
    found.add(email);
  }
  if (found.size === 0) return null;
  const list = [...found];
  return GENERIC_LOCAL.map((g) => list.find((e) => e.startsWith(g + '@'))).find(Boolean) ?? list[0];
}

interface Lead {
  id: string;
  company_name: string;
  company_number: string;
  postcode: string | null;
}

async function enrich(lead: Lead) {
  for (const domain of candidateDomains(lead.company_name)) {
    const page = (await fetchPage(`https://${domain}`)) ?? (await fetchPage(`https://www.${domain}`));
    if (!page) continue;
    const confidence = siteConfidence(page.html, lead);
    if (!confidence) continue;

    const host = hostOf(page.url);
    const origin = new URL(page.url).origin;
    let email = pickEmail(page.html, host);
    let source = page.url;
    if (!email) {
      for (const path of ['/contact', '/contact-us', '/about', '/about-us']) {
        const sub = await fetchPage(origin + path);
        if (!sub) continue;
        email = pickEmail(sub.html, host);
        if (email) {
          source = sub.url;
          break;
        }
      }
    }
    return { website: origin, email, email_confidence: email ? confidence : null, email_source_url: email ? source : null };
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!(await authorized(req))) return json({ error: 'Unauthorized' }, 401);

  const started = Date.now();
  // Highest-priority segments first.
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, company_name, company_number, postcode, lead_searches(priority)')
    .is('enrichment_checked_at', null)
    .is('website', null)
    .in('status', ['new', 'qualified'])
    .order('created_at')
    .limit(BATCH_SIZE * 3);
  if (error) return json({ error: error.message }, 500);

  // deno-lint-ignore no-explicit-any
  const queue = (leads ?? []).sort((a: any, b: any) => (a.lead_searches?.priority ?? 9) - (b.lead_searches?.priority ?? 9)).slice(0, BATCH_SIZE) as Lead[];
  const stats = { checked: 0, websites: 0, emails: 0 };

  const worker = async () => {
    while (queue.length && Date.now() - started < TIME_BUDGET_MS) {
      const lead = queue.shift()!;
      const result = await enrich(lead);
      await supabase.from('leads').update({ ...(result ?? {}), enrichment_checked_at: new Date().toISOString() }).eq('id', lead.id);
      stats.checked++;
      if (result) stats.websites++;
      if (result?.email) stats.emails++;
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true }).is('enrichment_checked_at', null).is('website', null);
  return json({ ...stats, remaining: count ?? 0 });
});
