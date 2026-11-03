import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, ComplianceDeadline } from '../../../lib/supabase';
import { COMPANY } from '../../../data/site';
import { Card, Empty, ErrorBox, Modal, PageTitle, Spinner, btn, btnGhost, formatDate, inputClass, labelClass } from '../ui';

const AUTHORITIES: ComplianceDeadline['authority'][] = ['companies-house', 'hmrc', 'ico', 'bank', 'other'];

// Common filings for a UK private limited company. Due dates depend on the company's
// incorporation date and accounting reference date, so they are entered manually.
const TEMPLATES: { title: string; authority: ComplianceDeadline['authority']; notes: string }[] = [
  { title: 'Confirmation statement (CS01)', authority: 'companies-house', notes: 'Due within 14 days of the review period end, at least once every 12 months.' },
  { title: 'Annual accounts', authority: 'companies-house', notes: 'Micro-entity accounts. Usually due 9 months after the accounting year end.' },
  { title: 'Company Tax Return (CT600)', authority: 'hmrc', notes: 'Due 12 months after the end of the accounting period.' },
  { title: 'Corporation Tax payment', authority: 'hmrc', notes: 'Usually due 9 months and 1 day after the end of the accounting period.' },
  { title: 'ICO data protection fee', authority: 'ico', notes: 'Annual fee renewal for processing personal data.' },
];

const today = () => new Date().toISOString().slice(0, 10);
const daysUntil = (date: string) => Math.round((new Date(date).getTime() - new Date(today()).getTime()) / 86_400_000);

const urgency = (d: ComplianceDeadline) => {
  if (d.status === 'done') return { label: `Done ${formatDate(d.completed_on)}`, tone: 'bg-emerald-100 text-emerald-800' };
  const days = daysUntil(d.due_on);
  if (days < 0) return { label: `Overdue by ${-days} day${days === -1 ? '' : 's'}`, tone: 'bg-red-100 text-red-800' };
  if (days <= 30) return { label: `Due in ${days} day${days === 1 ? '' : 's'}`, tone: 'bg-amber-100 text-amber-800' };
  return { label: `Due in ${days} days`, tone: 'bg-slate-100 text-slate-700' };
};

const emptyForm = { title: '', authority: 'companies-house' as ComplianceDeadline['authority'], due_on: '', notes: '' };

const Compliance: React.FC = () => {
  const [items, setItems] = useState<ComplianceDeadline[] | null>(null);
  const [editing, setEditing] = useState<ComplianceDeadline | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase!.from('compliance_deadlines').select('*').order('due_on');
    if (error) setError('Could not load deadlines.');
    else setItems(data as ComplianceDeadline[]);
  };

  useEffect(() => { load(); }, []);

  const openForm = (item: ComplianceDeadline | 'new', template?: (typeof TEMPLATES)[number]) => {
    setEditing(item);
    setForm(item === 'new'
      ? { ...emptyForm, ...(template ?? {}) }
      : { title: item.title, authority: item.authority, due_on: item.due_on, notes: item.notes ?? '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, notes: form.notes || null };
    const { error } = editing === 'new'
      ? await supabase!.from('compliance_deadlines').insert(payload)
      : await supabase!.from('compliance_deadlines').update(payload).eq('id', (editing as ComplianceDeadline).id);
    setSaving(false);
    if (error) {
      setError('Could not save the deadline.');
      return;
    }
    setEditing(null);
    load();
  };

  const setDone = async (item: ComplianceDeadline, done: boolean) => {
    const { error } = await supabase!.from('compliance_deadlines')
      .update(done ? { status: 'done', completed_on: today() } : { status: 'pending', completed_on: null })
      .eq('id', item.id);
    if (error) setError('Could not update the deadline.');
    else load();
  };

  const remove = async (item: ComplianceDeadline) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    const { error } = await supabase!.from('compliance_deadlines').delete().eq('id', item.id);
    if (error) setError('Could not delete the deadline.');
    else {
      setEditing(null);
      load();
    }
  };

  if (!items) return error ? <ErrorBox message={error} /> : <Spinner />;

  const pending = items.filter((i) => i.status === 'pending');
  const done = items.filter((i) => i.status === 'done').reverse();

  return (
    <div>
      <PageTitle
        title="Compliance"
        subtitle="Statutory deadlines and the verification pack for banks and payment partners."
        action={<button onClick={() => openForm('new')} className={btn}>+ Deadline</button>}
      />
      {error && <ErrorBox message={error} />}

      <Card className="mb-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-obsidian">Company verification pack</h2>
          <p className="mt-1 text-sm text-slate-500">Company details, registered activities, verified deliveries and trading summary, ready to save as PDF for banks, Stripe or HMRC.</p>
        </div>
        <Link to="/admin/compliance/report" className={`${btn} shrink-0`}>Generate pack →</Link>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-semibold text-obsidian">Upcoming</h2>
          {pending.length === 0 ? (
            <Empty>No pending deadlines. Add your filings using the templates on the right.</Empty>
          ) : (
            <Card>
              <ul className="divide-y divide-steel">
                {pending.map((item) => {
                  const u = urgency(item);
                  return (
                    <li key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-medium text-obsidian">{item.title}</p>
                        <p className="text-xs text-slate-500">{item.authority} · due {formatDate(item.due_on)}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className={`rounded px-2 py-0.5 text-[11px] font-semibold ${u.tone}`}>{u.label}</span>
                        <button onClick={() => setDone(item, true)} className="text-sm text-emerald-700 hover:underline">Mark done</button>
                        <button onClick={() => openForm(item)} className="text-sm text-accent-dark hover:underline">Edit</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {done.length > 0 && (
            <>
              <h2 className="mt-8 mb-3 font-semibold text-obsidian">Completed</h2>
              <Card>
                <ul className="divide-y divide-steel">
                  {done.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                      <span className="text-slate-600">{item.title} <span className="text-xs text-slate-400">· due {formatDate(item.due_on)}</span></span>
                      <span className="flex items-center gap-3">
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">Done {formatDate(item.completed_on)}</span>
                        <button onClick={() => setDone(item, false)} className="text-xs text-slate-500 hover:underline">Undo</button>
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}
        </div>

        <Card className="h-fit p-5">
          <h2 className="font-semibold text-obsidian">Quick add</h2>
          <p className="mt-1 text-xs text-slate-500">
            Check exact dates for company {COMPANY.number} on{' '}
            <a href={COMPANY.companiesHouseUrl} target="_blank" rel="noopener noreferrer" className="text-accent-dark underline">Companies House</a>.
          </p>
          <ul className="mt-4 space-y-2">
            {TEMPLATES.map((t) => (
              <li key={t.title}>
                <button onClick={() => openForm('new', t)} className="w-full rounded-md border border-steel px-3 py-2 text-left text-sm hover:border-accent hover:bg-mist">
                  + {t.title}
                  <span className="block text-[11px] text-slate-500">{t.authority}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {editing && (
        <Modal title={editing === 'new' ? 'Add deadline' : 'Edit deadline'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className={labelClass}>Title</label><input name="title" value={form.title} onChange={handleChange} required className={inputClass} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Authority</label>
                <select name="authority" value={form.authority} onChange={handleChange} className={inputClass}>
                  {AUTHORITIES.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Due on</label><input name="due_on" type="date" value={form.due_on} onChange={handleChange} required className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Notes</label><textarea name="notes" rows={3} value={form.notes} onChange={handleChange} className={inputClass} /></div>
            <div className="flex flex-wrap justify-between gap-3">
              {editing !== 'new' ? <button type="button" onClick={() => remove(editing)} className="text-sm text-red-600 hover:underline">Delete</button> : <span />}
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
                <button type="submit" disabled={saving} className={btn}>{saving ? 'Saving…' : 'Save'}</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Compliance;
