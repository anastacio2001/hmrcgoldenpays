import React from 'react';
import { Link } from 'react-router-dom';
import { OFFERINGS, offeringHref } from '../data/site';
import { PageHeader, SicBadge, SmartLink, btnPrimary, btnOutline } from '../components/ui';

const licence = OFFERINGS.find((o) => o.id === 'licence')!;

const categories = [
  { title: 'Automation Scripts', body: 'Licensed scripts that automate recurring operational tasks: data syncs, report generation, scheduled exports and notifications.' },
  { title: 'Workflow Engines', body: 'Multi-tenant engines for approvals, routing and event-driven business processes, deployable on our cloud or yours.' },
  { title: 'Platform Seats', body: 'Per-user access to GOLDENPAYS-hosted SaaS tooling, billed monthly with seat management.' },
];

const plans = [
  { name: 'Subscription', price: '£49', unit: '/ month', points: ['Hosted access', 'All updates while subscribed', 'Cancel any time'], primary: true },
  { name: 'Perpetual licence', price: '£199', unit: 'one-off', points: ['One-off payment', 'Self-hosted deployment', 'Licence never expires'], primary: false },
];

const SaasCatalog: React.FC = () => (
  <div>
    <PageHeader
      eyebrow="SaaS catalog"
      title="Proprietary platforms and digital tooling."
      intro="Software published by GOLDENPAYS LTD, available as a monthly subscription or a perpetual licence with instant access after checkout."
    />

    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex items-center gap-3">
        <SicBadge code={licence.sic} />
        <span className="text-sm text-slate-500">Other software publishing</span>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {categories.map((cat) => (
          <article key={cat.title} className="rounded-xl border border-steel p-7">
            <h2 className="text-lg font-semibold text-obsidian">{cat.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{cat.body}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="bg-mist py-20">
      <div className="mx-auto max-w-4xl px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-obsidian">Licensing options</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-xl border bg-white p-8 ${plan.primary ? 'border-accent shadow-lg' : 'border-steel'}`}>
              <h3 className="font-semibold text-obsidian">{plan.name}</h3>
              <p className="mt-4">
                <span className="text-4xl font-bold tracking-tight text-obsidian">{plan.price}</span>
                <span className="ml-1 text-sm text-slate-500">{plan.unit}</span>
              </p>
              <ul className="mt-6 space-y-2 text-sm text-slate-600">
                {plan.points.map((p) => <li key={p}>· {p}</li>)}
              </ul>
              <SmartLink to={offeringHref(licence)} className={`${plan.primary ? btnPrimary : btnOutline} mt-8 w-full`}>
                {licence.cta}
              </SmartLink>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">
          Need a team or enterprise licence? <Link to="/contact?package=licence" className="font-semibold text-accent-dark hover:underline">Contact us</Link>.
        </p>
      </div>
    </section>
  </div>
);

export default SaasCatalog;
