-- Enrich pending leads every 15 minutes (60 per run), using the same Vault secret as the leads job.

create function private.run_enrich_job()
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
  -- Nothing to do: skip the HTTP call.
  if not exists (select 1 from public.leads where enrichment_checked_at is null and website is null and status in ('new', 'qualified')) then
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
revoke execute on function private.run_enrich_job() from public, anon, authenticated;

select cron.schedule('enrich-leads-every-15-min', '*/15 * * * *', $$select private.run_enrich_job()$$);
