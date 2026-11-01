import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANY, SIC_CODES } from '../data/site';
import { Eyebrow, PageHeader, btnPrimary } from '../components/ui';

const principles = [
  { title: 'Engineering precision', body: 'Typed, documented codebases delivered into repositories you own.' },
  { title: 'Systemic durability', body: 'Architectures designed to be maintained and extended for years, not rebuilt.' },
  { title: 'Documented delivery', body: 'Every accepted delivery is recorded with a reference and a verifiable fingerprint.' },
];

const Company: React.FC = () => (
  <div>
    <PageHeader
      eyebrow="Company"
      title="A UK software engineering studio, accountable by design."
      intro={`${COMPANY.name} is a private limited company registered in England & Wales, operating from Manchester.`}
    />

    {/* Director profile */}
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex aspect-square max-w-xs items-center justify-center rounded-xl bg-obsidian bg-grid">
            <span className="text-5xl font-extrabold tracking-tight text-white">LSA</span>
          </div>
        </div>
        <div className="md:col-span-8">
          <Eyebrow>Director & governance</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-obsidian">{COMPANY.director}</h2>
          <p className="mt-1 text-slate-500">{COMPANY.directorTitle}</p>
          <p className="mt-6 leading-relaxed text-slate-700">
            Background in Economics & Business Administration, with specialization in Digital Transformation and Systems Architecture.
          </p>
          <blockquote className="mt-8 border-l-2 border-accent pl-6 text-lg leading-relaxed text-obsidian">
            “Modern enterprise efficiency requires software solutions built with engineering precision and long-term systemic durability. Every line of code, cloud architecture, and automation pipeline we deploy is engineered to eliminate operational friction and deliver measurable performance.”
          </blockquote>
        </div>
      </div>
    </section>

    <section className="bg-mist py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-bold tracking-tight text-obsidian">How we work</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {principles.map((p) => (
            <div key={p.title} className="rounded-xl border border-steel bg-white p-7">
              <h3 className="font-semibold text-obsidian">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Corporate register */}
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-2xl font-bold tracking-tight text-obsidian">Corporate information</h2>
      <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border border-steel bg-steel text-sm md:grid-cols-2">
        {[
          ['Legal name', COMPANY.name],
          ['Company number', COMPANY.number],
          ['Jurisdiction', COMPANY.jurisdiction],
          ['Registered office', COMPANY.office],
          ['Director', `${COMPANY.director}, ${COMPANY.directorTitle}`],
          ['Contact', COMPANY.email],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-6">
            <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{label}</dt>
            <dd className={`mt-1 text-obsidian ${label === 'Company number' ? 'font-mono' : ''}`}>{value}</dd>
          </div>
        ))}
        <div className="bg-white p-6 md:col-span-2">
          <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Registered SIC codes</dt>
          <dd className="mt-2 grid gap-2 sm:grid-cols-2">
            {SIC_CODES.map((sic) => (
              <span key={sic.code} className="text-obsidian"><span className="font-mono text-accent-dark">{sic.code}</span> · {sic.label}</span>
            ))}
          </dd>
        </div>
      </dl>
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <a href={COMPANY.companiesHouseUrl} target="_blank" rel="noopener noreferrer" className={btnPrimary}>Verify on Companies House ↗</a>
        <Link to="/verify" className="inline-flex items-center px-2 text-sm font-semibold text-accent-dark hover:underline">Verify a project delivery →</Link>
      </div>
    </section>
  </div>
);

export default Company;
