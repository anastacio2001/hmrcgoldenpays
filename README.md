# GOLDENPAYS LTD — Official Web Portal

Software Engineering & Cloud Automation Studio · Company No. 16227513 · Manchester, UK

- **Frontend:** Vite + React 19 + Tailwind CSS 4, deployed on Vercel
- **Backend:** Supabase (Postgres + Auth): contact form, admin panel, Verification Portal.
  The legacy Express API in `server/` is no longer used by the site.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
```


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
| `/admin` | Admin panel: inquiries, clients, projects, payments, deliverables; Internal: finances, documents, compliance (Supabase Auth) |

Company facts, SIC codes and package prices live in `data/site.ts`.

## Stripe checkout

Set the Payment Link for each package in Vercel:

```
VITE_STRIPE_LINK_LICENCE  VITE_STRIPE_LINK_LICENCE_PERPETUAL  VITE_STRIPE_LINK_SPRINT
VITE_STRIPE_LINK_INTEGRATION  VITE_STRIPE_LINK_CLOUD
```

When a link is not set, its button opens the contact form with that package preselected.

## Stripe

Payments made through Stripe Payment Links are recorded automatically in **Admin → Payments** by the
`stripe-webhook` Edge Function (`supabase/functions/stripe-webhook`). It needs only the webhook signing
secret; no Stripe API key is stored anywhere.

1. Deploy: `supabase functions deploy stripe-webhook --project-ref bwbmbwwjdcxendypshyb --no-verify-jwt`
2. Stripe → Developers → Webhooks → **Add endpoint**
   - URL: `https://bwbmbwwjdcxendypshyb.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `charge.refunded`, `invoice.paid` (subscription renewals)
3. Copy the signing secret (`whsec_…`) to Supabase → Edge Functions → Secrets as `STRIPE_WEBHOOK_SECRET`.
4. For each Payment Link set metadata `package` = `licence` | `sprint` | `integration` | `cloud`,
   and the after-payment redirect to `https://goldenpays.uk/thank-you`.

## Supabase backend

Migrations live in `supabase/migrations/` (apply in order in the SQL editor, or `supabase db push`).

| Table | Access |
|---|---|
| `inquiries` | Visitors can insert only (rate-limited: 3/hour per email, 30/10 min overall). Admins read/update/delete. |
| `clients`, `projects` | Admins only |
| `payments` | Admins only. Clients with payments cannot be deleted (records kept for accounting). `stripe_payment_id` is reserved for a future Stripe webhook. |
| `documents`, `expenses`, `compliance_deadlines` | Admins only (Internal area). Files in the private `internal-documents` bucket, opened via 60-second signed URLs. |
| `deliverables` | Admins only; the public reads one published record at a time via `verify_deliverable()` |

Enquiry emails are sent by a database trigger through Resend (`pg_net`). Vault secrets: `resend_api_key`, `resend_from_email`, `admin_email`.
Until the `goldenpays.uk` domain is verified in Resend, Resend only delivers to the account owner's address.

### Creating an admin

1. Supabase → Authentication → Users → **Add user** (email + strong password, auto-confirm).
2. Grant the admin role in the SQL editor:

```sql
update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}' where email = 'you@example.com';
```

3. Sign in at `/admin/login`. Disable public sign-ups under Authentication → Providers → Email.

### Verification records

Record deliveries in **Admin → Deliverables** (references are generated with a random suffix).
Only tick *Publish* once the client has accepted the delivery and agreed to publication.
The SHA-256 fingerprint is computed by the database and cannot be edited.
