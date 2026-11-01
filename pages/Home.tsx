import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COMPANY, OFFERINGS, SIC_CODES } from '../data/site';
import { Eyebrow, OfferingCard, btnPrimary, btnSecondary } from '../components/ui';
import Reveal from '../components/Reveal';

const trustItems = [
  `UK Registered Entity (#${COMPANY.number})`,
  'Manchester Office',
  'Direct Stripe Integration',
  'Micro-entity Compliant',
];

// Illustrative sprint log shown in the hero terminal.
const sprintLog = [
  { text: '$ gp sprint start --scope client-portal', tone: 'cmd' },
  { text: '✓ scope confirmed · 5-day sprint', tone: 'ok' },
  { text: '✓ REST API scaffolded · TypeScript', tone: 'ok' },
  { text: '✓ PostgreSQL schema migrated', tone: 'ok' },
  { text: '✓ test suite passed', tone: 'ok' },
  { text: '✓ deployed to production', tone: 'ok' },
  { text: '→ delivery recorded · GPY-2026-XXXX', tone: 'ref' },
] as const;

const icons: Record<string, React.ReactNode> = {
  '58290': <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />,
  '62012': <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />,
  '62020': <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />,
  '63110': <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />,
};

const capabilityDetail: Record<string, string> = {
  '58290': 'Licensed automation scripts, workflow engines and SaaS seats with instant access.',
  '62012': 'Web apps, client portals, REST/GraphQL APIs and internal dashboards, built in fixed sprints.',
  '62020': 'CRM, webhook and payment-gateway integrations that connect the tools you already run.',
  '63110': 'Managed PostgreSQL/Supabase, cloud hosting, automated backups and uptime monitoring.',
};

const stack = ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Supabase', 'Stripe', 'REST', 'GraphQL', 'Vercel', 'Docker', 'Webhooks', 'CI/CD'];

const steps = [
  { title: 'Purchase or book', body: 'Pay online through Stripe, or reserve a sprint with a deposit.' },
  { title: 'Scope in writing', body: 'Requirements and delivery schedule confirmed within two business days.' },
  { title: 'Build & deploy', body: 'Code lands in your repository and environment, with progress updates throughout.' },
  { title: 'Accept & verify', body: 'You sign off, we issue a GPY reference with a SHA-256 fingerprint.' },
];

const guarantees = [
  { title: 'You own the code', body: 'Bespoke code transfers to you on payment, delivered into repositories you control.' },
  { title: 'Fixed, published prices', body: 'Prices are on this page. Scope changes are agreed in writing before any extra cost.' },
  { title: 'Verifiable delivery', body: 'Each accepted delivery gets a reference that partners can check independently.' },
  { title: 'Accountable UK entity', body: `${COMPANY.name}, Company No. ${COMPANY.number}, registered in England & Wales.` },
];

const faqs = [
  { q: 'How do I pay?', a: 'Licences and fixed-scope packages can be paid online by card through Stripe. Sprints can be reserved with a deposit and the balance invoiced on delivery. Prices exclude VAT where applicable.' },
  { q: 'Who owns the software you build?', a: 'Code written specifically for you becomes yours on full payment. We keep ownership of our pre-existing tools and grant you a perpetual licence to any included in your delivery.' },
  { q: 'What happens if I need to cancel?', a: 'Subscriptions can be cancelled any time. Sprint deposits are refundable if you cancel more than 5 business days before the start. Full details are in our Refund & Cancellation Policy.' },
  { q: 'What does the Verification Portal show?', a: 'Only deliveries the client has accepted and agreed to publish: a reference, a sanitized client classification, the deliverable, the acceptance date and a tamper-evident fingerprint. No personal data.' },
];

const HeroTerminal: React.FC = () => (
  <div className="relative">
    <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-accent/40 via-white/5 to-signal/30 blur-sm" />
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-obsidian-800/90 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </div>
        <span className="font-mono text-[11px] text-slate-500">sprint.log · illustrative</span>
      </div>
      <div className="space-y-2.5 p-5 font-mono text-[13px] leading-relaxed">
        {sprintLog.map((line, i) => (
          <p
            key={line.text}
            className={`animate-line-in ${line.tone === 'cmd' ? 'text-slate-200' : line.tone === 'ref' ? 'text-signal' : 'text-accent'}`}
            style={{ animationDelay: `${400 + i * 450}ms` }}
          >
            {line.text}
          </p>
        ))}
        <p className="animate-line-in text-slate-500" style={{ animationDelay: `${400 + sprintLog.length * 450}ms` }}>
          $ <span className="animate-blink inline-block h-4 w-2 translate-y-0.5 bg-slate-400" />
        </p>
      </div>
    </div>
  </div>
);

const VerifyWidget: React.FC = () => {
  const [ref, setRef] = useState('');
  const navigate = useNavigate();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = ref.trim().toUpperCase();
    navigate(value ? `/verify?ref=${encodeURIComponent(value)}` : '/verify');
  };
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:flex-row">
      <label htmlFor="home-ref" className="sr-only">Delivery reference</label>
      <input
        id="home-ref"
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        placeholder="GPY-2026-XXXX"
        spellCheck={false}
        autoComplete="off"
        className="flex-1 rounded-lg bg-transparent px-4 py-3 font-mono text-sm uppercase text-white placeholder:text-slate-600 focus:outline-none"
      />
      <button type="submit" className={btnPrimary}>Verify delivery</button>
    </form>
  );
};

const Faq: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-steel rounded-2xl border border-steel bg-white">
      {faqs.map((item, i) => (
        <div key={item.q}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-semibold text-obsidian"
            aria-expanded={open === i}
          >
            {item.q}
            <span className={`text-xl text-accent-dark transition-transform ${open === i ? 'rotate-45' : ''}`}>+</span>
          </button>
          {open === i && <p className="px-6 pb-6 text-sm leading-relaxed text-slate-600">{item.a}</p>}
        </div>
      ))}
    </div>
  );
};

const Home: React.FC = () => (
  <div>
    {/* Hero */}
    <section className="relative overflow-hidden bg-obsidian text-white">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="absolute inset-0 bg-noise-glow" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pt-36 pb-20 md:pt-44 lg:grid-cols-12 lg:pb-28">
        <div className="lg:col-span-7">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              Software Engineering & Cloud Automation Studio
            </span>
          </div>
          <h1 className="animate-fade-up mt-7 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl" style={{ animationDelay: '100ms' }}>
            Modern Software Engineering & Cloud Infrastructure for{' '}
            <span className="bg-gradient-to-r from-accent via-emerald-300 to-signal bg-clip-text text-transparent">Scalable Enterprises.</span>
          </h1>
          <p className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-slate-400" style={{ animationDelay: '200ms' }}>
            We architect custom digital systems, deploy automated business workflows, and manage high-reliability cloud data infrastructure for forward-thinking companies.
          </p>
          <div className="animate-fade-up mt-10 flex flex-col gap-4 sm:flex-row" style={{ animationDelay: '300ms' }}>
            <a href="#packages" className={`${btnPrimary} shadow-lg shadow-accent/20`}>Purchase Technical Sprints →</a>
            <Link to="/verify" className={btnSecondary}>Verify Deliverables</Link>
          </div>
        </div>
        <div className="animate-fade-up lg:col-span-5" style={{ animationDelay: '250ms' }}>
          <HeroTerminal />
        </div>
      </div>

      {/* Trust bar */}
      <div className="relative border-t border-white/10 bg-white/[0.02]">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-y-3 px-6 py-5 text-xs text-slate-400 md:grid-cols-4">
          {trustItems.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <svg className="h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* Stack marquee */}
    <section className="overflow-hidden border-b border-steel bg-white py-6" aria-label="Technologies we work with">
      <div className="flex w-max animate-marquee gap-12 pr-12">
        {[...stack, ...stack].map((tech, i) => (
          <span key={`${tech}-${i}`} className="font-mono text-sm whitespace-nowrap text-slate-400" aria-hidden={i >= stack.length}>
            {tech}
          </span>
        ))}
      </div>
    </section>

    {/* Capability bento */}
    <section className="bg-mist py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <Eyebrow>What we engineer</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-obsidian md:text-5xl">
            Four disciplines. One accountable studio.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-6">
          {SIC_CODES.map((sic, i) => (
            <Reveal key={sic.code} delay={i * 80} className={i === 0 || i === 3 ? 'md:col-span-4' : 'md:col-span-2'}>
              <Link
                to="/solutions"
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-steel bg-white p-8 transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-xl"
              >
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent/0 blur-2xl transition group-hover:bg-accent/15" />
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-obsidian text-accent">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">{icons[sic.code]}</svg>
                  </span>
                  <span className="font-mono text-xs text-slate-400">SIC {sic.code}</span>
                </div>
                <h3 className="mt-8 text-xl font-semibold text-obsidian">{sic.area}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{capabilityDetail[sic.code]}</p>
                <span className="mt-6 text-sm font-semibold text-accent-dark transition md:opacity-0 md:group-hover:opacity-100">Explore →</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Productized packages */}
    <section id="packages" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Productized services</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-obsidian md:text-5xl">Transparent pricing.<br className="hidden md:block" /> Book online.</h2>
          </div>
          <p className="max-w-sm text-sm text-slate-500">Fixed scopes with published prices. Pay by card through Stripe, or reserve a sprint with a deposit.</p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {OFFERINGS.map((offering, i) => (
            <Reveal key={offering.id} delay={i * 80} className="flex">
              <OfferingCard offering={offering} />
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-500">
          Prices exclude VAT where applicable. See our <Link to="/legal/refunds" className="underline">Refund & Cancellation Policy</Link>.
        </p>
      </div>
    </section>

    {/* Process */}
    <section className="relative overflow-hidden bg-obsidian py-24 text-white">
      <div className="absolute inset-0 bg-noise-glow opacity-60" />
      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal>
          <Eyebrow dark>How it works</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">From checkout to verified delivery.</h2>
        </Reveal>
        <div className="relative mt-16">
        <div className="absolute top-5 right-0 left-0 hidden h-px bg-gradient-to-r from-accent/60 via-white/15 to-signal/60 md:block" aria-hidden="true" />
        <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 120} className="relative">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-accent/50 bg-obsidian font-mono text-sm text-accent">
                0{i + 1}
              </span>
              <h3 className="mt-6 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
            </Reveal>
          ))}
        </ol>
        </div>
      </div>
    </section>

    {/* Guarantees */}
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <Eyebrow>Included with every delivery</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-obsidian md:text-5xl">Engineered to be trusted.</h2>
        </Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-steel bg-steel sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map((g, i) => (
            <Reveal key={g.title} delay={i * 80} className="bg-white p-8">
              <span className="font-mono text-xs text-accent-dark">0{i + 1}</span>
              <h3 className="mt-4 font-semibold text-obsidian">{g.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{g.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Verification */}
    <section className="px-6 pb-24">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-obsidian px-8 py-16 text-white md:px-16">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute inset-0 bg-noise-glow" />
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Eyebrow dark>Public verification portal</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Don’t take our word for it. Check it.</h2>
            <p className="mt-4 leading-relaxed text-slate-400">
              Compliance officers, banking partners and clients can confirm any published delivery by its reference. Every record carries a tamper-evident SHA-256 fingerprint.
            </p>
          </div>
          <div>
            <VerifyWidget />
            <p className="mt-3 font-mono text-[11px] text-slate-500">
              Company details: <a href={COMPANY.companiesHouseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Companies House #{COMPANY.number} ↗</a>
            </p>
          </div>
        </div>
      </Reveal>
    </section>

    {/* Director + FAQ */}
    <section className="bg-mist py-24">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Leadership</Eyebrow>
          <blockquote className="mt-6 text-2xl leading-snug font-medium tracking-tight text-obsidian md:text-3xl">
            “Every line of code, cloud architecture, and automation pipeline we deploy is engineered to eliminate operational friction and deliver measurable performance.”
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-obsidian text-sm font-bold text-white">LSA</span>
            <div>
              <p className="font-semibold text-obsidian">{COMPANY.director}</p>
              <p className="text-sm text-slate-500">{COMPANY.directorTitle}</p>
            </div>
          </div>
          <Link to="/company" className="mt-8 inline-block text-sm font-semibold text-accent-dark hover:underline">About the company →</Link>
        </Reveal>
        <Reveal delay={120}>
          <Eyebrow>Questions</Eyebrow>
          <div className="mt-6"><Faq /></div>
        </Reveal>
      </div>
    </section>

    {/* Final CTA */}
    <section className="relative overflow-hidden bg-obsidian py-24 text-center text-white">
      <div className="absolute inset-0 bg-noise-glow" />
      <Reveal className="relative mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-extrabold tracking-tight md:text-5xl">Ready to ship?</h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">Pick a package and start today, or tell us about a custom project.</p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/services" className={`${btnPrimary} shadow-lg shadow-accent/20`}>Explore Live Services</Link>
          <Link to="/contact" className={btnSecondary}>Start a custom project</Link>
        </div>
      </Reveal>
    </section>
  </div>
);

export default Home;
