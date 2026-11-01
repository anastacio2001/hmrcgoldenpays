import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase, VerifiedDeliverable } from '../lib/supabase';
import { COMPANY, SIC_CODES } from '../data/site';
import { PageHeader, btnPrimary } from '../components/ui';

type LookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; record: VerifiedDeliverable }
  | { status: 'not-found'; reference: string }
  | { status: 'error'; message: string };

const REFERENCE_PATTERN = /^GPY-\d{4}-[A-Z0-9]{4,12}$/;

const Field: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({ label, children, mono }) => (
  <div className="border-b border-steel py-4 last:border-0 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{label}</dt>
    <dd className={`mt-1 text-sm text-obsidian sm:col-span-2 sm:mt-0 ${mono ? 'font-mono break-all' : ''}`}>{children}</dd>
  </div>
);

const Verify: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [reference, setReference] = useState(searchParams.get('ref') ?? '');
  const [state, setState] = useState<LookupState>({ status: 'idle' });

  const lookup = async (raw: string) => {
    const ref = raw.trim().toUpperCase();
    if (!REFERENCE_PATTERN.test(ref)) {
      setState({ status: 'error', message: 'References use the format GPY-YYYY-XXXX (letters and digits).' });
      return;
    }
    if (!supabase) {
      setState({ status: 'error', message: 'The verification service is temporarily unavailable. Please contact us to confirm this reference.' });
      return;
    }

    setState({ status: 'loading' });
    setSearchParams({ ref }, { replace: true });
    const { data, error } = await supabase.rpc('verify_deliverable', { p_reference: ref });

    if (error) {
      console.error('Verification lookup failed:', error);
      setState({ status: 'error', message: 'The lookup could not be completed. Please try again shortly.' });
    } else if (!data || data.length === 0) {
      setState({ status: 'not-found', reference: ref });
    } else {
      setState({ status: 'found', record: data[0] as VerifiedDeliverable });
    }
  };

  // Support shareable links such as /verify?ref=GPY-2026-7KQ4M2
  useEffect(() => {
    const initial = searchParams.get('ref');
    if (initial) lookup(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(reference);
  };

  const sicLabel = (code: string) => SIC_CODES.find((s) => s.code === code)?.area ?? code;

  return (
    <div>
      <PageHeader
        eyebrow="Verification portal"
        title="Public Deliverable & Audit Verification"
        intro="For compliance officers, banking partners and clients. Enter a project or invoice reference to confirm a delivery accepted by GOLDENPAYS LTD."
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <label htmlFor="reference" className="sr-only">Project hash or invoice reference</label>
          <input
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Enter Project Hash or Invoice Reference (e.g., GPY-2026-XXXX)"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 rounded-md border border-steel bg-mist px-4 py-3 font-mono text-sm uppercase placeholder:normal-case placeholder:font-sans focus:border-accent focus:outline-none"
          />
          <button type="submit" disabled={state.status === 'loading'} className={`${btnPrimary} disabled:opacity-50`}>
            {state.status === 'loading' ? 'Verifying…' : 'Verify'}
          </button>
        </form>

        <div className="mt-10" aria-live="polite">
          {state.status === 'found' && (
            <div className="overflow-hidden rounded-xl border border-accent/40">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-accent/10 px-6 py-4">
                <span className="font-mono text-sm text-obsidian">{state.record.reference}</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Verified & Deployed
                </span>
              </div>
              <dl className="px-6 py-2">
                <Field label="Project identifier" mono>{state.record.reference}</Field>
                <Field label="Client classification">{state.record.client_classification}</Field>
                <Field label="Deliverable">{state.record.deliverable_summary}</Field>
                <Field label="Service area">SIC {state.record.sic_code} · {sicLabel(state.record.sic_code)}</Field>
                <Field label="Date of acceptance">
                  {new Date(state.record.accepted_on).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                </Field>
                <Field label="Approved by">{state.record.approved_by}</Field>
                <Field label="Record fingerprint (SHA-256)" mono>{state.record.fingerprint}</Field>
              </dl>
            </div>
          )}

          {state.status === 'not-found' && (
            <div className="rounded-xl border border-steel bg-mist p-6">
              <p className="font-semibold text-obsidian">No published record matches <span className="font-mono">{state.reference}</span>.</p>
              <p className="mt-2 text-sm text-slate-600">
                Check the reference for typing errors. Some deliveries are not published at the client's request; to confirm one privately, contact{' '}
                <a href={`mailto:${COMPANY.email}`} className="text-accent-dark underline">{COMPANY.email}</a>.
              </p>
            </div>
          )}

          {state.status === 'error' && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">{state.message}</div>
          )}
        </div>

        <div className="mt-16 grid gap-6 border-t border-steel pt-10 text-sm text-slate-600 md:grid-cols-2">
          <div>
            <h2 className="font-semibold text-obsidian">What is published</h2>
            <p className="mt-2 leading-relaxed">
              Only deliveries formally accepted by the client, and only with the client's consent. Client identities are replaced by a sanitized classification.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-obsidian">About the fingerprint</h2>
            <p className="mt-2 leading-relaxed">
              The SHA-256 fingerprint is computed from the published fields. It changes if any field is altered, so it can be matched against the copy issued with the delivery.
            </p>
          </div>
        </div>
        <p className="mt-10 text-sm text-slate-500">
          Company details can be confirmed independently on{' '}
          <a href={COMPANY.companiesHouseUrl} target="_blank" rel="noopener noreferrer" className="text-accent-dark underline">Companies House</a>.
          Questions? <Link to="/contact" className="text-accent-dark underline">Contact us</Link>.
        </p>
      </section>
    </div>
  );
};

export default Verify;
