-- Internal area (admin only): company documents, expenses and compliance deadlines.

-- ---------------------------------------------------------------------------
-- Documents (files live in the private `internal-documents` storage bucket)
-- ---------------------------------------------------------------------------

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'other'
    check (category in ('contract', 'invoice', 'receipt', 'certificate', 'company', 'tax', 'bank', 'other')),
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  size_bytes bigint check (size_bytes >= 0),
  document_date date,
  client_id uuid references public.clients (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index documents_client_id_idx on public.documents (client_id);
create index documents_project_id_idx on public.documents (project_id);
create index documents_category_idx on public.documents (category);

-- ---------------------------------------------------------------------------
-- Expenses (company is not VAT registered: amounts are gross)
-- ---------------------------------------------------------------------------

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  spent_on date not null default current_date,
  supplier text not null,
  description text,
  category text not null default 'other'
    check (category in ('software', 'hosting', 'equipment', 'professional-fees', 'office',
                        'travel', 'marketing', 'bank-fees', 'insurance', 'training', 'other')),
  amount_gbp numeric(12, 2) not null check (amount_gbp > 0),
  method text not null default 'card' check (method in ('card', 'bank-transfer', 'direct-debit', 'cash', 'other')),
  receipt_document_id uuid references public.documents (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

create index expenses_spent_on_idx on public.expenses (spent_on);
create index expenses_receipt_document_id_idx on public.expenses (receipt_document_id);
create index expenses_project_id_idx on public.expenses (project_id);

-- ---------------------------------------------------------------------------
-- Compliance deadlines (Companies House, HMRC, ...)
-- ---------------------------------------------------------------------------

create table public.compliance_deadlines (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authority text not null default 'other' check (authority in ('companies-house', 'hmrc', 'ico', 'bank', 'other')),
  due_on date not null,
  status text not null default 'pending' check (status in ('pending', 'done')),
  completed_on date,
  notes text,
  created_at timestamptz not null default now(),
  check (status <> 'done' or completed_on is not null)
);

create index compliance_deadlines_status_due_on_idx on public.compliance_deadlines (status, due_on);

-- ---------------------------------------------------------------------------
-- Access: admins only
-- ---------------------------------------------------------------------------

alter table public.documents enable row level security;
alter table public.expenses enable row level security;
alter table public.compliance_deadlines enable row level security;

revoke all on public.documents, public.expenses, public.compliance_deadlines from anon, authenticated;
grant select, insert, update, delete on public.documents, public.expenses, public.compliance_deadlines to authenticated;

create policy "Admins manage documents"
  on public.documents for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage expenses"
  on public.expenses for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins manage compliance deadlines"
  on public.compliance_deadlines for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- Private storage bucket for document files (25 MB per file)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'internal-documents', 'internal-documents', false, 26214400,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'image/heic',
        'text/plain', 'text/csv',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip']
)
on conflict (id) do nothing;

create policy "Admins read internal documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'internal-documents' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins upload internal documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'internal-documents' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins update internal documents"
  on storage.objects for update to authenticated
  using (bucket_id = 'internal-documents' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

create policy "Admins delete internal documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'internal-documents' and ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
