import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANY, OFFERINGS, SIC_CODES } from '../data/site';
import { Eyebrow, OfferingCard, btnPrimary, btnSecondary, btnOutline } from '../components/ui';

const trustItems = [
  `UK Registered Entity (#${COMPANY.number})`,
  'Manchester Office',
  'Direct Stripe Integration',
  'Micro-entity Compliant',
];

const Home: React.FC = () => (
  <div>
    {/* Hero */}
    <section className="relative overflow-hidden bg-obsidian bg-grid text-white">
      <div className="pointer-events-none absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-accent/20 blur-[120px]" />
      <div className="relative mx-auto max-w-6xl px-6 pt-40 pb-24 md:pt-48 md:pb-32">
        <Eyebrow dark>Software Engineering & Cloud Automation Studio</Eyebrow>
        <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl">
          Modern Software Engineering & Cloud Infrastructure for Scalable Enterprises.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
          We architect custom digital systems, deploy automated business workflows, and manage high-reliability cloud data infrastructure for forward-thinking companies.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a href="#packages" className={btnPrimary}>Purchase Technical Sprints</a>
          <Link to="/verify" className={btnSecondary}>Verify Deliverables</Link>
        </div>
      </div>

      {/* Trust bar */}
      <div className="relative border-t border-white/10 bg-white/[0.02]">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-y-3 px-6 py-5 text-xs text-slate-400 md:grid-cols-4">
          {trustItems.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* Capability areas */}
    <section className="bg-mist py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Eyebrow>What we do</Eyebrow>
        <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-obsidian md:text-4xl">
          Four engineering disciplines, one accountable studio.
        </h2>
        <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-steel bg-steel md:grid-cols-2">
          {SIC_CODES.map((sic) => (
            <div key={sic.code} className="bg-white p-8">
              <span className="font-mono text-xs text-accent-dark">SIC {sic.code}</span>
              <h3 className="mt-3 text-xl font-semibold text-obsidian">{sic.area}</h3>
              <p className="mt-2 text-sm text-slate-500">{sic.label}</p>
            </div>
          ))}
        </div>
        <Link to="/solutions" className="mt-8 inline-block text-sm font-semibold text-accent-dark hover:underline">
          Explore our solutions →
        </Link>
      </div>
    </section>

    {/* Productized packages */}
    <section id="packages" className="scroll-mt-20 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Productized services</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-obsidian md:text-4xl">Transparent pricing. Book online.</h2>
          </div>
          <Link to="/services" className="text-sm font-semibold text-accent-dark hover:underline">Full service details →</Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {OFFERINGS.map((offering) => (
            <OfferingCard key={offering.id} offering={offering} />
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-500">
          Prices exclude VAT where applicable. See our <Link to="/legal/refunds" className="underline">Refund & Cancellation Policy</Link>.
        </p>
      </div>
    </section>

    {/* Verification portal teaser */}
    <section className="bg-obsidian py-24 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
        <div>
          <Eyebrow dark>Public verification</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Every accepted delivery is independently verifiable.</h2>
          <p className="mt-5 leading-relaxed text-slate-400">
            Compliance officers, banking partners and clients can confirm a project delivery using its reference number. Each record carries a tamper-evident SHA-256 fingerprint.
          </p>
          <Link to="/verify" className={`${btnPrimary} mt-8`}>Open Verification Portal</Link>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 font-mono text-sm">
          <p className="text-slate-500">$ verify --ref GPY-2026-XXXX</p>
          <p className="mt-4 text-slate-300">Looks up a single published record:</p>
          <ul className="mt-2 space-y-1 text-slate-400">
            <li>· project identifier</li>
            <li>· client classification (sanitized)</li>
            <li>· technical deliverable summary</li>
            <li>· date of acceptance</li>
            <li>· director approval & fingerprint</li>
          </ul>
        </div>
      </div>
    </section>

    {/* Director */}
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Eyebrow>Leadership</Eyebrow>
        <blockquote className="mt-6 text-xl leading-relaxed text-obsidian md:text-2xl">
          “Modern enterprise efficiency requires software solutions built with engineering precision and long-term systemic durability.”
        </blockquote>
        <p className="mt-6 text-sm font-semibold text-obsidian">{COMPANY.director}</p>
        <p className="text-sm text-slate-500">{COMPANY.directorTitle}</p>
        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/company" className={btnOutline}>About the company</Link>
          <Link to="/contact" className={btnPrimary}>Start a project</Link>
        </div>
      </div>
    </section>
  </div>
);

export default Home;
