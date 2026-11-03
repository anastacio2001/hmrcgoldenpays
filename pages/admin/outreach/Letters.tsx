import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { supabase, Lead, LeadSearch } from '../../../lib/supabase';
import { displayCompanyName } from '../../../lib/outreach';
import { COMPANY } from '../../../data/site';
import { Card, Empty, ErrorBox, btn, btnGhost, inputClass, labelClass } from '../ui';

export const letterRef = (lead: Lead) => `L-${lead.company_number}`;
export const responseUrl = (lead: Lead, search?: LeadSearch) =>
  `https://goldenpays.uk/contact?ref=${letterRef(lead)}${search?.offering ? `&package=${search.offering}` : ''}`;

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const titleCase = (s: string) => s.toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (m) => m.toUpperCase());

// `body` replaces the sector template with an approved AI-written letter (paragraphs separated by blank lines).
export const Letter: React.FC<{ lead: Lead; search?: LeadSearch; qr: string; body?: string | null }> = ({ lead, search, qr, body }) => {
  const company = displayCompanyName(lead.company_name);
  const director = lead.contact_name ?? lead.directors[0];
  const topic = search?.pain_topic ?? 'manual admin';
  const addressLines = (lead.address ?? '').split(',').map((l) => l.trim()).filter(Boolean);
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <article className="mx-auto mb-8 flex min-h-[297mm] w-[210mm] max-w-full flex-col bg-white px-[20mm] pt-[15mm] pb-[12mm] text-[10.5pt] leading-relaxed text-slate-800 shadow print:mb-0 print:shadow-none print:break-after-page">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-[13pt] font-extrabold tracking-tight text-obsidian">GP | GOLDENPAYS LTD</p>
          <p className="text-[8.5pt] text-slate-500">Software Engineering &amp; Cloud Automation Studio</p>
        </div>
        <p className="text-right text-[8.5pt] text-slate-500">{COMPANY.officeLines.map((l) => <span key={l} className="block">{l}</span>)}{COMPANY.email}</p>
      </header>

      {/* Positioned for a DL / C5 window envelope */}
      <address className="mt-[18mm] min-h-[30mm] not-italic">
        {director ? <span className="block">FAO {director}</span> : <span className="block">FAO The Director</span>}
        <span className="block font-semibold">{lead.company_name}</span>
        {addressLines.map((l) => <span key={l} className="block">{l}</span>)}
      </address>

      <p className="mt-6 text-right">{date}</p>

      <p className="mt-6">Dear {director ? titleCase(director) : 'Director'},</p>
      <p className="mt-4 font-semibold text-obsidian">{topic.charAt(0).toUpperCase() + topic.slice(1)} at {company}: a fixed-price fix</p>

      {body ? body.split(/\n\s*\n/).map((para, i) => <p key={i} className={i === 0 ? 'mt-4' : 'mt-3'}>{para.trim()}</p>) : (<>
      <p className="mt-4">
        I am writing because {(search?.segment ?? 'UK').toLowerCase()} businesses{lead.locality ? ` in ${titleCase(lead.locality)}` : ''} keep telling us the same thing: {lowerFirst(search?.pain_point ?? 'too much of the week goes on manual admin between disconnected tools.')}
      </p>
      <p className="mt-3">
        {COMPANY.name} is a Manchester software engineering studio. {search?.pitch ?? 'We automate the repetitive parts with a fixed-price build.'} The price is fixed and published, the work takes days rather than months, and the code belongs to you.
      </p>
      <p className="mt-3">
        I would like to offer {company} a <b>free 20-minute automation check</b>. I will look at how you currently handle {topic} and tell you, in writing, what could be automated and what it would cost. If it is not worth doing, I will say so.
      </p>
      </>)}

      <div className="mt-5 flex items-center gap-5 rounded-lg border border-steel p-4">
        <img src={qr} alt="" className="h-[26mm] w-[26mm]" />
        <p className="text-[9.5pt]">
          Scan the code, or visit <b>goldenpays.uk/contact</b> and quote reference <span className="font-mono font-semibold">{letterRef(lead)}</span>.
          You can also reply to <b>{COMPANY.email}</b>.
        </p>
      </div>

      <p className="mt-6">Yours sincerely,</p>
      <p className="mt-10 font-semibold text-obsidian">{COMPANY.director}</p>
      <p className="text-slate-500">{COMPANY.directorTitle}, {COMPANY.name}</p>

      <footer className="mt-auto border-t border-steel pt-3 text-[7.5pt] text-slate-500">
        {COMPANY.name} · Company No. {COMPANY.number} · {COMPANY.jurisdiction} · Registered office: {COMPANY.office}.
        We found your company on the public Companies House register. If you would prefer not to hear from us, email {COMPANY.email} with "STOP {letterRef(lead)}" and we will not contact you again.
        Privacy notice: goldenpays.uk/legal/privacy
      </footer>
    </article>
  );
};

const Letters: React.FC<{ searches: LeadSearch[]; onPrintMode: (on: boolean) => void }> = ({ searches, onPrintMode }) => {
  const [searchId, setSearchId] = useState('all');
  const [count, setCount] = useState('20');
  const [batch, setBatch] = useState<{ lead: Lead; qr: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const byId = Object.fromEntries(searches.map((s) => [s.id, s]));

  useEffect(() => onPrintMode(batch.length > 0), [batch, onPrintMode]);

  const prepare = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    const [lettered, suppressed] = await Promise.all([
      supabase!.from('lead_activities').select('lead_id').eq('channel', 'letter'),
      supabase!.from('suppressions').select('company_number').not('company_number', 'is', null),
    ]);
    const skip = new Set([...(lettered.data ?? []).map((a) => a.lead_id)]);
    const blocked = new Set((suppressed.data ?? []).map((s) => s.company_number));
    let q = supabase!.from('leads').select('*').in('status', ['new', 'qualified']).not('address', 'is', null).order('created_at').limit(500);
    if (searchId !== 'all') q = q.eq('search_id', searchId);
    const { data, error } = await q;
    if (error) {
      setBusy(false);
      setError('Could not load leads.');
      return;
    }
    const prio = (l: Lead) => byId[l.search_id ?? '']?.priority ?? 9;
    const picked = (data as Lead[])
      .filter((l) => !skip.has(l.id) && !blocked.has(l.company_number))
      .sort((a, b) => prio(a) - prio(b))
      .slice(0, Number(count));
    const withQr = await Promise.all(picked.map(async (lead) => ({
      lead,
      qr: await QRCode.toDataURL(responseUrl(lead, byId[lead.search_id ?? '']), { margin: 0, width: 300 }),
    })));
    setBatch(withQr);
    setBusy(false);
    if (withQr.length === 0) setMessage('No leads left to write to for this selection.');
  };

  const markPosted = async () => {
    const rows = batch.map(({ lead }) => ({ lead_id: lead.id, channel: 'letter', outcome: 'posted', notes: `Letter ${letterRef(lead)}` }));
    const { error } = await supabase!.from('lead_activities').insert(rows);
    if (error) {
      setError('Could not record the letters.');
      return;
    }
    await supabase!.from('leads').update({ status: 'contacted', last_contacted_at: new Date().toISOString() }).in('id', batch.map((b) => b.lead.id));
    setMessage(`${batch.length} letters recorded as posted. Responses quoting their L- reference will show which letters worked.`);
    setBatch([]);
  };

  return (
    <div>
      <div className="print:hidden">
        {error && <ErrorBox message={error} />}
        {message && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}
        <Card className="mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className={labelClass}>Write to leads from</label>
            <select value={searchId} onChange={(e) => setSearchId(e.target.value)} className={inputClass}>
              <option value="all">All searches (highest priority first)</option>
              {searches.map((s) => <option key={s.id} value={s.id}>P{s.priority} · {s.name}</option>)}
            </select>
          </div>
          <div className="sm:w-28">
            <label className={labelClass}>Letters</label>
            <input type="number" min="1" max="100" value={count} onChange={(e) => setCount(e.target.value)} className={inputClass} />
          </div>
          <button onClick={prepare} disabled={busy} className={btn}>{busy ? 'Preparing…' : 'Prepare letters'}</button>
        </Card>
        <p className="mb-6 text-xs text-slate-500">
          Letters go to each company's registered office from Companies House, so every lead can be reached. Print on A4 and use DL or C5 window envelopes.
          Each letter carries a reference (L-company number) so replies can be traced.
        </p>
        {batch.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            <button onClick={() => window.print()} className={btn}>Print {batch.length} letters / Save as PDF</button>
            <button onClick={markPosted} className={btnGhost}>Mark all as posted</button>
            <button onClick={() => setBatch([])} className="text-sm text-slate-500 hover:underline">Discard</button>
          </div>
        )}
      </div>
      {batch.length === 0 ? (
        !message && <div className="print:hidden"><Empty>Choose a search and prepare a batch of letters.</Empty></div>
      ) : (
        <div className="rounded-xl bg-slate-200 p-6 print:bg-white print:p-0">
          {batch.map(({ lead, qr }) => <Letter key={lead.id} lead={lead} search={byId[lead.search_id ?? '']} qr={qr} />)}
        </div>
      )}
    </div>
  );
};

export default Letters;
