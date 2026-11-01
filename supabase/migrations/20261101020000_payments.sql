-- Payments ledger (admin only). Manual entries now; a Stripe webhook can
-- populate stripe_payment_id later without schema changes.

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique
    check (invoice_number ~ '^INV-[0-9]{4}-[A-Z0-9]{4,12}$'),
  -- Accounting records must be retained, so a client with payments cannot be deleted.
  client_id uuid references public.clients (id) on delete restrict,
  project_id uuid references public.projects (id) on delete set null,
  description text not null,
  kind text not null default 'invoice'
    check (kind in ('invoice', 'deposit', 'balance', 'subscription', 'licence')),
  method text not null default 'stripe'
    check (method in ('stripe', 'bank-transfer', 'other')),
  amount_gbp numeric(12, 2) not null check (amount_gbp > 0),  -- net of VAT
  vat_gbp numeric(12, 2) not null default 0 check (vat_gbp >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'refunded', 'cancelled')),
  issued_on date not null default current_date,
  due_on date,
  paid_on date,
  stripe_payment_id text unique,
  notes text,
  created_at timestamptz not null default now(),
  check (due_on is null or due_on >= issued_on),
  check (status <> 'paid' or paid_on is not null)
);

create index payments_client_id_idx on public.payments (client_id);
create index payments_project_id_idx on public.payments (project_id);
create index payments_status_due_on_idx on public.payments (status, due_on);

alter table public.payments enable row level security;

revoke all on public.payments from anon, authenticated;
grant select, insert, update, delete on public.payments to authenticated;

create policy "Admins manage payments"
  on public.payments for all
  to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
