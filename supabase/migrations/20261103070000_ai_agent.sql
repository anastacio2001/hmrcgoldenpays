-- AI agent (Claude): per-lead outreach packs and LinkedIn content drafts. Admin only.
-- Nothing is sent automatically: every output is a draft until approved.

create table public.lead_briefs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads (id) on delete cascade,
  fit_score int not null check (fit_score between 1 and 10),
  summary text not null,
  pains jsonb not null default '[]',          -- [{pain, evidence, source_url}]
  recommended_offering text check (recommended_offering in ('licence', 'sprint', 'integration', 'cloud', 'none')),
  red_flags text[] not null default '{}',
  emails jsonb not null default '[]',         -- [{step, subject, body}]
  letter text,
  linkedin_note text,
  call_opener text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected')),
  model text,
  input_tokens int,
  output_tokens int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lead_briefs_score_idx on public.lead_briefs (status, fit_score desc);

create table public.content_posts (
  id uuid primary key default gen_random_uuid(),
  pillar text not null,
  format text not null default 'post' check (format in ('post', 'carousel', 'poll', 'article')),
  segment text,
  title text not null,
  hook text,
  body text not null,
  hashtags text[] not null default '{}',
  cta text,
  image_idea text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'posted', 'archived')),
  scheduled_for date,
  posted_at timestamptz,
  model text,
  created_at timestamptz not null default now()
);

create index content_posts_status_idx on public.content_posts (status, scheduled_for);

create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  task text not null check (task in ('lead_brief', 'linkedin_posts')),
  model text not null,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  cost_usd numeric(10, 4) not null default 0,
  lead_id uuid references public.leads (id) on delete set null,
  created_at timestamptz not null default now()
);

create index ai_usage_created_at_idx on public.ai_usage (created_at desc);
create index ai_usage_lead_id_idx on public.ai_usage (lead_id);

alter table public.lead_briefs enable row level security;
alter table public.content_posts enable row level security;
alter table public.ai_usage enable row level security;

revoke all on public.lead_briefs, public.content_posts, public.ai_usage from anon, authenticated;
grant select, insert, update, delete on public.lead_briefs, public.content_posts to authenticated;
grant select on public.ai_usage to authenticated;

create policy "Admins manage lead briefs" on public.lead_briefs for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins manage content posts" on public.content_posts for all to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins read AI usage" on public.ai_usage for select to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

-- Nightly lead packs: every 10 minutes between 05:00 and 06:59 UTC, a few leads per call,
-- until the function's daily cap (AI_DAILY_LEADS) is reached.
create function private.run_ai_briefs_job()
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
    url := 'https://bwbmbwwjdcxendypshyb.supabase.co/functions/v1/ai-agent',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret),
    body := '{"task":"lead_brief_batch"}'::jsonb,
    timeout_milliseconds := 150000
  );
end;
$$;
revoke execute on function private.run_ai_briefs_job() from public, anon, authenticated;

select cron.schedule('ai-lead-briefs-nightly', '*/10 5-6 * * *', $$select private.run_ai_briefs_job()$$);
