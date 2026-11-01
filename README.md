# GOLDENPAYS LTD — Official Web Portal

Software Engineering & Cloud Automation Studio · Company No. 16227513 · Manchester, UK

- **Frontend:** Vite + React 19 + Tailwind CSS 4, deployed on Vercel
- **Backend:** Express API in `server/` (contact form + admin), deployed on Render
- **Verification Portal:** Supabase (Postgres)

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
```

Backend: `cd server && npm install && npm run dev`.

## Site structure

| Route | Page |
|---|---|
| `/` | Home: hero, trust bar, packages (`#packages`), verification teaser |
| `/solutions` | Capabilities per SIC code |
| `/services` | Productized services with checkout |
| `/saas` | SaaS catalog and licensing |
| `/verify` | Public Deliverable & Audit Verification Portal (`?ref=GPY-2026-XXXX` deep links) |
| `/company` | Director profile and corporate information |
| `/contact` | Enquiry form (`?package=sprint` preselects a service) |
| `/legal/terms`, `/legal/privacy`, `/legal/refunds` | Legal pages |

Company facts, SIC codes and package prices live in `data/site.ts`.

## Stripe checkout

Set the Payment Link for each package in Vercel:

```
VITE_STRIPE_LINK_LICENCE  VITE_STRIPE_LINK_SPRINT
VITE_STRIPE_LINK_INTEGRATION  VITE_STRIPE_LINK_CLOUD
```

When a link is not set, its button opens the contact form with that package preselected.

## Verification Portal (Supabase)

1. Run `supabase/migrations/20261101000000_deliverables.sql` in the Supabase SQL editor (or `supabase db push`).
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel.
3. Add a delivery once the client has accepted it **and consented to publication**:

```sql
insert into private.deliverables
  (reference, client_classification, sic_code, deliverable_summary, accepted_on, is_public)
values
  ('GPY-2026-7KQ4M2', 'UK SME · E-commerce', '62012', 'REST API Gateway Deployed', '2026-10-28', true);
```

Records live in the non-exposed `private` schema. The site can only look up one reference at a time through `public.verify_deliverable()`, so the list cannot be enumerated. The SHA-256 fingerprint is computed automatically. Use a random suffix in references so they cannot be guessed.
