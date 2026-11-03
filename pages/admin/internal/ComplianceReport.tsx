import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Deliverable, Payment } from '../../../lib/supabase';
import { COMPANY, SIC_CODES } from '../../../data/site';
import { ErrorBox, Spinner, btn, btnGhost, formatDate, formatGbp, inputClass } from '../ui';

interface ReportData {
  deliverables: Deliverable[];
  payments: Payment[];
  activeClients: number;
  totalClients: number;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="mt-8 break-inside-avoid">
    <h2 className="border-b border-steel pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">{title}</h2>
    <div className="mt-4">{children}</div>
  </section>
);

// Printable company verification pack. Use the browser's "Save as PDF".
const ComplianceReport: React.FC = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [includeFinancials, setIncludeFinancials] = useState(true);
  const [includePrivate, setIncludePrivate] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [d, p, c, a] = await Promise.all([
        supabase!.from('deliverables').select('*').order('accepted_on', { ascending: false }),
        supabase!.from('payments').select('*').eq('status', 'paid'),
        supabase!.from('clients').select('*', { count: 'exact', head: true }),
        supabase!.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ]);
      if (d.error || p.error || c.error || a.error) setError('Could not load report data.');
      else setData({ deliverables: d.data as Deliverable[], payments: p.data as Payment[], totalClients: c.count ?? 0, activeClients: a.count ?? 0 });
    };
    load();
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!data) return <Spinner />;

  const deliverables = data.deliverables.filter((d) => includePrivate || d.is_public);
  const yearPayments = data.payments.filter((p) => p.paid_on?.startsWith(String(year)));
  const yearIncome = yearPayments.reduce((s, p) => s + Number(p.amount_gbp) + Number(p.vat_gbp), 0);
  const bySic = SIC_CODES.map((sic) => ({ ...sic, count: deliverables.filter((d) => d.sic_code === sic.code).length }));
  const generated = new Date().toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/London' });

  return (
    <div>
      {/* Controls (hidden when printing) */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-steel bg-white p-5 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-5 text-sm text-slate-700">
          <Link to="/admin/compliance" className="text-accent-dark hover:underline">← Compliance</Link>
          <label className="flex items-center gap-2">Year
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className={`${inputClass} w-24`} />
          </label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={includeFinancials} onChange={(e) => setIncludeFinancials(e.target.checked)} className="accent-accent" /> Include income figures</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={includePrivate} onChange={(e) => setIncludePrivate(e.target.checked)} className="accent-accent" /> Include unpublished deliveries</label>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className={btn}>Print / Save as PDF</button>
        </div>
      </div>

      {/* The pack */}
      <article className="mx-auto max-w-3xl rounded-xl border border-steel bg-white p-10 text-sm text-slate-700 print:max-w-none print:rounded-none print:border-0 print:p-0">
        <header className="flex items-start justify-between gap-6 border-b-2 border-obsidian pb-6">
          <div>
            <p className="text-lg font-extrabold tracking-tight text-obsidian">GP | GOLDENPAYS LTD</p>
            <p className="text-slate-500">Software Engineering & Cloud Automation Studio</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p className="font-mono uppercase tracking-wider">Company verification pack</p>
            <p>Generated {generated}</p>
          </div>
        </header>

        <Section title="Legal entity">
          <dl className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
            {[
              ['Registered name', COMPANY.name],
              ['Company number', COMPANY.number],
              ['Jurisdiction', COMPANY.jurisdiction],
              ['Registered office', COMPANY.office],
              ['Director', `${COMPANY.director}, ${COMPANY.directorTitle}`],
              ['Contact', COMPANY.email],
              ['Website', 'https://goldenpays.uk'],
              ['VAT', 'Not VAT registered'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="text-obsidian">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-slate-500">Independently verifiable at {COMPANY.companiesHouseUrl}</p>
        </Section>

        <Section title="Registered business activities (SIC 2007)">
          <table className="w-full">
            <tbody className="divide-y divide-steel">
              {bySic.map((sic) => (
                <tr key={sic.code}>
                  <td className="py-2 pr-4 font-mono text-obsidian">{sic.code}</td>
                  <td className="py-2 pr-4">{sic.label}<span className="block text-xs text-slate-500">{sic.area}</span></td>
                  <td className="py-2 text-right text-xs text-slate-500">{sic.count} recorded deliver{sic.count === 1 ? 'y' : 'ies'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Trading summary">
          <dl className="grid gap-4 sm:grid-cols-3 print:grid-cols-3">
            <div><dt className="text-xs text-slate-500">Active clients</dt><dd className="text-xl font-bold text-obsidian">{data.activeClients}</dd><dd className="text-xs text-slate-500">of {data.totalClients} on record</dd></div>
            <div><dt className="text-xs text-slate-500">Accepted deliveries</dt><dd className="text-xl font-bold text-obsidian">{deliverables.length}</dd><dd className="text-xs text-slate-500">{includePrivate ? 'incl. unpublished' : 'publicly verifiable'}</dd></div>
            <div><dt className="text-xs text-slate-500">Payments received {year}</dt><dd className="text-xl font-bold text-obsidian">{includeFinancials ? formatGbp(yearIncome) : yearPayments.length}</dd><dd className="text-xs text-slate-500">{includeFinancials ? `${yearPayments.length} payments` : 'payments (amounts withheld)'}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-slate-500">Card payments are processed by Stripe. Figures are taken from the company's internal records on the date generated.</p>
        </Section>

        <Section title="Verified project deliveries">
          {deliverables.length === 0 ? (
            <p className="text-slate-500">No deliveries recorded yet.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="text-left text-slate-500">
                <tr><th className="py-2 pr-3">Reference</th><th className="py-2 pr-3">Deliverable</th><th className="py-2 pr-3">Client (sanitized)</th><th className="py-2 pr-3">SIC</th><th className="py-2">Accepted</th></tr>
              </thead>
              <tbody className="divide-y divide-steel">
                {deliverables.map((d) => (
                  <tr key={d.id} className="break-inside-avoid align-top">
                    <td className="py-2 pr-3 font-mono text-obsidian">{d.reference}{!d.is_public && <span className="block text-[10px] text-slate-400">unpublished</span>}</td>
                    <td className="py-2 pr-3">{d.deliverable_summary}<span className="block break-all font-mono text-[9px] text-slate-400">SHA-256 {d.fingerprint}</span></td>
                    <td className="py-2 pr-3">{d.client_classification}</td>
                    <td className="py-2 pr-3 font-mono">{d.sic_code}</td>
                    <td className="py-2 whitespace-nowrap">{formatDate(d.accepted_on)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-4 text-xs text-slate-500">Published references can be checked independently at https://goldenpays.uk/verify</p>
        </Section>

        <Section title="Declaration">
          <p>I confirm that the information in this pack is accurate and taken from the records of {COMPANY.name} on the date shown.</p>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 print:grid-cols-2">
            <div className="border-t border-slate-400 pt-2 text-xs text-slate-500">{COMPANY.director}, {COMPANY.directorTitle}</div>
            <div className="border-t border-slate-400 pt-2 text-xs text-slate-500">Date</div>
          </div>
        </Section>
      </article>

      <div className="mt-6 text-center print:hidden">
        <button onClick={() => window.print()} className={btnGhost}>Print / Save as PDF</button>
      </div>
    </div>
  );
};

export default ComplianceReport;
