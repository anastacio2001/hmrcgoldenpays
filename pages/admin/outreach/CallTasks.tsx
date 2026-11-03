import React, { useCallback, useEffect, useState } from 'react';
import { supabase, ActivityOutcome, Lead, LeadSearch, LeadStatus } from '../../../lib/supabase';
import { displayCompanyName } from '../../../lib/outreach';
import { Card, Empty, ErrorBox, Spinner, inputClass } from '../ui';

// Outcome → activity record and the lead's next pipeline status.
const CALL_OUTCOMES: { outcome: ActivityOutcome; label: string; status: LeadStatus; tone: string }[] = [
  { outcome: 'no-answer', label: 'No answer', status: 'contacted', tone: 'border-steel text-slate-700' },
  { outcome: 'voicemail', label: 'Left voicemail', status: 'contacted', tone: 'border-steel text-slate-700' },
  { outcome: 'interested', label: 'Interested → meeting', status: 'meeting', tone: 'border-emerald-300 text-emerald-800' },
  { outcome: 'not-interested', label: 'Not interested', status: 'lost', tone: 'border-steel text-slate-700' },
  { outcome: 'do-not-contact', label: 'Do not contact', status: 'excluded', tone: 'border-red-200 text-red-700' },
];

const linkedInSearch = (person: string, company: string) =>
  `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(`${person} ${company}`)}`;

const CallTasks: React.FC<{ searches: Record<string, LeadSearch> }> = ({ searches }) => {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [mode, setMode] = useState<'phone' | 'linkedin'>('phone');
  const [ctps, setCtps] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    let q = supabase!.from('leads').select('*').in('status', ['new', 'qualified', 'contacted']).limit(60);
    q = mode === 'phone' ? q.not('phone', 'is', null) : q.neq('directors', '{}');
    const { data, error } = await q.order('last_contacted_at', { ascending: true, nullsFirst: true });
    if (error) setError('Could not load call tasks.');
    else {
      const prio = (l: Lead) => searches[l.search_id ?? '']?.priority ?? 9;
      setLeads((data as Lead[]).sort((a, b) => prio(a) - prio(b)));
    }
  }, [mode, searches]);

  useEffect(() => { load(); }, [load]);

  const log = async (lead: Lead, channel: 'call' | 'linkedin', outcome: ActivityOutcome, status: LeadStatus) => {
    const { error: aErr } = await supabase!.from('lead_activities').insert({ lead_id: lead.id, channel, outcome, notes: notes[lead.id] || null });
    const { error: lErr } = await supabase!.from('leads').update({ status, last_contacted_at: new Date().toISOString() }).eq('id', lead.id);
    if (aErr || lErr) setError('Could not record the outcome.');
    else setLeads((list) => list!.filter((l) => l.id !== lead.id));
  };

  if (!leads) return error ? <ErrorBox message={error} /> : <Spinner />;

  return (
    <div>
      {error && <ErrorBox message={error} />}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(['phone', 'linkedin'] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={`rounded-full px-3 py-1 text-xs font-semibold ${mode === m ? 'bg-obsidian text-white' : 'bg-white text-slate-600'}`}>
            {m === 'phone' ? 'Phone calls' : 'LinkedIn'}
          </button>
        ))}
        <span className="text-xs text-slate-500">
          {mode === 'phone'
            ? 'Leads with a phone number from Google, highest priority first.'
            : 'Find the director on LinkedIn, connect with a short note, then log it here.'}
        </span>
      </div>

      {mode === 'phone' && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          UK law (PECR): unsolicited sales calls to businesses registered with the Corporate Telephone Preference Service (CTPS) are not allowed.
          Check each number before calling, for example with a CTPS screening service, and tick the box. Always say who you are and stop if asked.
        </div>
      )}

      {leads.length === 0 ? (
        <Empty>{mode === 'phone' ? 'No leads with a phone number yet. Google Places adds them as enrichment runs.' : 'No leads with director names yet.'}</Empty>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => {
            const s = searches[lead.search_id ?? ''];
            const company = displayCompanyName(lead.company_name);
            const director = lead.contact_name ?? lead.directors[0];
            return (
              <Card key={lead.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                  <div className="min-w-0 lg:w-1/3">
                    <p className="font-semibold text-obsidian">{company}</p>
                    <p className="text-xs text-slate-500">{s?.segment} · {lead.locality ?? '—'}</p>
                    {director && <p className="mt-1 text-sm text-slate-700">Ask for: <b>{director}</b></p>}
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      {mode === 'phone' && lead.phone && <a href={`tel:${lead.phone.replace(/\s/g, '')}`} className="font-mono text-accent-dark hover:underline">{lead.phone}</a>}
                      {director && <a href={linkedInSearch(director, company)} target="_blank" rel="noopener noreferrer" className="text-accent-dark hover:underline">LinkedIn ↗</a>}
                      {lead.google_maps_url && <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-accent-dark hover:underline">Google ↗</a>}
                      {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-accent-dark hover:underline">Website ↗</a>}
                    </div>
                  </div>
                  <div className="text-sm text-slate-700 lg:w-1/3">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{mode === 'phone' ? 'Call script' : 'Connection note (under 300 characters)'}</p>
                    {mode === 'phone' ? (
                      <p className="mt-1 leading-relaxed">
                        "Hi, it's Ladislau from GOLDENPAYS, a software studio in Manchester. Quick one: a lot of {s?.segment?.toLowerCase() ?? 'local'} businesses tell us {s?.pain_point?.replace(/\.$/, '').toLowerCase() ?? 'they lose hours to manual admin'}. Is that the case at {company}?"
                        <span className="mt-1 block text-xs text-slate-500">If yes: offer the free 20-minute automation check. {s?.pitch}</span>
                      </p>
                    ) : (
                      <p className="mt-1 leading-relaxed">
                        "Hi {director?.split(' ')[0]}, I run a Manchester software studio helping {s?.segment?.toLowerCase() ?? 'UK'} businesses automate {s?.pain_topic ?? 'manual admin'}. Would be good to connect."
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 lg:w-1/3">
                    <input placeholder="Notes (optional)" value={notes[lead.id] ?? ''} onChange={(e) => setNotes({ ...notes, [lead.id]: e.target.value })} className={inputClass} />
                    {mode === 'phone' ? (
                      <>
                        <label className="flex items-center gap-2 text-xs text-slate-600">
                          <input type="checkbox" checked={!!ctps[lead.id]} onChange={(e) => setCtps({ ...ctps, [lead.id]: e.target.checked })} className="accent-accent" />
                          Number checked: not on CTPS
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {CALL_OUTCOMES.map((o) => (
                            <button key={o.outcome} disabled={!ctps[lead.id]} onClick={() => log(lead, 'call', o.outcome, o.status)}
                              className={`rounded border bg-white px-2.5 py-1 text-xs font-medium disabled:opacity-40 ${o.tone}`}>{o.label}</button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => log(lead, 'linkedin', 'connected', 'contacted')} className="rounded border border-steel bg-white px-2.5 py-1 text-xs font-medium">Request sent</button>
                        <button onClick={() => log(lead, 'linkedin', 'messaged', 'contacted')} className="rounded border border-steel bg-white px-2.5 py-1 text-xs font-medium">Messaged</button>
                        <button onClick={() => log(lead, 'linkedin', 'interested', 'meeting')} className="rounded border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-800">Interested → meeting</button>
                        <button onClick={() => log(lead, 'linkedin', 'not-interested', 'lost')} className="rounded border border-steel bg-white px-2.5 py-1 text-xs font-medium">Not interested</button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CallTasks;
