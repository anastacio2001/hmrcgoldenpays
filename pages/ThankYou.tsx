import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANY } from '../data/site';
import { btnPrimary, btnSecondary } from '../components/ui';

// Stripe Payment Links redirect here after a successful payment.
const ThankYou: React.FC = () => (
  <div className="flex min-h-[80vh] items-center justify-center bg-obsidian bg-grid px-6 pt-24 text-center text-white">
    <div className="max-w-xl">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight md:text-4xl">Payment received. Thank you.</h1>
      <p className="mt-4 leading-relaxed text-slate-400">
        Stripe has emailed your receipt. We will contact you within 2 business days to confirm scope and next steps.
        For anything urgent, email <a href={`mailto:${COMPANY.email}`} className="text-accent underline">{COMPANY.email}</a>.
      </p>
      <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
        <Link to="/" className={btnPrimary}>Back to home</Link>
        <Link to="/legal/refunds" className={btnSecondary}>Refund & Cancellation Policy</Link>
      </div>
    </div>
  </div>
);

export default ThankYou;
