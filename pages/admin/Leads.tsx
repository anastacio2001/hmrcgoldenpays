import React, { useCallback, useEffect, useState } from 'react';
import { supabase, Lead, LeadActivity, LeadRun, LeadSearch, LeadStatus } from '../../lib/supabase';
import { OFFERINGS } from '../../data/site';
import { Badge, Card, Empty, ErrorBox, Modal, PageTitle, Spinner, Stat, btn, btnGhost, formatDate, inputClass, labelClass } from './ui';

const STATUSES: LeadStatus[] = ['new', 'qualified', 'contacted', 'replied', 'meeting', 'proposal', 'won', 'lost', 'excluded'];
const PAGE_LIMIT = 500;

// "What have we found for this lead?" filter.
const CONTACT_FILTERS = [
  { id: 'all', label: 'Any contact status' },
  { id: 'found', label: 'Contact found (any)' },
  { id: 'director', label: 'Director email (Hunter)' },
  { id: 'email', label: 'Any email' },
  { id: 'phone', label: 'Phone' },
  { id: 'website', label: 'Website' },
  { id: 'none', label: 'Nothing found yet' },
] as const;
type ContactFilter = (typeof CONTACT_FILTERS)[number]['id'];

// SIC 2007 codes for the segments in our acquisition plan.
const SIC_PRESETS = [
  { code: '47910', label: 'Online retail' },
  { code: '69201', label: 'Accountants' },
  { code: '69102', label: 'Solicitors' },
  { code: '68310', label: 'Estate agents' },
  { code: '86900', label: 'Health clinics' },
  { code: '73110', label: 'Advertising agencies' },
  { code: '74100', label: 'Design agencies' },
  { code: '70229', label: 'Business consultancy' },
  { code: '52290', label: 'Logistics' },
  { code: '85590', label: 'Training & education' },
];

const emptySearch = {
  name: '', segment: '', sic_codes: '', location: '', company_type: 'ltd' as LeadSearch['company_type'],
  incorporated_from: '', incorporated_to: '', incorporated_within_days: '', max_results: '100', is_active: true,
  priority: '2', offering: '', pain_point: '', pitch: '',
};

const PRIORITY_LABELS: Record<number, string> = { 1: 'Priority 1 · fastest wins', 2: 'Priority 2 · strong fit', 3: 'Priority 3 · partners & recurring' };
const offeringTitle = (id: string | null) => OFFERINGS.find((o) => o.id === id)?.title ?? null;

const csvCell = (value: unknown) => {
  const s = value == null ? '' : Array.isArray(value) ? value.join('; ') : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const chUrl = (number: string) => `https://find-and-update.company-information.service.gov.uk/company/${number}`;

// deno-lint-ignore no-explicit-any
function applyContactFilter<T extends { not: any; or: any; is: any }>(q: T, f: ContactFilter): T {
  switch (f) {
    case 'found': return q.or('email.not.is.null,contact_email.not.is.null,phone.not.is.null,website.not.is.null');
    case 'director': return q.not('contact_email', 'is', null);
    case 'email': return q.or('email.not.is.null,contact_email.not.is.null');
    case 'phone': return q.not('phone', 'is', null);
    case 'website': return q.not('website', 'is', null);
    case 'none': return q.is('email', null).is('contact_email', null).is('phone', null).is('website', null);
    default: return q;
  }
}

const Leads: React.FC = () => {
  const [tab, setTab] = useState<'leads' | 'searches'>('leads');
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [searches, setSearches] = useState<LeadSearch[]>([]);
  const [runs, setRuns] = useState<LeadRun[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSearch, setFilterSearch] = useState('all');
  const [query, setQuery] = useState('');
  const [contactFilter, setContactFilter] = useState<ContactFilter>('all');
  const [contactCounts, setContactCounts] = useState<Partial<Record<ContactFilter, number>>>({});
  const [withEmail, setWithEmail] = useState(0);
  const [pendingEnrich, setPendingEnrich] = useState(0);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [leadForm, setLeadForm] = useState({ website: '', email: '', phone: '', status: 'new' as LeadStatus, notes: '' });
  const [editingSearch, setEditingSearch] = useState<LeadSearch | 'new' | null>(null);
  const [searchForm, setSearchForm] = useState(emptySearch);
  const [running, setRunning] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    let q = supabase!.from('leads').select('*').order('created_at', { ascending: false }).limit(PAGE_LIMIT);
    if (filterStatus !== 'all') q = q.eq('status', filterStatus);
    if (filterSearch !== 'all') q = q.eq('search_id', filterSearch);
    q = applyContactFilter(q, contactFilter);
    const term = query.trim().replace(/[%,()*]/g, '');
    if (term) {
      const fields = ['company_name', 'company_number', 'locality', 'postcode', 'email', 'contact_email', 'contact_name', 'website', 'phone', 'notes'];
      q = q.or(fields.map((f) => `${f}.ilike.*${term}*`).join(","));
    }
    const { data, error } = await q;
    if (error) setError('Could not load leads.');
    else setLeads(data as Lead[]);
  }, [filterStatus, filterSearch, query, contactFilter]);

  const loadMeta = async () => {
    const [s, r, we, pe, ...statusCounts] = await Promise.all([
      supabase!.from('lead_searches').select('*').order('priority').order('name'),
      supabase!.from('lead_runs').select('*').order('started_at', { ascending: false }).limit(10),
      supabase!.from('leads').select('*', { count: 'exact', head: true }).not('email', 'is', null),
      supabase!.from('leads').select('*', { count: 'exact', head: true }).is('enrichment_checked_at', null).is('website', null).in('status', ['new', 'qualified']),
      ...STATUSES.map((st) => supabase!.from('leads').select('*', { count: 'exact', head: true }).eq('status', st)),
    ]);
    if (s.error || r.error) {
      setError('Could not load searches.');
      return;
    }
    setSearches(s.data as LeadSearch[]);
    setRuns(r.data as LeadRun[]);
    setWithEmail(we.count ?? 0);
    const filterCounts = await Promise.all(CONTACT_FILTERS.filter((c) => c.id !== 'all').map(async (c) => {
      const { count } = await applyContactFilter(supabase!.from('leads').select('*', { count: 'exact', head: true }), c.id);
      return [c.id, count ?? 0] as const;
    }));
    setContactCounts(Object.fromEntries(filterCounts));
    setPendingEnrich(pe.count ?? 0);
    setCounts(Object.fromEntries(STATUSES.map((st, i) => [st, statusCounts[i].count ?? 0])));
  };

  useEffect(() => { loadMeta(); }, []);
  useEffect(() => {
    const t = setTimeout(loadLeads, 250); // debounce typing
    return () => clearTimeout(t);
  }, [loadLeads]);

  const openLead = (lead: Lead) => {
    setSelected(lead);
    setActivities([]);
    supabase!.from('lead_activities').select('*').eq('lead_id', lead.id).order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => setActivities((data ?? []) as LeadActivity[]));
    setLeadForm({ website: lead.website ?? '', email: lead.email ?? '', phone: lead.phone ?? '', status: lead.status, notes: lead.notes ?? '' });
  };

  const saveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const payload = {
      website: leadForm.website || null,
      email: leadForm.email || null,
      ...(leadForm.email && leadForm.email !== selected.email ? { email_confidence: 'manual' as const } : {}),
      phone: leadForm.phone || null,
      notes: leadForm.notes || null,
      status: leadForm.status,
      ...(leadForm.status === 'contacted' && selected.status !== 'contacted' ? { last_contacted_at: new Date().toISOString() } : {}),
    };
    const { error } = await supabase!.from('leads').update(payload).eq('id', selected.id);
    if (error) {
      setError('Could not save the lead.');
      return;
    }
    setSelected(null);
    loadLeads();
    loadMeta();
  };

  const setStatus = async (lead: Lead, status: LeadStatus) => {
    const { error } = await supabase!.from('leads').update({
      status,
      ...(status === 'contacted' ? { last_contacted_at: new Date().toISOString() } : {}),
    }).eq('id', lead.id);
    if (error) setError('Could not update the lead.');
    else {
      setLeads((list) => list!.map((l) => (l.id === lead.id ? { ...l, status } : l)));
      loadMeta();
    }
  };

  const exportCsv = () => {
    const header = ['Company', 'Company number', 'Type', 'Incorporated', 'SIC codes', 'Address', 'Locality', 'Postcode', 'Directors', 'Website', 'Email', 'Phone', 'Status', 'Notes'];
    const rows = (leads ?? []).map((l) => [l.company_name, l.company_number, l.company_type, l.incorporated_on, l.sic_codes, l.address, l.locality, l.postcode, l.directors, l.website, l.email, l.phone, l.status, l.notes]);
    const blob = new Blob(['﻿' + [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    Object.assign(document.createElement('a'), { href: url, download: `goldenpays-leads-${new Date().toISOString().slice(0, 10)}.csv` }).click();
    URL.revokeObjectURL(url);
  };

  const openSearch = (s: LeadSearch | 'new') => {
    setEditingSearch(s);
    setSearchForm(s === 'new' ? emptySearch : {
      name: s.name,
      segment: s.segment ?? '',
      sic_codes: s.sic_codes.join(', '),
      location: s.location ?? '',
      company_type: s.company_type,
      incorporated_from: s.incorporated_from ?? '',
      incorporated_to: s.incorporated_to ?? '',
      incorporated_within_days: s.incorporated_within_days?.toString() ?? '',
      max_results: String(s.max_results),
      is_active: s.is_active,
      priority: String(s.priority),
      offering: s.offering ?? '',
      pain_point: s.pain_point ?? '',
      pitch: s.pitch ?? '',
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSearchForm({ ...searchForm, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
  };

  const togglePreset = (code: string) => {
    const codes = searchForm.sic_codes.split(/[\s,]+/).filter(Boolean);
    const next = codes.includes(code) ? codes.filter((c) => c !== code) : [...codes, code];
    setSearchForm({ ...searchForm, sic_codes: next.join(', ') });
  };

  const saveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const sic_codes = searchForm.sic_codes.split(/[\s,]+/).filter(Boolean);
    if (sic_codes.length === 0 || sic_codes.some((c) => !/^\d{5}$/.test(c))) {
      setError('SIC codes must be 5 digits, separated by commas.');
      return;
    }
    const payload = {
      name: searchForm.name,
      sic_codes,
      location: searchForm.location || null,
      company_type: searchForm.company_type,
      incorporated_from: searchForm.incorporated_from || null,
      incorporated_to: searchForm.incorporated_to || null,
      incorporated_within_days: searchForm.incorporated_within_days ? Number(searchForm.incorporated_within_days) : null,
      max_results: Number(searchForm.max_results),
      is_active: searchForm.is_active,
      segment: searchForm.segment || null,
      priority: Number(searchForm.priority),
      offering: searchForm.offering || null,
      pain_point: searchForm.pain_point || null,
      pitch: searchForm.pitch || null,
    };
    const { error } = editingSearch === 'new'
      ? await supabase!.from('lead_searches').insert(payload)
      : await supabase!.from('lead_searches').update(payload).eq('id', (editingSearch as LeadSearch).id);
    if (error) {
      setError('Could not save the search.');
      return;
    }
    setError(null);
    setEditingSearch(null);
    loadMeta();
  };

  const deleteSearch = async (s: LeadSearch) => {
    if (!window.confirm(`Delete the search "${s.name}"? Leads it found are kept.`)) return;
    const { error } = await supabase!.from('lead_searches').delete().eq('id', s.id);
    if (error) setError('Could not delete the search.');
    else {
      setEditingSearch(null);
      loadMeta();
    }
  };

  const toggleActive = async (s: LeadSearch) => {
    const { error } = await supabase!.from('lead_searches').update({ is_active: !s.is_active }).eq('id', s.id);
    if (error) setError('Could not update the search.');
    else setSearches((list) => list.map((x) => (x.id === s.id ? { ...x, is_active: !s.is_active } : x)));
  };

  const enrichNow = async () => {
    setRunning('enrich');
    setMessage(null);
    setError(null);
    const { data, error } = await supabase!.functions.invoke('enrich-leads', { body: {} });
    setRunning(null);
    if (error) setError('The website and email search failed. It will retry automatically every 15 minutes.');
    else setMessage(`Checked ${data.checked} leads: ${data.websites} websites and ${data.emails} business emails found. ${data.remaining} still to check (runs automatically every 15 minutes).`);
    loadMeta();
    loadLeads();
  };

  const runNow = async (searchId?: string) => {
    setRunning(searchId ?? 'all');
    setMessage(null);
    setError(null);
    const { data, error } = await supabase!.functions.invoke('companies-house-leads', { body: searchId ? { search_id: searchId } : {} });
    setRunning(null);
    if (error) {
      const detail = await (error as { context?: Response }).context?.json?.().catch(() => null);
      setError(detail?.error ?? 'The Companies House run failed.');
    } else {
      setMessage(`Run complete: ${data.searches} searches, ${data.found} companies found, ${data.inserted} new leads, ${data.directors} director lookups.${data.errors?.length ? ` ${data.errors.length} error(s): see Recent runs.` : ''}`);
    }
    loadMeta();
    loadLeads();
  };

  if (!leads) return error ? <ErrorBox message={error} /> : <Spinner />;

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const activeSearches = searches.filter((s) => s.is_active).length;
  const searchById = (id: string | null) => searches.find((s) => s.id === id);

  return (
    <div>
      <PageTitle
        title="Leads"
        subtitle="UK companies from the Companies House register, refreshed daily at 06:00 UTC from your saved searches."
        action={<button onClick={() => runNow()} disabled={!!running || activeSearches === 0} className={btn}>{running === 'all' ? 'Running… (up to 2 min)' : `Run ${activeSearches} active searches now`}</button>}
      />
      {error && <ErrorBox message={error} />}
      {message && <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Total leads" value={total} />
        <Stat label="With email" value={<span>{withEmail}<span className="ml-2 text-xs font-normal text-slate-400">{pendingEnrich} to check</span></span>} />
        <Stat label="Contacted" value={(counts.contacted ?? 0) + (counts.replied ?? 0)} />
        <Stat label="Meetings & proposals" value={(counts.meeting ?? 0) + (counts.proposal ?? 0)} />
        <Stat label="Won" value={counts.won ?? 0} />
      </div>

      <div className="mb-4 flex gap-2">
        {(['leads', 'searches'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${tab === t ? 'bg-obsidian text-white' : 'bg-white text-slate-600 hover:bg-mist'}`}>
            {t === 'searches' ? `Search library (${activeSearches}/${searches.length} active)` : `Leads (${total})`}
          </button>
        ))}
      </div>

      {tab === 'leads' ? (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Found:</span>
            {(['found', 'director', 'email', 'phone', 'website'] as ContactFilter[]).map((id) => {
              const c = CONTACT_FILTERS.find((x) => x.id === id)!;
              const on = contactFilter === id;
              return (
                <button key={id} onClick={() => { setContactFilter(on ? 'all' : id); setFilterStatus('all'); }}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${on ? 'border-accent bg-accent text-white' : 'border-steel bg-white text-slate-700 hover:border-accent'}`}>
                  {c.label} · {contactCounts[id] ?? 0}
                </button>
              );
            })}
          </div>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, email, director, phone, website, town…" className={`${inputClass} sm:max-w-xs`} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} sm:w-40`}>
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s} ({counts[s] ?? 0})</option>)}
            </select>
            <select value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} className={`${inputClass} sm:w-52`}>
              <option value="all">All searches</option>
              {searches.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={contactFilter} onChange={(e) => setContactFilter(e.target.value as ContactFilter)} className={`${inputClass} sm:w-56`}>
              {CONTACT_FILTERS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}{c.id !== 'all' && contactCounts[c.id] != null ? ` (${contactCounts[c.id]})` : ''}</option>
              ))}
            </select>
            <button onClick={enrichNow} disabled={!!running || pendingEnrich === 0} className={`${btnGhost} sm:ml-auto`}>{running === 'enrich' ? 'Searching…' : 'Find websites & emails'}</button>
            <button onClick={exportCsv} className={btnGhost}>Export CSV</button>
          </div>

          {leads.length === 0 ? (
            <Empty>
              {total === 0 ? (
                <span>No leads yet. {activeSearches} searches are ready in the Search library. <button onClick={() => runNow()} disabled={!!running} className="font-semibold text-accent-dark hover:underline">{running ? 'Running…' : 'Run them now'}</button>, or wait for the daily 06:00 run.</span>
              ) : 'No leads match these filters.'}
            </Empty>
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-steel bg-mist text-left text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Company</th>
                    <th className="px-5 py-3">Contact</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Directors</th>
                    <th className="px-5 py-3">Incorporated</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="align-top">
                      <td className="px-5 py-3">
                        <button onClick={() => openLead(lead)} className="text-left font-medium text-obsidian hover:text-accent-dark hover:underline">{lead.company_name}</button>
                        <p className="font-mono text-[11px] text-slate-400">{lead.company_number} · SIC {lead.sic_codes.join(', ')}</p>
                        {searchById(lead.search_id)?.segment && <span className="mt-1 inline-block rounded bg-mist px-1.5 py-0.5 text-[10px] text-slate-600">{searchById(lead.search_id)!.segment}</span>}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {lead.contact_email && <span className="block text-slate-700">{lead.contact_email} <Badge value="director" /></span>}
                        {lead.email ? <span className="block text-slate-700">{lead.email} {lead.email_confidence && <Badge value={lead.email_confidence} />}</span> : !lead.contact_email && <span className="text-slate-400">{lead.enrichment_checked_at ? 'Not found' : 'Pending'}</span>}
                        {lead.phone && <span className="block font-mono text-slate-600">{lead.phone}</span>}
                        {lead.website && <a href={lead.website} target="_blank" rel="noopener noreferrer" className="block text-accent-dark hover:underline">{lead.website.replace(/^https?:\/\/(www\.)?/, '')}</a>}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{lead.locality ?? '—'}<span className="block text-xs text-slate-400">{lead.postcode}</span></td>
                      <td className="px-5 py-3 text-slate-600">{lead.directors.slice(0, 2).join(', ') || '—'}{lead.directors.length > 2 && <span className="text-xs text-slate-400"> +{lead.directors.length - 2}</span>}</td>
                      <td className="px-5 py-3 text-slate-500">{formatDate(lead.incorporated_on)}</td>
                      <td className="px-5 py-3">
                        <select value={lead.status} onChange={(e) => setStatus(lead, e.target.value as LeadStatus)} className="rounded border border-steel bg-white px-2 py-1 text-xs">
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leads.length === PAGE_LIMIT && <p className="border-t border-steel px-5 py-3 text-xs text-slate-500">Showing the latest {PAGE_LIMIT}. Use filters to narrow down.</p>}
            </Card>
          )}
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-obsidian">Saved searches</h2>
              <button onClick={() => openSearch('new')} className={btn}>+ New search</button>
            </div>
            {searches.length === 0 ? (
              <Empty>No searches yet.</Empty>
            ) : (
              <div className="space-y-6">
                {[1, 2, 3].map((p) => {
                  const group = searches.filter((s) => s.priority === p);
                  if (group.length === 0) return null;
                  return (
                    <div key={p}>
                      <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">{PRIORITY_LABELS[p]}</p>
                      <Card>
                        <ul className="divide-y divide-steel">
                          {group.map((s) => (
                            <li key={s.id} className={`px-5 py-4 ${s.is_active ? '' : 'opacity-60'}`}>
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <p className="font-medium text-obsidian">{s.name}</p>
                                  <p className="text-xs text-slate-500">
                                    SIC {s.sic_codes.join(', ')} · {s.location || 'All UK'}
                                    {s.incorporated_within_days ? ` · formed in last ${s.incorporated_within_days} days` : ''} · up to {s.max_results}
                                  </p>
                                  {s.pain_point && <p className="mt-2 text-sm text-slate-700"><span className="font-semibold text-red-700">Pain:</span> {s.pain_point}</p>}
                                  {s.pitch && <p className="mt-1 text-sm text-slate-700"><span className="font-semibold text-emerald-700">Pitch:</span> {s.pitch}</p>}
                                  <p className="mt-2 text-xs text-slate-400">
                                    {offeringTitle(s.offering) && <>Package: {offeringTitle(s.offering)} · </>}
                                    {s.last_run_at ? `Last run ${new Date(s.last_run_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}: ${s.last_found} found, ${s.last_inserted} new` : 'Not run yet'}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-3 text-sm">
                                  <label className="flex items-center gap-1.5 text-xs text-slate-600">
                                    <input type="checkbox" checked={s.is_active} onChange={() => toggleActive(s)} className="accent-accent" /> Daily
                                  </label>
                                  <button onClick={() => runNow(s.id)} disabled={!!running} className="text-emerald-700 hover:underline disabled:opacity-50">{running === s.id ? 'Running…' : 'Run'}</button>
                                  <button onClick={() => openSearch(s)} className="text-accent-dark hover:underline">Edit</button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-3 font-semibold text-obsidian">Recent runs</h2>
            <Card>
              {runs.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">No runs yet.</p>
              ) : (
                <ul className="divide-y divide-steel text-sm">
                  {runs.map((r) => (
                    <li key={r.id} className="px-5 py-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">{new Date(r.started_at).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</span>
                        <span className="font-mono text-[11px] text-slate-400">{r.trigger}</span>
                      </div>
                      <p className="text-xs text-slate-500">{r.finished_at ? `${r.found} found · ${r.inserted} new` : 'Running…'}</p>
                      {r.error && <p className="mt-1 text-xs text-red-600">{r.error}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      )}

      {selected && (
        <Modal title={selected.company_name} onClose={() => setSelected(null)}>
          <form onSubmit={saveLead} className="space-y-4">
            <dl className="grid gap-3 rounded-md bg-mist p-4 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-slate-500">Company number</dt><dd><a href={chUrl(selected.company_number)} target="_blank" rel="noopener noreferrer" className="font-mono text-accent-dark hover:underline">{selected.company_number} ↗</a></dd></div>
              <div><dt className="text-xs text-slate-500">Incorporated</dt><dd>{formatDate(selected.incorporated_on)}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Registered office</dt><dd>{selected.address ?? '—'}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Active directors</dt><dd>{selected.directors.join(', ') || '—'}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs text-slate-500">SIC codes</dt><dd className="font-mono">{selected.sic_codes.join(', ')}</dd></div>
              {selected.contact_email && (
                <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Director email (Hunter, score {selected.contact_email_score})</dt><dd>{selected.contact_name}: <a href={`mailto:${selected.contact_email}`} className="text-accent-dark hover:underline">{selected.contact_email}</a></dd></div>
              )}
              {selected.google_maps_url && (
                <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Google profile</dt><dd><a href={selected.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-accent-dark hover:underline">Open in Google Maps ↗</a></dd></div>
              )}
            </dl>
            {activities.length > 0 && (
              <div className="rounded-md border border-steel p-3 text-xs">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-slate-500">Activity</p>
                <ul className="space-y-1">
                  {activities.map((a) => (
                    <li key={a.id} className="flex gap-2">
                      <span className="w-24 shrink-0 text-slate-400">{new Date(a.created_at).toLocaleDateString('en-GB')}</span>
                      <span className="w-16 shrink-0 font-medium text-obsidian">{a.channel}</span>
                      <span className="text-slate-600">{a.outcome}{a.notes ? ` · ${a.notes}` : ''}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(() => {
              const origin = searchById(selected.search_id);
              if (!origin?.pain_point && !origin?.pitch) return null;
              return (
                <div className="rounded-md border border-accent/30 bg-accent/5 p-4 text-sm">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-accent-dark">Sales angle · {origin.segment}</p>
                  {origin.pain_point && <p className="mt-2 text-slate-700"><b>Likely pain:</b> {origin.pain_point}</p>}
                  {origin.pitch && <p className="mt-1 text-slate-700"><b>Pitch:</b> {origin.pitch}</p>}
                  {offeringTitle(origin.offering) && <p className="mt-1 text-xs text-slate-500">Lead with: {offeringTitle(origin.offering)}</p>}
                </div>
              );
            })()}
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelClass}>Website</label><input value={leadForm.website} onChange={(e) => setLeadForm({ ...leadForm, website: e.target.value })} placeholder="https://" className={inputClass} /></div>
              <div><label className={labelClass}>Business email</label><input type="email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} placeholder="info@…" className={inputClass} /></div>
              <div><label className={labelClass}>Phone</label><input value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={leadForm.status} onChange={(e) => setLeadForm({ ...leadForm, status: e.target.value as LeadStatus })} className={inputClass}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div><label className={labelClass}>Notes</label><textarea rows={3} value={leadForm.notes} onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })} className={inputClass} /></div>
            {selected.email_source_url && (
              <p className="text-xs text-slate-500">Email found on <a href={selected.email_source_url} target="_blank" rel="noopener noreferrer" className="text-accent-dark underline">{selected.email_source_url}</a> ({selected.email_confidence} confidence).</p>
            )}
            <p className="text-xs text-slate-500">
              Find the website with a quick search:{' '}
              <a href={`https://www.google.com/search?q=${encodeURIComponent(`"${selected.company_name}" ${selected.locality ?? ''}`)}`} target="_blank" rel="noopener noreferrer" className="text-accent-dark underline">Google ↗</a>
              {' · '}Set status to <b>excluded</b> if they ask not to be contacted.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setSelected(null)} className={btnGhost}>Cancel</button>
              <button type="submit" className={btn}>Save lead</button>
            </div>
          </form>
        </Modal>
      )}

      {editingSearch && (
        <Modal title={editingSearch === 'new' ? 'New search' : 'Edit search'} onClose={() => setEditingSearch(null)}>
          <form onSubmit={saveSearch} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelClass}>Name</label><input name="name" value={searchForm.name} onChange={handleSearchChange} required placeholder="Online retail · Manchester" className={inputClass} /></div>
              <div><label className={labelClass}>Segment</label><input name="segment" value={searchForm.segment} onChange={handleSearchChange} placeholder="E-commerce" className={inputClass} /></div>
            </div>
            <div>
              <label className={labelClass}>SIC codes</label>
              <input name="sic_codes" value={searchForm.sic_codes} onChange={handleSearchChange} required placeholder="47910, 69201" className={`${inputClass} font-mono`} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SIC_PRESETS.map((p) => {
                  const on = searchForm.sic_codes.split(/[\s,]+/).includes(p.code);
                  return (
                    <button type="button" key={p.code} onClick={() => togglePreset(p.code)} className={`rounded-full border px-2.5 py-1 text-[11px] ${on ? 'border-accent bg-accent/10 text-accent-dark' : 'border-steel text-slate-600 hover:bg-mist'}`}>
                      {p.code} · {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelClass}>Location</label><input name="location" value={searchForm.location} onChange={handleSearchChange} placeholder="Manchester (blank = all UK)" className={inputClass} /></div>
              <div>
                <label className={labelClass}>Company type</label>
                <select name="company_type" value={searchForm.company_type} onChange={handleSearchChange} className={inputClass}>
                  <option value="ltd">Private limited (Ltd)</option>
                  <option value="plc">Public limited (PLC)</option>
                  <option value="llp">LLP</option>
                </select>
              </div>
              <div><label className={labelClass}>Incorporated from</label><input name="incorporated_from" type="date" value={searchForm.incorporated_from} onChange={handleSearchChange} className={inputClass} /></div>
              <div><label className={labelClass}>Incorporated to</label><input name="incorporated_to" type="date" value={searchForm.incorporated_to} onChange={handleSearchChange} className={inputClass} /></div>
              <div><label className={labelClass}>Max results per run</label><input name="max_results" type="number" min="1" max="1000" value={searchForm.max_results} onChange={handleSearchChange} className={inputClass} /></div>
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
                <input type="checkbox" name="is_active" checked={searchForm.is_active} onChange={handleSearchChange} className="accent-accent" /> Run daily
              </label>
            </div>
            <div><label className={labelClass}>Or: formed in the last N days (rolling)</label><input name="incorporated_within_days" type="number" min="1" max="3650" value={searchForm.incorporated_within_days} onChange={handleSearchChange} placeholder="e.g. 90" className={inputClass} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Priority</label>
                <select name="priority" value={searchForm.priority} onChange={handleSearchChange} className={inputClass}>
                  {[1, 2, 3].map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Recommended package</label>
                <select name="offering" value={searchForm.offering} onChange={handleSearchChange} className={inputClass}>
                  <option value="">None</option>
                  {OFFERINGS.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
                </select>
              </div>
            </div>
            <div><label className={labelClass}>Pain point</label><textarea name="pain_point" rows={2} value={searchForm.pain_point} onChange={handleSearchChange} className={inputClass} /></div>
            <div><label className={labelClass}>Pitch</label><textarea name="pitch" rows={2} value={searchForm.pitch} onChange={handleSearchChange} className={inputClass} /></div>
            <p className="text-xs text-slate-500">Only active companies are fetched. Tip: set "Incorporated from" to find newly formed companies, which are often still choosing their tools.</p>
            <div className="flex flex-wrap justify-between gap-3">
              {editingSearch !== 'new' ? <button type="button" onClick={() => deleteSearch(editingSearch)} className="text-sm text-red-600 hover:underline">Delete search</button> : <span />}
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditingSearch(null)} className={btnGhost}>Cancel</button>
                <button type="submit" className={btn}>Save search</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Leads;
