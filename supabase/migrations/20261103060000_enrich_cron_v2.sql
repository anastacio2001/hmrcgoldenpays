-- The enrichment job also has work when Places or Hunter lookups are pending.
create or replace function private.run_enrich_job()
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
  if not exists (
    select 1 from public.leads
    where status in ('new', 'qualified')
      and (enrichment_checked_at is null
           or (website is null and places_checked_at is null)
           or (website is not null and contact_email is null and hunter_checked_at is null))
  ) then
    return;
  end if;
  perform net.http_post(
    url := 'https://bwbmbwwjdcxendypshyb.supabase.co/functions/v1/enrich-leads',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
end;
$$;
