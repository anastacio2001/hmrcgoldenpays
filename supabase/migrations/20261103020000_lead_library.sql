-- Lead search library: each search carries the sector's pain point, our pitch and the
-- recommended package, so every lead arrives with its sales angle.

alter table public.lead_searches
  add column segment text,
  add column pain_point text,
  add column pitch text,
  add column offering text check (offering in ('licence', 'sprint', 'integration', 'cloud')),
  add column priority smallint not null default 2 check (priority between 1 and 3),
  -- Rolling window for newly formed companies; overrides incorporated_from when set.
  add column incorporated_within_days int check (incorporated_within_days between 1 and 3650);

alter table public.leads
  add column directors_checked_at timestamptz;

-- Leads that already have directors don't need another lookup.
update public.leads set directors_checked_at = created_at where cardinality(directors) > 0;

create index leads_directors_pending_idx on public.leads (created_at) where directors_checked_at is null;

insert into public.lead_searches
  (name, segment, sic_codes, location, max_results, priority, offering, incorporated_within_days, pain_point, pitch)
values
  -- Priority 1: clear, expensive manual work our fixed-price packages solve
  ('Online retail · UK', 'E-commerce', '{47910}', null, 100, 1, 'integration', null,
   'Orders, stock and accounting live in separate tools (Shopify/WooCommerce, Xero, couriers) and are re-keyed by hand every day.',
   'Fixed-price £450 integration: orders, stock levels and invoices sync automatically between their shop, accounting and courier.'),
  ('Online retail · new companies (90 days)', 'E-commerce', '{47910}', null, 100, 1, 'integration', 90,
   'New shops are choosing their stack now and stitch it together with manual exports and spreadsheets.',
   'Set up the integrations right from day one, before manual processes become habits.'),
  ('Accountants · Greater Manchester', 'Accountancy', '{69201}', 'Manchester', 100, 1, 'sprint', null,
   'Client documents arrive by email and WhatsApp; onboarding, ID checks and year-end chasing are manual.',
   'A secure client portal in a 5-day sprint: document upload, onboarding checklist and automatic reminders.'),
  ('Bookkeepers & payroll · Greater Manchester', 'Accountancy', '{69202,69203}', 'Manchester', 100, 1, 'integration', null,
   'Bank feeds, receipts and payroll data are pulled from several systems and reconciled manually.',
   'Automate receipt capture and data flows into Xero/QuickBooks with a fixed-scope integration.'),
  ('Estate agents · Greater Manchester', 'Property', '{68310}', 'Manchester', 100, 1, 'integration', null,
   'Enquiries from Rightmove, Zoopla and their website are copied into the CRM by hand; slow replies lose viewings.',
   'Route every portal enquiry straight into their CRM with an instant auto-reply: £450 fixed price.'),
  ('Letting & property management · Greater Manchester', 'Property', '{68320}', 'Manchester', 100, 1, 'sprint', null,
   'Maintenance requests come by phone and WhatsApp; rent arrears and certificates are tracked in spreadsheets.',
   'Tenant and landlord portal with maintenance tickets, certificate expiry alerts and rent tracking.'),
  ('Solicitors · Greater Manchester', 'Legal', '{69102}', 'Manchester', 100, 1, 'sprint', null,
   'Client intake forms, ID verification and case updates are handled by phone and email.',
   'Client intake portal with secure document upload and automatic case status updates, built in a sprint.'),
  ('Recruitment agencies · UK', 'Recruitment', '{78109,78200}', null, 100, 1, 'integration', null,
   'Candidates and timesheets move between job boards, ATS and payroll by copy-paste.',
   'Connect job boards, ATS and payroll so candidates and timesheets flow automatically.'),

  -- Priority 2: strong fit, longer sales cycle
  ('Dental practices · Greater Manchester', 'Health', '{86230}', 'Manchester', 100, 2, 'integration', null,
   'No-shows and manual appointment reminders cost chair time every week.',
   'Automated booking reminders and deposit collection linked to their practice software.'),
  ('Private clinics & therapists · Greater Manchester', 'Health', '{86900}', 'Manchester', 100, 2, 'integration', null,
   'Bookings, intake forms and payments are split across several apps.',
   'One booking flow with online forms and Stripe payments, integrated with their diary.'),
  ('Gyms & fitness studios · Greater Manchester', 'Fitness', '{93130,93110}', 'Manchester', 100, 2, 'integration', null,
   'Failed membership payments and class bookings are chased manually.',
   'Stripe membership billing with automatic dunning and class booking integration.'),
  ('Restaurants & takeaways · Greater Manchester', 'Hospitality', '{56101,56102}', 'Manchester', 100, 2, 'integration', null,
   'Deliveroo, Just Eat and Uber Eats orders are re-entered into the till; menus are updated in four places.',
   'Pull delivery-platform orders into one dashboard and sync menu changes everywhere.'),
  ('Road freight & couriers · North West', 'Logistics', '{49410,53202}', 'Manchester', 100, 2, 'sprint', null,
   'Job status and proof of delivery are shared by phone calls and photos on WhatsApp.',
   'Customer tracking portal with digital proof of delivery, built in a 5-day sprint.'),
  ('Logistics & warehousing · North West', 'Logistics', '{52290,52103}', 'Manchester', 100, 2, 'sprint', null,
   'Stock movements and customer orders are reconciled between spreadsheets and the WMS.',
   'Customer ordering portal connected to their stock data, with real-time availability.'),
  ('Wholesalers · UK', 'Wholesale', '{46900,46190}', null, 100, 2, 'sprint', null,
   'B2B customers order by email and phone; staff re-key every order.',
   'Self-service B2B ordering portal with customer-specific prices, built in a sprint.'),
  ('Electricians & plumbers · Greater Manchester', 'Trades', '{43210,43220}', 'Manchester', 100, 2, 'licence', null,
   'Quotes, job sheets and invoices are written by hand or in Word; payments are chased by phone.',
   'Job-to-invoice workflow tooling with online payment links, from £49/month.'),
  ('Building & construction · Greater Manchester', 'Construction', '{41202,43999}', 'Manchester', 100, 2, 'sprint', null,
   'Site reports, RAMS and subcontractor paperwork live on paper and in email threads.',
   'Mobile site-reporting app with photo evidence and automatic PDF reports.'),
  ('Insurance brokers · UK', 'Financial services', '{66220}', null, 100, 2, 'integration', null,
   'Client data is re-entered into multiple insurer portals and the broker system.',
   'Integrations that push client data once into every system they use.'),
  ('Domiciliary & residential care · Greater Manchester', 'Care', '{88100,87100}', 'Manchester', 100, 2, 'cloud', null,
   'Rotas, care notes and CQC evidence are scattered across paper, spreadsheets and apps.',
   'Secure managed database and reporting so CQC evidence is always one click away: from £150/month.'),

  -- Priority 3: agencies and consultancies (white-label capacity, recurring work)
  ('Marketing & advertising agencies · UK', 'Agencies', '{73110,73120}', null, 100, 3, 'sprint', null,
   'They win web and app projects but have no in-house developers, so they turn work away or overrun.',
   'White-label development sprints at fixed prices: they keep the client, we build.'),
  ('Design & creative agencies · UK', 'Agencies', '{74100}', null, 100, 3, 'sprint', null,
   'Designs are ready but the build is outsourced ad hoc to freelancers with no guarantees.',
   'A reliable UK build partner: fixed-price sprints, code delivered to their repository.'),
  ('Business consultancies · Greater Manchester', 'Consulting', '{70229}', 'Manchester', 100, 3, 'sprint', null,
   'Client reporting is assembled manually from spreadsheets each month.',
   'Automated client dashboards built in a sprint and hosted on our managed cloud.'),
  ('Training providers · UK', 'Education', '{85590,85600}', null, 100, 3, 'integration', null,
   'Course bookings, payments and certificates are handled manually by email.',
   'Online booking with Stripe payments and automatic certificates.'),
  ('New companies · services (60 days)', 'New businesses', '{70229,74909,82990,96090}', 'Manchester', 100, 3, 'licence', 60,
   'Newly formed companies have no systems yet and are deciding how to run operations.',
   'Start with ready-made automation tooling from £49/month, then grow into bespoke builds.');
