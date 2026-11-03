-- B2B lead generation from the Companies House public register (admin only).
--
-- Only incorporated companies are stored (corporate subscribers under PECR), never sole traders.
-- A daily pg_cron job calls the `companies-house-leads` Edge Function; it authenticates with
-- the Vault secret `leads_cron_secret`, which must match the function secret CRON_SECRET.

create extension if not exists pg_cron;

create table public.lead_searches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sic_codes text[] not null check (cardinality(sic_codes) between 1 and 20),
  location text,                       -- town, city or postcode area, e.g. 'Manchester'
  company_type text not null default 'ltd' check (company_type in ('ltd', 'plc', 'llp')),
  incorporated_from date,
  incorporated_to date,
  max_results int not null default 200 check (max_results between 1 and 1000),
  is_active boolean not null default true,
  last_run_at timestamptz,
  last_found int,
  last_inserted int,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  company_number text not null unique,
  company_name text not null,
  company_type text,
  incorporated_on date,
  sic_codes text[] not null default '{}',
  address text,
  locality text,
  postcode text,
  directors text[] not null default '{}',
  website text,
  email text,
  phone text,
  status text not null default 'new'
    check (status in ('new', 'qualified', 'contacted', 'replied', 'meeting', 'proposal', 'won', 'lost', 'excluded')),
  notes text,
  search_id uuid references public.lead_searches (id) on delete set null,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now()
);

create index leads_status_idx on public.leads (status);
create index leads_created_at_idx on public.leads (created_at desc);
create index leads_search_id_idx on public.leads (search_id);
create index leads_sic_codes_idx on public.leads using gin (sic_codes);

create table public.lead_runs (
  id uuid primary key default gen_random_uuid(),
  trigger text not null check (trigger in ('cron', 'manual')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  searches int not null default 0,
  found int not null default 0,
  inserted int not null default 0,
  error text
);

create index lead_runs_started_at_idx on public.lead_runs (started_at desc);

alter table public.lead_searches enable row level security;
alter table public.leads enable row level security;
alter table public.lead_runs enable row level security;

revoke all on public.lead_searches, public.leads, public.lead_runs from anon, authenticated;
grant select, insert, update, delete on public.lead_searches, public.leads to authenticated;
grant select on public.lead_runs to authenticated;

create policy "Admins manage lead searches"
  on public.lead_searches for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage leads"
  on public.leads for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins read lead runs"
  on public.lead_runs for select to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- Daily at 06:00 UTC. Skips quietly until the Vault secret exists.
create function private.run_leads_job()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  secret text := private.vault_secret('leads_cron_secret');
begin
  if secret is null then
    return;
  end if;
  perform net.http_post(
    url := 'https://bwbmbwwjdcxendypshyb.supabase.co/functions/v1/companies-house-leads',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret),
    body := '{"trigger":"cron"}'::jsonb,
    timeout_milliseconds := 120000
  );
end;
$$;
revoke execute on function private.run_leads_job() from public, anon, authenticated;

select cron.schedule('companies-house-leads-daily', '0 6 * * *', $$select private.run_leads_job()$$);
