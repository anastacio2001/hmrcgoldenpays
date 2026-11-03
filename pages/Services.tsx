import React from 'react';
import { Link } from 'react-router-dom';
import { OFFERINGS } from '../data/site';
import { OfferingCard, PageHeader } from '../components/ui';

const steps = [
  { title: 'Purchase or book', body: 'Pay securely through Stripe checkout, or request an invoice for a custom scope.' },
  { title: 'Scope confirmation', body: 'Within two business days we confirm requirements and the delivery schedule in writing.' },
  { title: 'Delivery', body: 'Work is delivered to your repository or cloud environment, with progress updates throughout.' },
  { title: 'Acceptance & record', body: 'On sign-off, a delivery reference (GPY-YYYY-XXXX) is issued and, with your consent, published to the Verification Portal.' },
];

const Services: React.FC = () => (
  <div>
    <PageHeader
      eyebrow="Productized services"
      title="Fixed scopes, published prices, online payment."
      intro="Choose a package and pay online in minutes. Every engagement ends with a documented, verifiable delivery."
    />

    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {OFFERINGS.map((offering) => (
          <OfferingCard key={offering.id} offering={offering} />
        ))}
      </div>
      <p className="mt-6 text-xs text-slate-500">
        All prices in GBP. No VAT is charged (not VAT registered). Purchases are subject to our <Link to="/legal/terms" className="underline">Terms of Service</Link> and{' '}
        <Link to="/legal/refunds" className="underline">Refund & Cancellation Policy</Link>.
      </p>
    </section>

    <section className="bg-mist py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-bold tracking-tight text-obsidian">How an engagement works</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-xl border border-steel bg-white p-6">
              <span className="font-mono text-xs text-accent-dark">0{i + 1}</span>
              <h3 className="mt-3 font-semibold text-obsidian">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  </div>
);

export default Services;
