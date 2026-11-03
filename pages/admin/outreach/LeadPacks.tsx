import React, { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { supabase, Lead, LeadBrief, LeadSearch } from '../../../lib/supabase';
import { displayCompanyName } from '../../../lib/outreach';
import { OFFERINGS } from '../../../data/site';
import { Badge, Card, Empty, ErrorBox, Spinner, btn, btnGhost } from '../ui';
import { Letter, responseUrl } from './Letters';

type Pack = LeadBrief & { leads: Lead };

const scoreTone = (s: number) => (s >= 8 ? 'bg-emerald-600' : s >= 5 ? 'bg-amber-500' : 'bg-slate-400');
const offeringTitle = (id: string | null) => OFFERINGS.find((o) => o.id === id)?.title ?? 'No package';

const LeadPacks: React.FC<{ campaignId: string; searches: Record<string, LeadSearch>; onPrintMode: (on: boolean) => void }> = ({ campaignId, searches, onPrintMode }) => {
  const [packs, setPacks] = useState<Pack[] | null>(null);
  const [status, setStatus] = useState<'draft' | 'approved' | 'rejected'>('draft');
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [spend, setSpend] = useState<{ month: number; packs: number }>({ month: 0, packs: 0 });
  const [printing, setPrinting] = useState<{ pack: Pack; qr: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const [p, u] = await Promise.all([
      supabase!.from('lead_briefs').select('*, leads(*)').eq('status', status).order('fit_score', { ascending: false }).order('updated_at', { ascending: false }).limit(100),
      supabase!.from('ai_usage').select('cost_usd, task').gte('created_at', monthStart),
    ]);
    if (p.error) {
      setError('Could not load lead packs.');
      return;
    }
    setPacks(p.data as Pack[]);
    setSpend({
      month: (u.data ?? []).reduce((s, r) => s + Number(r.cost_usd), 0),
      packs: (u.data ?? []).filter((r) => r.task === 'lead_brief').length,
    });
  }, [status]);

  useEffect(() => { load(); }, [load]);

  // Print one letter: render it, switch the page into print mode, then open the print dialog.
  useEffect(() => {
    onPrintMode(!!printing);
    if (!printing) return;
    const t = setTimeout(() => window.print(), 300);
    const done = () => setPrinting(null);
    window.addEventListener('afterprint', done);
    return () => { clearTimeout(t); window.removeEventListener('afterprint', done); };
  }, [printing, onPrintMode]);

  const invoke = async (body: Record<string, unknown>, key: string) => {
    setBusy(key);
    setError(null);
    setMessage(null);
    const { data, error } = await supabase!.functions.invoke('ai-agent', { body });
    setBusy(null);
    if (error) {
      const detail = await (error as { context?: Response }).context?.json?.().catch(() => null);
      setError(detail?.error ?? 'The AI agent failed. Try again in a minute.');
      return null;
    }
    return data;
  };

  const generate = async () => {
    const data = await invoke({ task: 'lead_brief_batch' }, 'batch');
    if (!data) return;
    if (data.skipped) setMessage(`Nothing generated: ${data.skipped}.`);
    else setMessage(`${data.briefed.length} new pack(s) ready${data.errors?.length ? `, ${data.errors.length} failed` : ''}. Cost: $${data.briefed.reduce((s: number, b: { cost_usd: number }) => s + b.cost_usd, 0).toFixed(2)}.`);
    load();
  };

  const regenerate = async (pack: Pack) => {
    const data = await invoke({ task: 'lead_brief', lead_id: pack.lead_id }, pack.id);
    if (data) {
      setMessage(`Pack for ${displayCompanyName(pack.leads.company_name)} regenerated ($${data.cost_usd.toFixed(2)}).`);
      load();
    }
  };

  const approve = async (pack: Pack) => {
    setBusy(pack.id);
    const { error: enrollError } = await supabase!.from('campaign_enrollments').insert({
      campaign_id: campaignId,
      lead_id: pack.lead_id,
      custom_steps: pack.emails,
    });
    if (enrollError && !/duplicate/i.test(enrollError.message)) {
      setBusy(null);
      setError(enrollError.message === 'lead_suppressed' ? 'This company has opted out or is already in conversation.' : 'Could not add the lead to the email queue.');
      return;
    }
    if (enrollError) {
      // Already enrolled: switch the existing sequence to the personalised emails.
      await supabase!.from('campaign_enrollments').update({ custom_steps: pack.emails }).eq('campaign_id', campaignId).eq('lead_id', pack.lead_id);
    }
    await supabase!.from('lead_briefs').update({ status: 'approved' }).eq('id', pack.id);
    if (pack.leads.status === 'new') await supabase!.from('leads').update({ status: 'qualified' }).eq('id', pack.lead_id);
    setBusy(null);
    setMessage(`${displayCompanyName(pack.leads.company_name)} approved: its personalised email 1 is in Email · today.`);
    load();
  };

  const reject = async (pack: Pack) => {
    await supabase!.from('lead_briefs').update({ status: 'rejected' }).eq('id', pack.id);
    load();
  };

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const printLetter = async (pack: Pack) => {
    const qr = await QRCode.toDataURL(responseUrl(pack.leads, searches[pack.leads.search_id ?? '']), { margin: 0, width: 300 });
    setPrinting({ pack, qr });
  };

  if (!packs) return error ? <ErrorBox message={error} /> : <Spinner />;

  const CopyBtn: React.FC<{ id: string; text: string; label?: string }> = ({ id, text, label = 'Copy' }) => (
    <button onClick={() => copy(id, text)} className="rounded border border-steel bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:border-accent">{copied === id ? 'Copied ✓' : label}</button>
  );

  return (
    <div>
      <div className="print:hidden">
        {error && <ErrorBox message={error} />}
        {message && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}

        <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            <p className="font-semibold text-obsidian">AI lead packs</p>
            <p>Claude reads each company's data and website and prepares a scored pack: pains with evidence, 4 emails, a letter, a LinkedIn note and a call opener. Nothing is sent until you approve it.</p>
            <p className="mt-1 text-xs text-slate-500">This month: {spend.packs} packs · ${spend.month.toFixed(2)} AI spend. New packs are also generated nightly.</p>
          </div>
          <button onClick={generate} disabled={!!busy} className={`${btn} shrink-0`}>{busy === 'batch' ? 'Analysing… (up to 2 min)' : 'Generate packs'}</button>
        </Card>

        <div className="mb-4 flex gap-2">
          {(['draft', 'approved', 'rejected'] as const).map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${status === s ? 'bg-obsidian text-white' : 'bg-white text-slate-600'}`}>{s === 'draft' ? 'To review' : s}</button>
          ))}
        </div>

        {packs.length === 0 ? (
          <Empty>{status === 'draft' ? 'No packs to review. Click "Generate packs" to analyse your best-enriched leads.' : `No ${status} packs.`}</Empty>
        ) : (
          <div className="space-y-3">
            {packs.map((pack) => {
              const lead = pack.leads;
              const company = displayCompanyName(lead.company_name);
              const to = lead.contact_email ?? lead.email;
              const isOpen = open === pack.id;
              return (
                <Card key={pack.id} className="overflow-hidden">
                  <button onClick={() => setOpen(isOpen ? null : pack.id)} className="flex w-full items-start gap-4 px-5 py-4 text-left hover:bg-mist">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${scoreTone(pack.fit_score)}`}>{pack.fit_score}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-obsidian">{company} <span className="font-normal text-slate-400">· {searches[lead.search_id ?? '']?.segment ?? ''} · {lead.locality ?? ''}</span></span>
                      <span className="block text-sm text-slate-600">{pack.summary}</span>
                      <span className="mt-1 block text-xs text-slate-500">{offeringTitle(pack.recommended_offering)}{to ? ` · ${to}` : ' · no email: letter, LinkedIn or call'}{pack.red_flags.length ? ` · ⚠ ${pack.red_flags.length} flag(s)` : ''}</span>
                    </span>
                    <span className="text-slate-400">{isOpen ? '▴' : '▾'}</span>
                  </button>

                  {isOpen && (
                    <div className="space-y-5 border-t border-steel px-5 py-5 text-sm">
                      {pack.red_flags.length > 0 && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-900">
                          <p className="text-xs font-semibold uppercase tracking-wider">Check before contacting</p>
                          <ul className="mt-1 list-disc pl-5">{pack.red_flags.map((f) => <li key={f}>{f}</li>)}</ul>
                        </div>
                      )}

                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Pains & evidence</p>
                        <ul className="mt-2 space-y-2">
                          {pack.pains.map((p, i) => (
                            <li key={i} className="rounded-md bg-mist p-3">
                              <p className="font-medium text-obsidian">{p.pain}</p>
                              <p className="text-slate-600">{p.evidence}</p>
                              <p className="mt-1 text-xs text-slate-400">
                                Source: {/^https?:\/\//.test(p.source) ? <a href={p.source} target="_blank" rel="noopener noreferrer" className="text-accent-dark underline">{p.source}</a> : p.source}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Email sequence {to ? `→ ${to}` : '(no email found)'}</p>
                        <div className="mt-2 grid gap-3 lg:grid-cols-2">
                          {pack.emails.map((e) => (
                            <div key={e.step} className="rounded-md border border-steel p-3">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-xs text-slate-500">Email {e.step}</p>
                                <CopyBtn id={`${pack.id}-e${e.step}`} text={`${e.subject}\n\n${e.body}`} />
                              </div>
                              <p className="mt-1 font-semibold text-obsidian">{e.subject}</p>
                              <pre className="mt-2 whitespace-pre-wrap font-sans text-slate-700">{e.body}</pre>
                            </div>
                          ))}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">On approval these replace the template for this lead. The signature, company details and opt-out link are added automatically when each email is sent from Email · today.</p>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-3">
                        <div className="rounded-md border border-steel p-3 lg:col-span-1">
                          <div className="flex items-center justify-between"><p className="text-xs text-slate-500">Letter</p>
                            <span className="flex gap-1"><CopyBtn id={`${pack.id}-l`} text={pack.letter ?? ''} /><button onClick={() => printLetter(pack)} className="rounded border border-steel bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:border-accent">Download PDF</button></span>
                          </div>
                          <pre className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap font-sans text-slate-700">{pack.letter}</pre>
                        </div>
                        <div className="rounded-md border border-steel p-3">
                          <div className="flex items-center justify-between"><p className="text-xs text-slate-500">LinkedIn note</p><CopyBtn id={`${pack.id}-li`} text={pack.linkedin_note ?? ''} /></div>
                          <p className="mt-2 text-slate-700">{pack.linkedin_note}</p>
                          {lead.directors[0] && (
                            <a href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${lead.contact_name ?? lead.directors[0]} ${company}`)}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-accent-dark hover:underline">Find {lead.contact_name ?? lead.directors[0]} on LinkedIn ↗</a>
                          )}
                        </div>
                        <div className="rounded-md border border-steel p-3">
                          <div className="flex items-center justify-between"><p className="text-xs text-slate-500">Call opener</p><CopyBtn id={`${pack.id}-c`} text={pack.call_opener ?? ''} /></div>
                          <p className="mt-2 text-slate-700">{pack.call_opener}</p>
                          {lead.phone && <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="mt-2 inline-block font-mono text-xs text-accent-dark">{lead.phone}</a>}
                          <p className="mt-1 text-[11px] text-slate-400">Check CTPS before calling.</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 border-t border-steel pt-4">
                        {pack.status !== 'approved' && (
                          <button onClick={() => approve(pack)} disabled={!!busy || !to} title={to ? '' : 'No email address: use the letter, LinkedIn or a call'} className={btn}>
                            {busy === pack.id ? 'Working…' : 'Approve & add to email queue'}
                          </button>
                        )}
                        <button onClick={() => regenerate(pack)} disabled={!!busy} className={btnGhost}>{busy === pack.id ? 'Regenerating…' : 'Regenerate'}</button>
                        {pack.status !== 'rejected' && <button onClick={() => reject(pack)} className="text-sm text-slate-500 hover:underline">Not a fit</button>}
                        <span className="flex-1" />
                        <Badge value={pack.status === 'draft' ? 'new' : pack.status === 'approved' ? 'won' : 'lost'} />
                        <span className="text-[11px] text-slate-400">{pack.model} · {new Date(pack.updated_at).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {printing && (
        <div className="hidden print:block">
          <Letter lead={printing.pack.leads} search={searches[printing.pack.leads.search_id ?? '']} qr={printing.qr} body={printing.pack.letter} />
        </div>
      )}
    </div>
  );
};

export default LeadPacks;
