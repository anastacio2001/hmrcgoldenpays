/// <reference lib="deno.ns" />
// Lead enrichment, in order:
//   1. Google Places (GOOGLE_PLACES_API_KEY): website + phone from the company's Google profile
//      (fallback without a key: guess the domain from the company name)
//   2. Business email published on that website, on the company's own domain
//   3. Hunter (HUNTER_API_KEY): the named director's work email, verified
// Paid lookups have daily caps: GOOGLE_DAILY_LIMIT (default 30, ~900/month, inside Google's 1,000 free monthly requests), HUNTER_DAILY_LIMIT (default 10).
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
  locality: string | null;
  directors: string[];
  website: string | null;
  email: string | null;
  contact_email: string | null;
  places_checked_at: string | null;
  enrichment_checked_at: string | null;
  hunter_checked_at: string | null;
}

const GOOGLE_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY');
const HUNTER_KEY = Deno.env.get('HUNTER_API_KEY');

function nameMatches(candidate: string, companyName: string) {
  const tokens = words(companyName).filter((w) => !LEGAL_WORDS.has(w) && w.length >= 3);
  if (tokens.length === 0) return false;
  const text = candidate.toLowerCase();
  return tokens.filter((t) => text.includes(t)).length / tokens.length >= 0.6;
}

/** Google Places (New) text search: the company's own website and phone from its Google profile. */
async function placesLookup(lead: Lead) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_KEY!,
      'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.googleMapsUri,places.businessStatus',
    },
    body: JSON.stringify({ textQuery: `${lead.company_name} ${lead.locality ?? lead.postcode ?? ''}`.trim(), regionCode: 'GB', pageSize: 3 }),
  });
  if (!res.ok) throw new Error(`Places ${res.status}`);
  const data = await res.json();
  const postcode = lead.postcode?.toLowerCase().replace(/\s/g, '');
  // deno-lint-ignore no-explicit-any
  const match = (data.places ?? []).find((p: any) =>
    p.businessStatus !== 'CLOSED_PERMANENTLY' &&
    (nameMatches(p.displayName?.text ?? '', lead.company_name) ||
      (!!postcode && (p.formattedAddress ?? '').toLowerCase().replace(/\s/g, '').includes(postcode))));
  if (!match) return null;
  return {
    website: match.websiteUri ? new URL(match.websiteUri).origin : null,
    phone: match.nationalPhoneNumber ?? null,
    google_maps_url: match.googleMapsUri ?? null,
  };
}

/** Business email published on the site (home page, then contact/about pages). */
async function scrapeEmail(website: string) {
  const home = await fetchPage(website);
  if (!home) return null;
  const host = hostOf(home.url);
  const origin = new URL(home.url).origin;
  let email = pickEmail(home.html, host);
  let source = home.url;
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
  return email ? { email, source } : null;
}

/** Fallback without Google: guess the domain from the company name and verify the site. */
async function guessWebsite(lead: Lead) {
  for (const domain of candidateDomains(lead.company_name)) {
    const page = (await fetchPage(`https://${domain}`)) ?? (await fetchPage(`https://www.${domain}`));
    if (!page) continue;
    const confidence = siteConfidence(page.html, lead);
    if (confidence) return { website: new URL(page.url).origin, confidence };
  }
  return null;
}

/** Hunter Email Finder: a director's work email on the company domain (1 credit per lookup). */
async function hunterFind(director: string, website: string) {
  const parts = director.split(/\s+/);
  if (parts.length < 2) return null;
  const url = new URL('https://api.hunter.io/v2/email-finder');
  url.searchParams.set('domain', hostOf(website));
  url.searchParams.set('first_name', parts[0]);
  url.searchParams.set('last_name', parts[parts.length - 1]);
  url.searchParams.set('api_key', HUNTER_KEY!);
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (res.status === 429 || res.status === 402) throw new Error('hunter_quota');
  if (!res.ok) return null;
  const d = (await res.json()).data;
  if (!d?.email || d.verification?.status === 'invalid' || (d.score ?? 0) < 70) return null;
  return { contact_email: d.email.toLowerCase(), contact_name: director, contact_email_score: d.score };
}

async function usedToday(column: 'places_checked_at' | 'hunter_checked_at') {
  const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true })
    .gte(column, new Date().toISOString().slice(0, 10));
  return count ?? 0;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!(await authorized(req))) return json({ error: 'Unauthorized' }, 401);

  const started = Date.now();
  const budget = {
    places: GOOGLE_KEY ? Math.max(Number(Deno.env.get('GOOGLE_DAILY_LIMIT') ?? 30) - (await usedToday('places_checked_at')), 0) : 0,
    hunter: HUNTER_KEY ? Math.max(Number(Deno.env.get('HUNTER_DAILY_LIMIT') ?? 10) - (await usedToday('hunter_checked_at')), 0) : 0,
  };

  // Leads that still have a step to run.
  const needs = [
    ...(budget.places > 0 ? ['and(website.is.null,places_checked_at.is.null)'] : []),
    'and(website.is.null,enrichment_checked_at.is.null)',
    'and(website.not.is.null,email.is.null,enrichment_checked_at.is.null)',
    ...(budget.hunter > 0 ? ['and(website.not.is.null,contact_email.is.null,hunter_checked_at.is.null)'] : []),
  ].join(',');
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, company_name, company_number, postcode, locality, directors, website, email, contact_email, places_checked_at, enrichment_checked_at, hunter_checked_at, lead_searches(priority)')
    .in('status', ['new', 'qualified'])
    .or(needs)
    .order('created_at')
    .limit(BATCH_SIZE * 3);
  if (error) return json({ error: error.message }, 500);

  // deno-lint-ignore no-explicit-any
  const queue = (leads ?? []).sort((a: any, b: any) => (a.lead_searches?.priority ?? 9) - (b.lead_searches?.priority ?? 9)).slice(0, BATCH_SIZE) as Lead[];
  const stats = { checked: 0, websites: 0, phones: 0, emails: 0, director_emails: 0, places_left: budget.places, hunter_left: budget.hunter };
  const now = () => new Date().toISOString();

  const worker = async () => {
    while (queue.length && Date.now() - started < TIME_BUDGET_MS) {
      const lead = queue.shift()!;
      // deno-lint-ignore no-explicit-any
      const update: Record<string, any> = {};
      try {
        let website = lead.website;

        if (!website && GOOGLE_KEY && !lead.places_checked_at && budget.places > 0) {
          budget.places--;
          update.places_checked_at = now();
          const place = await placesLookup(lead).catch(() => null);
          if (place) {
            Object.assign(update, place);
            website = place.website;
            if (place.phone) stats.phones++;
          }
        } else if (!website && !GOOGLE_KEY && !lead.enrichment_checked_at) {
          const guess = await guessWebsite(lead);
          if (guess) {
            website = guess.website;
            update.website = guess.website;
            update.email_confidence = guess.confidence;
          }
        } else if (!website && GOOGLE_KEY && !lead.places_checked_at) {
          continue; // Google budget used up for today; retry tomorrow.
        }

        if (website && update.website) stats.websites++;

        if (website && !lead.email && !lead.enrichment_checked_at) {
          const found = await scrapeEmail(website);
          if (found) {
            update.email = found.email;
            update.email_source_url = found.source;
            update.email_confidence = update.email_confidence ?? 'high'; // site confirmed by Google profile
            stats.emails++;
          }
        }
        update.enrichment_checked_at = lead.enrichment_checked_at ?? now();

        if (website && HUNTER_KEY && !lead.contact_email && !lead.hunter_checked_at && budget.hunter > 0 && lead.directors.length > 0) {
          budget.hunter--;
          update.hunter_checked_at = now();
          try {
            const contact = await hunterFind(lead.directors[0], website);
            if (contact) {
              Object.assign(update, contact);
              stats.director_emails++;
            }
          } catch (err) {
            if (err instanceof Error && err.message === 'hunter_quota') budget.hunter = 0;
            delete update.hunter_checked_at; // retry when credits are available
          }
        }
      } finally {
        if (Object.keys(update).length) await supabase.from('leads').update(update).eq('id', lead.id);
        stats.checked++;
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  stats.places_left = budget.places;
  stats.hunter_left = budget.hunter;

  const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true }).in('status', ['new', 'qualified']).is('enrichment_checked_at', null);
  return json({ ...stats, remaining: count ?? 0, sources: { google: !!GOOGLE_KEY, hunter: !!HUNTER_KEY } });
});
