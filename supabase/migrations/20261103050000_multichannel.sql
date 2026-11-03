-- Multichannel outreach: Google Places (website + phone), Hunter (director email),
-- and a unified activity log for calls, LinkedIn and letters.

alter table public.leads
  add column google_maps_url text,
  add column places_checked_at timestamptz,
  add column contact_name text,          -- person behind contact_email (usually a director)
  add column contact_email text,
  add column contact_email_score int check (contact_email_score between 0 and 100),
  add column hunter_checked_at timestamptz;

create index leads_places_pending_idx on public.leads (created_at) where places_checked_at is null;
create index leads_hunter_pending_idx on public.leads (created_at) where hunter_checked_at is null and website is not null;

-- Leads checked by the name-guessing method get a second chance through Google Places.
update public.leads set enrichment_checked_at = null where website is null;

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  channel text not null check (channel in ('email', 'call', 'linkedin', 'letter', 'note')),
  outcome text check (outcome in ('sent', 'no-answer', 'voicemail', 'interested', 'not-interested', 'do-not-contact', 'connected', 'messaged', 'printed', 'posted', 'note')),
  notes text,
  created_at timestamptz not null default now()
);

create index lead_activities_lead_id_idx on public.lead_activities (lead_id, created_at desc);
create index lead_activities_created_at_idx on public.lead_activities (created_at desc);

alter table public.lead_activities enable row level security;
revoke all on public.lead_activities from anon, authenticated;
grant select, insert, update, delete on public.lead_activities to authenticated;
create policy "Admins manage lead activities" on public.lead_activities for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- Sent emails also appear in the activity log.
create function private.outreach_message_activity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.lead_activities (lead_id, channel, outcome, notes)
  values (new.lead_id, 'email', 'sent', 'Step ' || new.step_number || ': ' || new.subject);
  return new;
end;
$$;

create trigger outreach_messages_activity
  after insert on public.outreach_messages
  for each row execute function private.outreach_message_activity();

-- Suppression also covers a director's personal address once it has been found.
create or replace function private.enrollment_check_suppression()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  l record;
begin
  select email, contact_email, company_number, status into l from public.leads where id = new.lead_id;
  if l.status in ('replied', 'meeting', 'proposal', 'won', 'lost', 'excluded')
     or exists (select 1 from public.suppressions s
                where s.company_number = l.company_number
                   or (l.email is not null and s.email = lower(l.email))
                   or (l.contact_email is not null and s.email = lower(l.contact_email))) then
    raise exception 'lead_suppressed' using errcode = 'P0001', hint = 'This lead has opted out or is already in conversation.';
  end if;
  return new;
end;
$$;

-- Unsubscribing suppresses every address we hold for the company.
create or replace function public.unsubscribe(p_token uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  e record;
  addr text;
begin
  select ce.lead_id, l.company_number, l.email, l.contact_email, l.company_name into e
  from public.campaign_enrollments ce join public.leads l on l.id = ce.lead_id
  where ce.unsubscribe_token = p_token;

  if not found then
    return null;
  end if;

  insert into public.suppressions (company_number, reason) values (e.company_number, 'unsubscribed')
    on conflict (company_number) do update set reason = 'unsubscribed';
  foreach addr in array array_remove(array[lower(e.email), lower(e.contact_email)], null) loop
    insert into public.suppressions (email, reason) values (addr, 'unsubscribed')
      on conflict (email) do update set reason = 'unsubscribed';
  end loop;
  update public.leads set status = 'excluded', notes = concat_ws(E'\n', notes, 'Unsubscribed ' || to_char(now(), 'YYYY-MM-DD'))
    where id = e.lead_id;
  update public.campaign_enrollments set status = 'stopped', stopped_reason = 'unsubscribed'
    where lead_id = e.lead_id and status = 'active';

  return e.company_name;
end;
$$;
