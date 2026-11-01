-- Backend on Supabase: enquiries (with rate limiting + Resend emails), clients,
-- projects, and admin management of verification deliverables.
--
-- Admin access: a user is an admin when auth.users.raw_app_meta_data->>'role' = 'admin'.
-- app_metadata cannot be changed by the user, only via SQL or the service role:
--   update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = '...';
--
-- Email: the trigger reads these Vault secrets (missing secrets = emails skipped):
--   resend_api_key, resend_from_email, admin_email

create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create function private.html_escape(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select replace(replace(replace(replace(replace(coalesce(value, ''),
    '&', '&amp;'), '<', '&lt;'), '>', '&gt;'), '"', '&quot;'), '''', '&#39;');
$$;

create function private.vault_secret(secret_name text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = secret_name limit 1;
$$;
revoke execute on function private.vault_secret(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Inquiries (public contact form)
-- ---------------------------------------------------------------------------

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  company text check (char_length(company) <= 200),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  service text not null check (service in (
    'Platform Licences & Digital Tooling',
    'Full-Stack Development Sprints',
    'Technical Systems & API Integration',
    'Cloud Infrastructure & Data Hosting',
    'Custom Project',
    'Other'
  )),
  message text not null check (char_length(message) between 10 and 2000),
  status text not null default 'new' check (status in ('new', 'in-progress', 'resolved')),
  created_at timestamptz not null default now()
);

create index inquiries_created_at_idx on public.inquiries (created_at desc);
create index inquiries_email_created_at_idx on public.inquiries (email, created_at);

alter table public.inquiries enable row level security;

revoke all on public.inquiries from anon, authenticated;
-- Visitors may only supply these columns; id, status and created_at use defaults.
grant insert (name, company, email, service, message) on public.inquiries to anon, authenticated;
grant select, update, delete on public.inquiries to authenticated;

create policy "Anyone can submit an inquiry"
  on public.inquiries for insert
  to anon, authenticated
  with check (status = 'new');

create policy "Admins manage inquiries"
  on public.inquiries for all
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create function private.inquiries_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.email := lower(trim(new.email));
  new.name := trim(new.name);
  new.company := nullif(trim(new.company), '');

  if (select count(*) from public.inquiries
      where email = new.email and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001',
      hint = 'Too many enquiries from this email address. Please try again later.';
  end if;

  if (select count(*) from public.inquiries
      where created_at > now() - interval '10 minutes') >= 30 then
    raise exception 'rate_limited' using errcode = 'P0001',
      hint = 'The enquiry service is busy. Please try again shortly.';
  end if;

  return new;
end;
$$;

create trigger inquiries_before_insert
  before insert on public.inquiries
  for each row execute function private.inquiries_before_insert();

create function private.inquiries_send_emails()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key text := private.vault_secret('resend_api_key');
  from_email text := coalesce(private.vault_secret('resend_from_email'), 'onboarding@resend.dev');
  admin_email text := private.vault_secret('admin_email');
  headers jsonb;
  received text := to_char(new.created_at at time zone 'Europe/London', 'DD Mon YYYY HH24:MI');
  footer text := '<p style="margin:24px 0 0;color:#64748b;font-size:12px">GOLDENPAYS LTD · Company No. 16227513 · '
    || 'Office 12 Initial Business Centre, Wilson Business Park, Manchester, UK, M40 8WN</p>';
begin
  if api_key is null or admin_email is null then
    return new;
  end if;

  headers := jsonb_build_object('Authorization', 'Bearer ' || api_key, 'Content-Type', 'application/json');

  -- Notification to GOLDENPAYS
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := headers,
    body := jsonb_build_object(
      'from', from_email,
      'to', jsonb_build_array(admin_email),
      'reply_to', new.email,
      'subject', 'New enquiry: ' || new.service,
      'html', '<div style="font-family:Arial,sans-serif;max-width:600px;color:#0a0f1d">'
        || '<h2 style="margin:0 0 16px">New enquiry</h2>'
        || '<p><b>Name:</b> ' || private.html_escape(new.name) || '</p>'
        || '<p><b>Company:</b> ' || private.html_escape(coalesce(new.company, '—')) || '</p>'
        || '<p><b>Email:</b> ' || private.html_escape(new.email) || '</p>'
        || '<p><b>Service:</b> ' || private.html_escape(new.service) || '</p>'
        || '<p><b>Received:</b> ' || received || '</p>'
        || '<div style="margin-top:16px;padding:16px;border-left:4px solid #10b981;background:#f8fafc;white-space:pre-wrap">'
        || private.html_escape(new.message) || '</div>' || footer || '</div>'
    )
  );

  -- Acknowledgement to the visitor
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := headers,
    body := jsonb_build_object(
      'from', from_email,
      'to', jsonb_build_array(new.email),
      'reply_to', admin_email,
      'subject', 'We received your enquiry: GOLDENPAYS LTD',
      'html', '<div style="font-family:Arial,sans-serif;max-width:600px;color:#0a0f1d">'
        || '<p>Dear ' || private.html_escape(new.name) || ',</p>'
        || '<p>Thank you for your enquiry about <b>' || private.html_escape(new.service) || '</b>. '
        || 'We will review it and reply within 2 business days.</p>'
        || '<p>Best regards,<br><b>GOLDENPAYS LTD</b><br>Software Engineering &amp; Cloud Automation Studio</p>'
        || footer || '</div>'
    )
  );

  return new;
end;
$$;

create trigger inquiries_send_emails
  after insert on public.inquiries
  for each row execute function private.inquiries_send_emails();

-- ---------------------------------------------------------------------------
-- Clients & projects (admin only)
-- ---------------------------------------------------------------------------

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  status text not null default 'prospect' check (status in ('prospect', 'active', 'inactive')),
  notes text,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_id uuid references public.clients (id) on delete set null,
  sic_code text check (sic_code in ('58290', '62012', '62020', '63110')),
  status text not null default 'planning' check (status in ('planning', 'active', 'on-hold', 'completed')),
  value_gbp numeric(12, 2) check (value_gbp >= 0),
  start_date date,
  end_date date,
  description text,
  created_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create index projects_client_id_idx on public.projects (client_id);

alter table public.clients enable row level security;
alter table public.projects enable row level security;

revoke all on public.clients, public.projects from anon, authenticated;
grant select, insert, update, delete on public.clients, public.projects to authenticated;

create policy "Admins manage clients"
  on public.clients for all
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage projects"
  on public.projects for all
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- Deliverables: move to public so admins can manage them through the API.
-- Public visitors still only reach them through verify_deliverable().
-- ---------------------------------------------------------------------------

alter table private.deliverables set schema public;
alter table public.deliverables
  add column project_id uuid references public.projects (id) on delete set null;
create index deliverables_project_id_idx on public.deliverables (project_id);

revoke all on public.deliverables from anon, authenticated;
-- fingerprint, created_at and updated_at are maintained by the trigger.
grant select, delete on public.deliverables to authenticated;
grant insert (reference, client_classification, sic_code, deliverable_summary, accepted_on, approved_by, is_public, project_id)
  on public.deliverables to authenticated;
grant update (reference, client_classification, sic_code, deliverable_summary, accepted_on, approved_by, is_public, project_id)
  on public.deliverables to authenticated;

create policy "Admins manage deliverables"
  on public.deliverables for all
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- The trigger function must not depend on the inserting role's privileges.
alter function private.deliverables_set_fingerprint() security definer;

-- SQL function bodies resolve table names at call time, so point it at the new schema.
create or replace function public.verify_deliverable(p_reference text)
returns table (
  reference text,
  client_classification text,
  sic_code text,
  deliverable_summary text,
  accepted_on date,
  approved_by text,
  fingerprint text
)
language sql
stable
security definer
set search_path = ''
as $$
  select d.reference, d.client_classification, d.sic_code,
         d.deliverable_summary, d.accepted_on, d.approved_by, d.fingerprint
  from public.deliverables d
  where d.reference = upper(trim(p_reference))
    and d.is_public
  limit 1;
$$;
