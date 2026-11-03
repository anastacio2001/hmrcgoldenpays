import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase, Campaign, CampaignEnrollment, CampaignStep, Lead, LeadSearch, Suppression } from '../../lib/supabase';
import { VARIABLES, displayCompanyName, mailtoLink, renderEmail, templateVars } from '../../lib/outreach';
import { Badge, Card, Empty, ErrorBox, PageTitle, Spinner, Stat, btn, btnDanger, btnGhost, formatDate, inputClass, labelClass } from './ui';

type Tab = 'today' | 'sequence' | 'enrolled' | 'optouts';
type DueItem = CampaignEnrollment & { leads: Lead };

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const Outreach: React.FC = () => {
  const [tab, setTab] = useState<Tab>('today');
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [steps, setSteps] = useState<CampaignStep[]>([]);
  const [searches, setSearches] = useState<LeadSearch[]>([]);
  const [due, setDue] = useState<DueItem[]>([]);
  const [enrolled, setEnrolled] = useState<DueItem[]>([]);
  const [suppressions, setSuppressions] = useState<Suppression[]>([]);
  const [sentToday, setSentToday] = useState(0);
  const [stats, setStats] = useState({ active: 0, completed: 0, stopped: 0, replied: 0, eligible: 0 });
  const [enrollSearch, setEnrollSearch] = useState('all');
  const [enrollCount, setEnrollCount] = useState('30');
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const { data: camps, error: campError } = await supabase!.from('campaigns').select('*').order('created_at').limit(1);
    if (campError || !camps?.length) {
      setError('Could not load the campaign.');
      return;
    }
    const c = camps[0] as Campaign;
    const start = `${today()}T00:00:00`;
    const [st, se, du, en, su, sent, counts, eligible] = await Promise.all([
      supabase!.from('campaign_steps').select('*').eq('campaign_id', c.id).order('step_number'),
      supabase!.from('lead_searches').select('*').order('priority').order('name'),
      supabase!.from('campaign_enrollments').select('*, leads(*)').eq('campaign_id', c.id).eq('status', 'active').lte('next_due_on', today()).order('next_due_on').order('current_step', { ascending: false }).limit(200),
      supabase!.from('campaign_enrollments').select('*, leads(*)').eq('campaign_id', c.id).order('created_at', { ascending: false }).limit(300),
      supabase!.from('suppressions').select('*').order('created_at', { ascending: false }),
      supabase!.from('outreach_messages').select('*', { count: 'exact', head: true }).gte('sent_at', start),
      supabase!.from('campaign_enrollments').select('status, leads(status)').eq('campaign_id', c.id),
      supabase!.from('leads').select('*', { count: 'exact', head: true }).not('email', 'is', null).in('status', ['new', 'qualified']),
    ]);
    if (st.error || se.error || du.error || en.error || su.error) {
      setError('Could not load outreach data.');
      return;
    }
    setCampaign(c);
    setSteps(st.data as CampaignStep[]);
    setSearches(se.data as LeadSearch[]);
    setDue((du.data as DueItem[]).filter((d) => d.leads?.email));
    setEnrolled(en.data as DueItem[]);
    setSuppressions(su.data as Suppression[]);
    setSentToday(sent.count ?? 0);
    const rows = (counts.data ?? []) as unknown as { status: string; leads: { status: string } | null }[];
    setStats({
      active: rows.filter((r) => r.status === 'active').length,
      completed: rows.filter((r) => r.status === 'completed').length,
      stopped: rows.filter((r) => r.status === 'stopped').length,
      replied: rows.filter((r) => ['replied', 'meeting', 'proposal', 'won'].includes(r.leads?.status ?? '')).length,
      eligible: eligible.count ?? 0,
    });
    setLoaded(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const searchById = useMemo(() => Object.fromEntries(searches.map((s) => [s.id, s])), [searches]);

  const renderFor = (item: DueItem) => {
    const step = steps.find((s) => s.step_number === item.current_step);
    if (!step || !campaign) return null;
    return renderEmail(step.subject, step.body, templateVars(item.leads, searchById[item.leads.search_id ?? ''], campaign.from_name, item.unsubscribe_token));
  };

  const markSent = async (item: DueItem) => {
    const email = renderFor(item);
    if (!email || !item.leads.email) return;
    setBusy(item.id);
    const { error: msgError } = await supabase!.from('outreach_messages').insert({
      enrollment_id: item.id,
      lead_id: item.lead_id,
      step_number: item.current_step,
      to_email: item.leads.email,
      subject: email.subject,
      body: email.body,
      channel: 'manual',
    });
    if (msgError) {
      setBusy(null);
      setError('Could not record the email.');
      return;
    }
    const next = steps.find((s) => s.step_number === item.current_step + 1);
    await supabase!.from('campaign_enrollments').update(next
      ? { current_step: next.step_number, next_due_on: addDays(next.delay_days) }
      : { status: 'completed' }).eq('id', item.id);
    if (item.current_step === 1 && ['new', 'qualified'].includes(item.leads.status)) {
      await supabase!.from('leads').update({ status: 'contacted', last_contacted_at: new Date().toISOString() }).eq('id', item.lead_id);
    } else {
      await supabase!.from('leads').update({ last_contacted_at: new Date().toISOString() }).eq('id', item.lead_id);
    }
    setBusy(null);
    setDue((list) => list.filter((d) => d.id !== item.id));
    setSentToday((n) => n + 1);
  };

  const markReplied = async (item: DueItem) => {
    // The database trigger stops every active sequence for this lead.
    const { error } = await supabase!.from('leads').update({ status: 'replied' }).eq('id', item.lead_id);
    if (error) setError('Could not update the lead.');
    else setDue((list) => list.filter((d) => d.lead_id !== item.lead_id));
  };

  const stop = async (item: DueItem) => {
    const { error } = await supabase!.from('campaign_enrollments').update({ status: 'stopped', stopped_reason: 'stopped manually' }).eq('id', item.id);
    if (error) setError('Could not stop the sequence.');
    else setDue((list) => list.filter((d) => d.id !== item.id));
  };

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const enroll = async () => {
    if (!campaign) return;
    setBusy('enroll');
    setMessage(null);
    const { data: already } = await supabase!.from('campaign_enrollments').select('lead_id').eq('campaign_id', campaign.id);
    const skip = new Set((already ?? []).map((e) => e.lead_id));
    let q = supabase!.from('leads').select('id').not('email', 'is', null).in('status', ['new', 'qualified']).order('created_at').limit(1000);
    if (enrollSearch !== 'all') q = q.eq('search_id', enrollSearch);
    const { data: candidates, error } = await q;
    if (error) {
      setBusy(null);
      setError('Could not find leads to enroll.');
      return;
    }
    const pick = (candidates ?? []).filter((l) => !skip.has(l.id)).slice(0, Number(enrollCount));
    let added = 0;
    let suppressed = 0;
    // One at a time so a single opted-out lead (rejected by the database) doesn't block the rest.
    for (const lead of pick) {
      const { error: insError } = await supabase!.from('campaign_enrollments').insert({ campaign_id: campaign.id, lead_id: lead.id, next_due_on: today() });
      if (insError) suppressed++;
      else added++;
    }
    setBusy(null);
    setMessage(pick.length === 0 ? 'No eligible leads with an email address. Enrichment runs every 15 minutes, or add emails manually in Leads.' : `${added} leads enrolled${suppressed ? `, ${suppressed} skipped (opted out)` : ''}. Their first email is due today.`);
    load();
  };

  const saveStep = async (step: CampaignStep) => {
    const { error } = await supabase!.from('campaign_steps').update({ subject: step.subject, body: step.body, delay_days: step.delay_days }).eq('id', step.id);
    setMessage(error ? null : `Step ${step.step_number} saved.`);
    if (error) setError('Could not save the step.');
  };

  const saveCampaign = async (patch: Partial<Campaign>) => {
    if (!campaign) return;
    const { error } = await supabase!.from('campaigns').update(patch).eq('id', campaign.id);
    if (error) setError('Could not save the campaign.');
    else setCampaign({ ...campaign, ...patch });
  };

  const removeSuppression = async (s: Suppression) => {
    if (!window.confirm('Remove this opt-out? Only do this if the company has asked to hear from you again.')) return;
    const { error } = await supabase!.from('suppressions').delete().eq('id', s.id);
    if (error) setError('Could not remove the opt-out.');
    else setSuppressions((list) => list.filter((x) => x.id !== s.id));
  };

  if (!loaded) return error ? <ErrorBox message={error} /> : <Spinner />;

  const remaining = Math.max(campaign!.daily_limit - sentToday, 0);
  const queue = due.slice(0, remaining);
  const sampleLead = enrolled[0]?.leads ?? due[0]?.leads;

  return (
    <div>
      <PageTitle
        title="Outreach"
        subtitle={`${campaign!.name} · ${campaign!.send_mode === 'manual' ? 'manual sending from your mailbox' : 'automatic sending via Resend'}`}
      />
      {error && <ErrorBox message={error} />}
      {message && <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Due today" value={due.length} />
        <Stat label="Sent today" value={`${sentToday} / ${campaign!.daily_limit}`} />
        <Stat label="In sequence" value={stats.active} />
        <Stat label="Replies & meetings" value={<span className="text-emerald-700">{stats.replied}</span>} />
        <Stat label="Ready to enroll" value={stats.eligible} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {([['today', `Today (${queue.length})`], ['sequence', 'Sequence'], ['enrolled', `Enrolled (${enrolled.length})`], ['optouts', `Opt-outs (${suppressions.length})`]] as [Tab, string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${tab === t ? 'bg-obsidian text-white' : 'bg-white text-slate-600 hover:bg-mist'}`}>{label}</button>
        ))}
      </div>

      {tab === 'today' && (
        <>
          <Card className="mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className={labelClass}>Enroll leads from</label>
              <select value={enrollSearch} onChange={(e) => setEnrollSearch(e.target.value)} className={inputClass}>
                <option value="all">All searches (oldest first)</option>
                {searches.map((s) => <option key={s.id} value={s.id}>P{s.priority} · {s.name}</option>)}
              </select>
            </div>
            <div className="sm:w-32">
              <label className={labelClass}>How many</label>
              <input type="number" min="1" max="200" value={enrollCount} onChange={(e) => setEnrollCount(e.target.value)} className={inputClass} />
            </div>
            <button onClick={enroll} disabled={busy === 'enroll'} className={btn}>{busy === 'enroll' ? 'Enrolling…' : 'Enroll leads'}</button>
          </Card>

          {remaining === 0 && due.length > 0 && (
            <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Daily limit reached ({campaign!.daily_limit}). Remaining emails stay queued for tomorrow, which keeps your sending reputation healthy.
            </div>
          )}

          {queue.length === 0 ? (
            <Empty>{due.length ? 'Daily limit reached. Come back tomorrow.' : 'Nothing due today. Enroll leads above to start a sequence.'}</Empty>
          ) : (
            <div className="space-y-4">
              {queue.map((item) => {
                const email = renderFor(item);
                if (!email) return null;
                const search = searchById[item.leads.search_id ?? ''];
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel bg-mist px-5 py-3 text-sm">
                      <div>
                        <span className="font-semibold text-obsidian">{displayCompanyName(item.leads.company_name)}</span>
                        <span className="ml-2 text-slate-500">{item.leads.email}</span>
                        {item.leads.email_confidence && <span className="ml-2"><Badge value={item.leads.email_confidence} /></span>}
                      </div>
                      <span className="font-mono text-[11px] text-slate-500">Step {item.current_step}/{steps.length}{search?.segment ? ` · ${search.segment}` : ''}{item.next_due_on < today() ? ` · due ${formatDate(item.next_due_on)}` : ''}</span>
                    </div>
                    <div className="px-5 py-4">
                      <p className="text-sm font-semibold text-obsidian">{email.subject}</p>
                      <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-700">{email.body}</pre>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 border-t border-steel px-5 py-3">
                      <a href={mailtoLink(item.leads.email!, email.subject, email.body)} className={btn}>Open in Mail</a>
                      <button onClick={() => copy(`${item.id}-s`, email.subject)} className={btnGhost}>{copied === `${item.id}-s` ? 'Copied ✓' : 'Copy subject'}</button>
                      <button onClick={() => copy(`${item.id}-b`, email.body)} className={btnGhost}>{copied === `${item.id}-b` ? 'Copied ✓' : 'Copy body'}</button>
                      <button onClick={() => markSent(item)} disabled={busy === item.id} className="rounded-md bg-obsidian px-4 py-2 text-sm font-semibold text-white hover:bg-obsidian-800 disabled:opacity-50">{busy === item.id ? 'Saving…' : 'Mark sent ✓'}</button>
                      <span className="flex-1" />
                      <button onClick={() => markReplied(item)} className="text-sm text-emerald-700 hover:underline">They replied</button>
                      <button onClick={() => stop(item)} className="text-sm text-slate-500 hover:underline">Stop</button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === 'sequence' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {steps.map((step, i) => (
              <Card key={step.id} className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold text-obsidian">Email {step.step_number}</h2>
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    {i === 0 ? 'Sent when enrolled' : 'Days after previous'}
                    {i > 0 && (
                      <input type="number" min="1" max="60" value={step.delay_days}
                        onChange={(e) => setSteps((list) => list.map((s) => (s.id === step.id ? { ...s, delay_days: Number(e.target.value) } : s)))}
                        className="w-16 rounded border border-steel px-2 py-1" />
                    )}
                  </label>
                </div>
                <label className={labelClass}>Subject</label>
                <input value={step.subject} onChange={(e) => setSteps((list) => list.map((s) => (s.id === step.id ? { ...s, subject: e.target.value } : s)))} className={`${inputClass} mb-3`} />
                <label className={labelClass}>Body</label>
                <textarea rows={9} value={step.body} onChange={(e) => setSteps((list) => list.map((s) => (s.id === step.id ? { ...s, body: e.target.value } : s)))} className={`${inputClass} font-mono text-xs`} />
                <div className="mt-3 flex justify-end"><button onClick={() => saveStep(step)} className={btn}>Save email {step.step_number}</button></div>
                {sampleLead && campaign && (
                  <details className="mt-3 rounded-md bg-mist p-3 text-sm">
                    <summary className="cursor-pointer text-xs font-semibold text-slate-600">Preview with {displayCompanyName(sampleLead.company_name)}</summary>
                    {(() => {
                      const r = renderEmail(step.subject, step.body, templateVars(sampleLead, searchById[sampleLead.search_id ?? ''], campaign.from_name, '00000000-0000-0000-0000-000000000000'));
                      return (<><p className="mt-2 font-semibold">{r.subject}</p><pre className="mt-2 whitespace-pre-wrap font-sans text-slate-700">{r.body}</pre></>);
                    })()}
                  </details>
                )}
              </Card>
            ))}
          </div>
          <div className="space-y-4">
            <Card className="p-5 text-sm">
              <h2 className="font-semibold text-obsidian">Settings</h2>
              <label className={`${labelClass} mt-4`}>Daily sending limit</label>
              <input type="number" min="1" max="500" value={campaign!.daily_limit} onChange={(e) => saveCampaign({ daily_limit: Number(e.target.value) })} className={inputClass} />
              <p className="mt-1 text-xs text-slate-500">Start at 20–30 a day from a new mailbox and raise it gradually.</p>
              <label className={`${labelClass} mt-4`}>Signed by</label>
              <input value={campaign!.from_name} onChange={(e) => setCampaign({ ...campaign!, from_name: e.target.value })} onBlur={(e) => saveCampaign({ from_name: e.target.value })} className={inputClass} />
            </Card>
            <Card className="p-5 text-sm">
              <h2 className="font-semibold text-obsidian">Variables</h2>
              <ul className="mt-3 space-y-1 font-mono text-xs text-slate-600">
                {VARIABLES.map((v) => <li key={v}>{`{{${v}}}`}</li>)}
              </ul>
              <p className="mt-3 text-xs text-slate-500">Pain, pitch and topic come from each lead's search in the library. The signature always includes the company details and a working opt-out link; it is added automatically if you remove it.</p>
            </Card>
          </div>
        </div>
      )}

      {tab === 'enrolled' && (
        enrolled.length === 0 ? <Empty>No leads enrolled yet.</Empty> : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-steel bg-mist text-left text-xs uppercase tracking-wider text-slate-500">
                <tr><th className="px-5 py-3">Company</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Step</th><th className="px-5 py-3">Next</th><th className="px-5 py-3">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-steel">
                {enrolled.map((e) => (
                  <tr key={e.id}>
                    <td className="px-5 py-3 font-medium text-obsidian">{displayCompanyName(e.leads.company_name)}</td>
                    <td className="px-5 py-3 text-slate-600">{e.leads.email ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-600">{e.status === 'completed' ? `${steps.length}/${steps.length}` : `${e.current_step}/${steps.length}`}</td>
                    <td className="px-5 py-3 text-slate-500">{e.status === 'active' ? formatDate(e.next_due_on) : '—'}</td>
                    <td className="px-5 py-3"><Badge value={e.status === 'stopped' ? (e.stopped_reason ?? 'stopped') : e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      )}

      {tab === 'optouts' && (
        suppressions.length === 0 ? <Empty>No opt-outs yet. Anyone who unsubscribes or is marked "excluded" appears here and is never contacted again.</Empty> : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-steel bg-mist text-left text-xs uppercase tracking-wider text-slate-500">
                <tr><th className="px-5 py-3">Email / company</th><th className="px-5 py-3">Reason</th><th className="px-5 py-3">Since</th><th className="px-5 py-3" /></tr>
              </thead>
              <tbody className="divide-y divide-steel">
                {suppressions.map((s) => (
                  <tr key={s.id}>
                    <td className="px-5 py-3 font-mono text-xs">{s.email ?? `Company ${s.company_number}`}</td>
                    <td className="px-5 py-3"><Badge value={s.reason} /></td>
                    <td className="px-5 py-3 text-slate-500">{formatDate(s.created_at)}</td>
                    <td className="px-5 py-3 text-right"><button onClick={() => removeSuppression(s)} className={`${btnDanger} px-3 py-1 text-xs`}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      )}
    </div>
  );
};

export default Outreach;
