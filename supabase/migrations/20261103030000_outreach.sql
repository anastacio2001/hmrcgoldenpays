-- Outreach: lead enrichment (website + business email), email sequences with manual or
-- automatic sending, a permanent suppression list and a public unsubscribe RPC.

-- ---------------------------------------------------------------------------
-- Enrichment fields on leads; short topic per search for subject lines
-- ---------------------------------------------------------------------------

alter table public.leads
  add column email_confidence text check (email_confidence in ('high', 'medium', 'manual')),
  add column email_source_url text,
  add column enrichment_checked_at timestamptz;

create index leads_enrichment_pending_idx on public.leads (created_at) where enrichment_checked_at is null;

alter table public.lead_searches add column pain_topic text;

update public.lead_searches set pain_topic = case segment
  when 'E-commerce' then 'order and stock syncing'
  when 'Accountancy' then 'client document chasing'
  when 'Property' then case when 68320 = any (sic_codes::int[]) then 'maintenance requests' else 'portal enquiries' end
  when 'Legal' then 'client intake'
  when 'Recruitment' then 'candidate and timesheet data'
  when 'Health' then 'bookings and no-shows'
  when 'Fitness' then 'membership payments'
  when 'Hospitality' then 'delivery-platform orders'
  when 'Logistics' then 'job tracking and proof of delivery'
  when 'Wholesale' then 'B2B orders by email'
  when 'Trades' then 'quotes and invoices'
  when 'Construction' then 'site paperwork'
  when 'Financial services' then 'insurer portal data entry'
  when 'Care' then 'rotas and CQC evidence'
  when 'Agencies' then 'development capacity'
  when 'Consulting' then 'client reporting'
  when 'Education' then 'course bookings'
  else 'manual admin'
end;

-- ---------------------------------------------------------------------------
-- Suppression list: anyone here is never contacted again
-- ---------------------------------------------------------------------------

create table public.suppressions (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  company_number text unique,
  reason text not null check (reason in ('unsubscribed', 'excluded', 'bounced', 'complaint', 'manual')),
  created_at timestamptz not null default now(),
  check (email is not null or company_number is not null)
);

-- ---------------------------------------------------------------------------
-- Campaigns, steps, enrollments and sent messages
-- ---------------------------------------------------------------------------

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  send_mode text not null default 'manual' check (send_mode in ('manual', 'automatic')),
  daily_limit int not null default 30 check (daily_limit between 1 and 500),
  from_name text not null default 'Ladislau Anastácio',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.campaign_steps (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  step_number int not null check (step_number between 1 and 10),
  delay_days int not null default 0 check (delay_days between 0 and 60),  -- days after the previous step
  subject text not null,
  body text not null,
  unique (campaign_id, step_number)
);

create table public.campaign_enrollments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  current_step int not null default 1,
  next_due_on date not null default current_date,
  status text not null default 'active' check (status in ('active', 'completed', 'stopped')),
  stopped_reason text,
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  unique (campaign_id, lead_id)
);

create index campaign_enrollments_due_idx on public.campaign_enrollments (next_due_on) where status = 'active';
create index campaign_enrollments_lead_id_idx on public.campaign_enrollments (lead_id);

create table public.outreach_messages (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.campaign_enrollments (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  step_number int not null,
  to_email text not null,
  subject text not null,
  body text not null,
  channel text not null check (channel in ('manual', 'resend')),
  provider_id text,
  sent_at timestamptz not null default now()
);

create index outreach_messages_enrollment_id_idx on public.outreach_messages (enrollment_id);
create index outreach_messages_lead_id_idx on public.outreach_messages (lead_id);
create index outreach_messages_sent_at_idx on public.outreach_messages (sent_at desc);

-- ---------------------------------------------------------------------------
-- Guarantees enforced by the database
-- ---------------------------------------------------------------------------

-- Never enroll a suppressed lead.
create function private.enrollment_check_suppression()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  l record;
begin
  select email, company_number, status into l from public.leads where id = new.lead_id;
  if l.status in ('replied', 'meeting', 'proposal', 'won', 'lost', 'excluded')
     or exists (select 1 from public.suppressions s
                where s.company_number = l.company_number or (l.email is not null and s.email = lower(l.email))) then
    raise exception 'lead_suppressed' using errcode = 'P0001', hint = 'This lead has opted out or is already in conversation.';
  end if;
  return new;
end;
$$;

create trigger campaign_enrollments_check_suppression
  before insert on public.campaign_enrollments
  for each row execute function private.enrollment_check_suppression();

-- When a lead replies, converts or is excluded, stop its sequences; exclusion also suppresses it.
create function private.leads_after_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status in ('replied', 'meeting', 'proposal', 'won', 'lost', 'excluded') then
    update public.campaign_enrollments
      set status = 'stopped', stopped_reason = 'lead ' || new.status
      where lead_id = new.id and status = 'active';
  end if;
  if new.status = 'excluded' then
    insert into public.suppressions (company_number, reason) values (new.company_number, 'excluded')
      on conflict (company_number) do nothing;
    if new.email is not null then
      insert into public.suppressions (email, reason) values (lower(new.email), 'excluded')
        on conflict (email) do nothing;
    end if;
  end if;
  return new;
end;
$$;

create trigger leads_after_status_change
  after update of status on public.leads
  for each row when (old.status is distinct from new.status)
  execute function private.leads_after_status_change();

-- Public opt-out, keyed by the unguessable per-enrollment token in every email.
create function public.unsubscribe(p_token uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  e record;
begin
  select ce.lead_id, l.company_number, l.email, l.company_name into e
  from public.campaign_enrollments ce join public.leads l on l.id = ce.lead_id
  where ce.unsubscribe_token = p_token;

  if not found then
    return null;
  end if;

  insert into public.suppressions (company_number, reason) values (e.company_number, 'unsubscribed')
    on conflict (company_number) do update set reason = 'unsubscribed';
  if e.email is not null then
    insert into public.suppressions (email, reason) values (lower(e.email), 'unsubscribed')
      on conflict (email) do update set reason = 'unsubscribed';
  end if;
  update public.leads set status = 'excluded', notes = concat_ws(E'\n', notes, 'Unsubscribed ' || to_char(now(), 'YYYY-MM-DD'))
    where id = e.lead_id;
  update public.campaign_enrollments set status = 'stopped', stopped_reason = 'unsubscribed'
    where lead_id = e.lead_id and status = 'active';

  return e.company_name;
end;
$$;

revoke execute on function public.unsubscribe(uuid) from public;
grant execute on function public.unsubscribe(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Access: admins only (except the unsubscribe RPC above)
-- ---------------------------------------------------------------------------

alter table public.suppressions enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_steps enable row level security;
alter table public.campaign_enrollments enable row level security;
alter table public.outreach_messages enable row level security;

revoke all on public.suppressions, public.campaigns, public.campaign_steps, public.campaign_enrollments, public.outreach_messages from anon, authenticated;
grant select, insert, update, delete on public.suppressions, public.campaigns, public.campaign_steps, public.campaign_enrollments, public.outreach_messages to authenticated;

create policy "Admins manage suppressions" on public.suppressions for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins manage campaigns" on public.campaigns for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins manage campaign steps" on public.campaign_steps for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins manage enrollments" on public.campaign_enrollments for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins manage outreach messages" on public.outreach_messages for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- Default campaign: the 4-step core sequence
-- ---------------------------------------------------------------------------

with c as (
  insert into public.campaigns (name) values ('Core sequence · fixed-price automation') returning id
)
insert into public.campaign_steps (campaign_id, step_number, delay_days, subject, body)
select c.id, s.step_number, s.delay_days, s.subject, s.body from c, (values
  (1, 0, '{{company}}: quick question about {{pain_topic}}',
$b$Hi {{first_name}},

Most {{segment_lc}} businesses we speak to in {{locality}} have the same headache: {{pain}}

We fix exactly that at a fixed price. {{pitch}} No hourly billing, and the code is yours.

Is this something {{company}} deals with too?

{{signature}}$b$),
  (2, 3, 'Re: {{company}}: quick question about {{pain_topic}}',
$b${{first_name}}, to make it concrete, here is how it would work for {{company}}:

1. A 20-minute call to map your current process (free)
2. A written scope and fixed price, before any commitment
3. Built and tested in days, not months
4. You sign off, and the delivery gets a public verification reference

Worth 20 minutes this week or next?

{{signature}}$b$),
  (3, 4, 'Free 20-minute automation check for {{company}}',
$b${{first_name}}, one more idea.

I'll look at how {{company}} currently handles {{pain_topic}} and tell you, in writing, what could be automated and what it would cost. Free and with no obligation. If it isn't worth doing, I'll say so.

Reply "yes" and I'll send two time slots.

{{signature}}$b$),
  (4, 7, 'Closing the loop',
$b${{first_name}}, I don't want to clutter your inbox, so this is my last note.

If {{pain_topic}} becomes a priority later, just reply to this email. All the best to the team at {{company}}.

{{signature}}$b$)
) as s(step_number, delay_days, subject, body);
