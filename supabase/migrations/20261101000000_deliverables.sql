-- Public Deliverable & Audit Verification Portal
--
-- Records live in the non-exposed `private` schema, so the Data API cannot list them.
-- The website looks up exactly one reference at a time through
-- public.verify_deliverable(), which returns only sanitized, publishable fields.

create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table private.deliverables (
  id bigint generated always as identity primary key,
  -- Use a non-sequential suffix (e.g. GPY-2026-7KQ4M2) so references cannot be guessed.
  reference text not null unique
    check (reference ~ '^GPY-[0-9]{4}-[A-Z0-9]{4,12}$'),
  client_classification text not null,  -- sanitized, e.g. 'UK SME · E-commerce'
  sic_code text not null
    check (sic_code in ('58290', '62012', '62020', '63110')),
  deliverable_summary text not null,    -- e.g. 'REST API Gateway Deployed'
  accepted_on date not null,            -- date the client signed off the delivery
  approved_by text not null default 'Ladislau S. Anastácio, Managing Director',
  is_public boolean not null default false,  -- only true once the client consents to disclosure
  fingerprint text not null,            -- SHA-256 of the published fields, set by trigger
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table private.deliverables enable row level security;
alter table private.deliverables force row level security;
-- No policies: nothing but the definer function below (and the dashboard/service role) can read it.

create function private.deliverables_set_fingerprint()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.reference := upper(trim(new.reference));
  new.fingerprint := encode(
    extensions.digest(
      concat_ws('|',
        new.reference,
        new.client_classification,
        new.sic_code,
        new.deliverable_summary,
        new.accepted_on::text,
        new.approved_by
      ),
      'sha256'
    ),
    'hex'
  );
  new.updated_at := now();
  return new;
end;
$$;

create trigger deliverables_set_fingerprint
  before insert or update on private.deliverables
  for each row execute function private.deliverables_set_fingerprint();

create function public.verify_deliverable(p_reference text)
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
  from private.deliverables d
  where d.reference = upper(trim(p_reference))
    and d.is_public
  limit 1;
$$;

revoke execute on function public.verify_deliverable(text) from public;
grant execute on function public.verify_deliverable(text) to anon, authenticated;
