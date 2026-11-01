import React from 'react';
import { Link } from 'react-router-dom';
import { Offering, offeringHref } from '../data/site';

/** Renders a router Link for internal paths and a plain anchor for external URLs. */
export const SmartLink: React.FC<{ to: string; className?: string; children: React.ReactNode }> = ({ to, className, children }) =>
  /^https?:\/\//.test(to) ? (
    <a href={to} className={className} target="_blank" rel="noopener noreferrer">{children}</a>
  ) : (
    <Link to={to} className={className}>{children}</Link>
  );

export const Eyebrow: React.FC<{ children: React.ReactNode; dark?: boolean }> = ({ children, dark }) => (
  <span className={`inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] ${dark ? 'text-accent' : 'text-accent-dark'}`}>
    <span className="h-px w-6 bg-current" />
    {children}
  </span>
);

export const PageHeader: React.FC<{ eyebrow: string; title: string; intro?: string }> = ({ eyebrow, title, intro }) => (
  <header className="bg-obsidian bg-grid pt-36 pb-20 text-white">
    <div className="mx-auto max-w-6xl px-6">
      <Eyebrow dark>{eyebrow}</Eyebrow>
      <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
      {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">{intro}</p>}
    </div>
  </header>
);

export const SicBadge: React.FC<{ code: string }> = ({ code }) => (
  <span className="rounded border border-steel bg-mist px-2 py-0.5 font-mono text-[11px] text-slate-500">SIC {code}</span>
);

export const btnPrimary =
  'inline-flex items-center justify-center rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';
export const btnSecondary =
  'inline-flex items-center justify-center rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10';
export const btnOutline =
  'inline-flex items-center justify-center rounded-md border border-obsidian px-6 py-3 text-sm font-semibold text-obsidian transition hover:bg-obsidian hover:text-white';

export const OfferingCard: React.FC<{ offering: Offering }> = ({ offering }) => (
  <article className="flex flex-col rounded-xl border border-steel bg-white p-7 transition hover:border-accent/60 hover:shadow-lg">
    <div className="flex items-center justify-between">
      <SicBadge code={offering.sic} />
      {offering.checkoutUrl && (
        <span className="font-mono text-[11px] uppercase tracking-wider text-accent-dark">Online checkout</span>
      )}
    </div>
    <h3 className="mt-5 text-lg font-semibold text-obsidian">{offering.title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-slate-600">{offering.description}</p>
    <p className="mt-6">
      <span className="text-3xl font-bold tracking-tight text-obsidian">{offering.price}</span>
      <span className="ml-1 text-sm text-slate-500">{offering.priceNote}</span>
    </p>
    <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-600">
      {offering.includes.map((item) => (
        <li key={item} className="flex gap-2">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {item}
        </li>
      ))}
    </ul>
    <SmartLink to={offeringHref(offering)} className={`${btnPrimary} mt-8 w-full`}>
      {offering.cta}
    </SmartLink>
  </article>
);
