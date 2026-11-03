-- Approved AI lead packs enroll with their own personalised emails instead of the template.
alter table public.campaign_enrollments add column custom_steps jsonb;  -- [{step, subject, body}]
