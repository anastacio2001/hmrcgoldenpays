import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { supabase, VerifiedDeliverable } from '../lib/supabase';
import { COMPANY, SIC_CODES } from '../data/site';
import { PageHeader, btnPrimary } from '../components/ui';
import { findDossierByReference } from '../lib/generatorEngine';
import { AuditDossier } from '../types/generator';
import { PublicVerificationDocument } from './admin/generator/PublicVerificationDocument';

type LookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; record: VerifiedDeliverable }
  | { status: 'dossier-found'; dossier: AuditDossier }
  | { status: 'not-found'; reference: string }
  | { status: 'error'; message: string };

// Accepts GPY-YYYY-XXXX, GPY-YYYYMM-XXXX, or any alphanumeric code format
const REFERENCE_PATTERN = /^GPY-[\d]{4,6}-[A-Z0-9]{3,16}$/i;

const Field: React.FC<{ label: string; children: React.ReactNode; mono?: boolean }> = ({ label, children, mono }) => (
  <div className="border-b border-steel py-4 last:border-0 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{label}</dt>
    <dd className={`mt-1 text-sm text-obsidian sm:col-span-2 sm:mt-0 ${mono ? 'font-mono break-all' : ''}`}>{children}</dd>
  </div>
);

const Verify: React.FC = () => {
  const { ref: pathRef } = useParams<{ ref?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRef = pathRef || searchParams.get('ref') || '';
  const [reference, setReference] = useState(initialRef);
  const [state, setState] = useState<LookupState>({ status: 'idle' });

  const lookup = async (raw: string) => {
    const ref = raw.trim().toUpperCase();
    if (!REFERENCE_PATTERN.test(ref)) {
      setState({ status: 'error', message: 'References use the format GPY-YYYY-XXXX or GPY-YYYYMM-XXXX (letters and digits).' });
      return;
    }

    setState({ status: 'loading' });
    setSearchParams({ ref }, { replace: true });

    // 1. Check generated compliance dossiers
    const localMatch = findDossierByReference(ref);
    if (localMatch) {
      setState({ status: 'dossier-found', dossier: localMatch });
      return;
    }

    // 2. Query Supabase RPC if available
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('verify_deliverable', { p_reference: ref });
        if (!error && data && data.length > 0) {
          setState({ status: 'found', record: data[0] as VerifiedDeliverable });
          return;
        }
      } catch (err) {
        console.warn('Supabase lookup attempt:', err);
      }
    }

    setState({ status: 'not-found', reference: ref });
  };

  useEffect(() => {
    if (initialRef) lookup(initialRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRef]);

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

      <section className="mx-auto max-w-4xl px-6 py-12">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row no-print">
          <label htmlFor="reference" className="sr-only">Project hash or invoice reference</label>
          <input
            id="reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Enter Project Hash or Invoice Reference (e.g., GPY-202611-XXXX)"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 rounded-md border border-steel bg-mist px-4 py-3 font-mono text-sm uppercase placeholder:normal-case placeholder:font-sans focus:border-accent focus:outline-none"
          />
          <button type="submit" disabled={state.status === 'loading'} className={`${btnPrimary} disabled:opacity-50`}>
            {state.status === 'loading' ? 'Verifying…' : 'Verify'}
          </button>
        </form>

        <div className="mt-8" aria-live="polite">
          {/* Detailed Compliance Showcase Document */}
          {state.status === 'dossier-found' && (
            <div className="space-y-4">
              <div className="no-print flex justify-end">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  🖨️ Print / Save Verification PDF
                </button>
              </div>
              <PublicVerificationDocument dossier={state.dossier} />
            </div>
          )}

          {state.status === 'found' && (
            <div className="overflow-hidden rounded-xl border border-accent/40 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-accent/10 px-6 py-4">
                <span className="font-mono text-sm font-bold text-obsidian">{state.record.reference}</span>
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

        <div className="mt-16 grid gap-6 border-t border-steel pt-10 text-sm text-slate-600 md:grid-cols-2 no-print">
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
        <p className="mt-10 text-sm text-slate-500 no-print">
          Company details can be confirmed independently on{' '}
          <a href={COMPANY.companiesHouseUrl} target="_blank" rel="noopener noreferrer" className="text-accent-dark underline">Companies House</a>.
          Questions? <Link to="/contact" className="text-accent-dark underline">Contact us</Link>.
        </p>
      </section>
    </div>
  );
};

export default Verify;
