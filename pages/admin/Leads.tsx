import React, { useCallback, useEffect, useState } from 'react';
import { supabase, Lead, LeadRun, LeadSearch, LeadStatus } from '../../lib/supabase';
import { Badge, Card, Empty, ErrorBox, Modal, PageTitle, Spinner, Stat, btn, btnGhost, formatDate, inputClass, labelClass } from './ui';

const STATUSES: LeadStatus[] = ['new', 'qualified', 'contacted', 'replied', 'meeting', 'proposal', 'won', 'lost', 'excluded'];
const PAGE_LIMIT = 500;

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

const emptySearch = { name: '', sic_codes: '', location: '', company_type: 'ltd' as LeadSearch['company_type'], incorporated_from: '', incorporated_to: '', max_results: '200', is_active: true };

const csvCell = (value: unknown) => {
  const s = value == null ? '' : Array.isArray(value) ? value.join('; ') : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const chUrl = (number: string) => `https://find-and-update.company-information.service.gov.uk/company/${number}`;

const Leads: React.FC = () => {
  const [tab, setTab] = useState<'leads' | 'searches'>('leads');
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [searches, setSearches] = useState<LeadSearch[]>([]);
  const [runs, setRuns] = useState<LeadRun[]>([]);
  const [filterStatus, setFilterStatus] = useState('new');
  const [filterSearch, setFilterSearch] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Lead | null>(null);
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
    const term = query.trim();
    if (term) q = q.or(`company_name.ilike.%${term.replace(/[%,()]/g, '')}%,locality.ilike.%${term.replace(/[%,()]/g, '')}%,postcode.ilike.%${term.replace(/[%,()]/g, '')}%`);
    const { data, error } = await q;
    if (error) setError('Could not load leads.');
    else setLeads(data as Lead[]);
  }, [filterStatus, filterSearch, query]);

  const loadMeta = async () => {
    const [s, r, ...statusCounts] = await Promise.all([
      supabase!.from('lead_searches').select('*').order('created_at'),
      supabase!.from('lead_runs').select('*').order('started_at', { ascending: false }).limit(10),
      ...STATUSES.map((st) => supabase!.from('leads').select('*', { count: 'exact', head: true }).eq('status', st)),
    ]);
    if (s.error || r.error) {
      setError('Could not load searches.');
      return;
    }
    setSearches(s.data as LeadSearch[]);
    setRuns(r.data as LeadRun[]);
    setCounts(Object.fromEntries(STATUSES.map((st, i) => [st, statusCounts[i].count ?? 0])));
  };

  useEffect(() => { loadMeta(); }, []);
  useEffect(() => {
    const t = setTimeout(loadLeads, 250); // debounce typing
    return () => clearTimeout(t);
  }, [loadLeads]);

  const openLead = (lead: Lead) => {
    setSelected(lead);
    setLeadForm({ website: lead.website ?? '', email: lead.email ?? '', phone: lead.phone ?? '', status: lead.status, notes: lead.notes ?? '' });
  };

  const saveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const payload = {
      website: leadForm.website || null,
      email: leadForm.email || null,
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
      sic_codes: s.sic_codes.join(', '),
      location: s.location ?? '',
      company_type: s.company_type,
      incorporated_from: s.incorporated_from ?? '',
      incorporated_to: s.incorporated_to ?? '',
      max_results: String(s.max_results),
      is_active: s.is_active,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      max_results: Number(searchForm.max_results),
      is_active: searchForm.is_active,
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
      setMessage(`Run complete: ${data.found} companies found, ${data.inserted} new leads added.${data.errors?.length ? ` ${data.errors.length} search(es) failed.` : ''}`);
    }
    loadMeta();
    loadLeads();
  };

  if (!leads) return error ? <ErrorBox message={error} /> : <Spinner />;

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <PageTitle
        title="Leads"
        subtitle="UK companies from the Companies House register, refreshed daily at 06:00 UTC from your saved searches."
        action={<button onClick={() => runNow()} disabled={!!running || searches.length === 0} className={btn}>{running === 'all' ? 'Running…' : 'Run all searches now'}</button>}
      />
      {error && <ErrorBox message={error} />}
      {message && <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Total leads" value={total} />
        <Stat label="New" value={counts.new ?? 0} />
        <Stat label="Contacted" value={(counts.contacted ?? 0) + (counts.replied ?? 0)} />
        <Stat label="Meetings & proposals" value={(counts.meeting ?? 0) + (counts.proposal ?? 0)} />
        <Stat label="Won" value={counts.won ?? 0} />
      </div>

      <div className="mb-4 flex gap-2">
        {(['leads', 'searches'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${tab === t ? 'bg-obsidian text-white' : 'bg-white text-slate-600 hover:bg-mist'}`}>
            {t === 'searches' ? `Searches (${searches.length})` : 'Leads'}
          </button>
        ))}
      </div>

      {tab === 'leads' ? (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search company, town or postcode…" className={`${inputClass} sm:max-w-xs`} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} sm:w-40`}>
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s} ({counts[s] ?? 0})</option>)}
            </select>
            <select value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} className={`${inputClass} sm:w-52`}>
              <option value="all">All searches</option>
              {searches.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={exportCsv} className={`${btnGhost} sm:ml-auto`}>Export CSV</button>
          </div>

          {leads.length === 0 ? (
            <Empty>
              {searches.length === 0
                ? 'No leads yet. Create a search in the Searches tab, then run it.'
                : 'No leads match these filters.'}
            </Empty>
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-steel bg-mist text-left text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Company</th>
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
              <Empty>No searches yet. Start with, for example, "Online retail · Manchester" (SIC 47910).</Empty>
            ) : (
              <Card>
                <ul className="divide-y divide-steel">
                  {searches.map((s) => (
                    <li key={s.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-obsidian">{s.name} {!s.is_active && <Badge value="inactive" />}</p>
                        <p className="text-xs text-slate-500">
                          SIC {s.sic_codes.join(', ')} · {s.location || 'All UK'} · {s.company_type} · up to {s.max_results}
                        </p>
                        <p className="text-xs text-slate-400">
                          {s.last_run_at ? `Last run ${new Date(s.last_run_at).toLocaleString('en-GB')}: ${s.last_found} found, ${s.last_inserted} new` : 'Never run'}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-3 text-sm">
                        <button onClick={() => runNow(s.id)} disabled={!!running} className="text-emerald-700 hover:underline disabled:opacity-50">{running === s.id ? 'Running…' : 'Run now'}</button>
                        <button onClick={() => openSearch(s)} className="text-accent-dark hover:underline">Edit</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
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
            </dl>
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
            <div><label className={labelClass}>Name</label><input name="name" value={searchForm.name} onChange={handleSearchChange} required placeholder="Online retail · Manchester" className={inputClass} /></div>
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
