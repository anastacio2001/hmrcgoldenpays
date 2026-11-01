import React from 'react';
import { Link } from 'react-router-dom';
import { OFFERINGS, SIC_CODES, offeringHref } from '../data/site';
import { PageHeader, SicBadge, SmartLink, btnPrimary } from '../components/ui';

const capabilities: Record<string, string[]> = {
  '58290': ['Multi-tenant workflow engines', 'Proprietary automation script libraries', 'SaaS platform seats and licence management', 'Versioned releases and update channels'],
  '62012': ['Web applications and client portals', 'REST and GraphQL APIs', 'Internal dashboards and admin tooling', 'TypeScript, React and Node.js stacks'],
  '62020': ['Systems architecture reviews', 'CRM and ERP integrations', 'Payment gateway and webhook pipelines', 'Third-party enterprise tool connectors'],
  '63110': ['PostgreSQL and Supabase databases', 'Cloud hosting provisioning', 'Automated backup and retention policies', 'Uptime monitoring and alerting'],
};

const Solutions: React.FC = () => (
  <div>
    <PageHeader
      eyebrow="Solutions"
      title="Engineering capabilities mapped to our registered activities."
      intro="Each discipline below corresponds to one of GOLDENPAYS LTD's registered UK SIC codes, and each has a productized entry point you can purchase online."
    />

    <div className="mx-auto max-w-6xl space-y-6 px-6 py-20">
      {SIC_CODES.map((sic) => {
        const offering = OFFERINGS.find((o) => o.sic === sic.code)!;
        return (
          <section key={sic.code} className="grid gap-8 rounded-xl border border-steel p-8 md:grid-cols-12 md:p-10">
            <div className="md:col-span-5">
              <SicBadge code={sic.code} />
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-obsidian">{sic.area}</h2>
              <p className="mt-2 text-sm text-slate-500">{sic.label}</p>
            </div>
            <div className="md:col-span-7">
              <ul className="grid gap-3 sm:grid-cols-2">
                {capabilities[sic.code].map((item) => (
                  <li key={item} className="rounded-md bg-mist px-4 py-3 text-sm text-slate-700">{item}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <SmartLink to={offeringHref(offering)} className={btnPrimary}>{offering.cta}</SmartLink>
                <span className="text-sm text-slate-500">{offering.price} {offering.priceNote}</span>
              </div>
            </div>
          </section>
        );
      })}

      <p className="pt-6 text-sm text-slate-500">
        Need something outside these packages? <Link to="/contact" className="font-semibold text-accent-dark hover:underline">Request a custom scope</Link>.
      </p>
    </div>
  </div>
);

export default Solutions;
