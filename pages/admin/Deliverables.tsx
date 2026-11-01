import React, { useEffect, useState } from 'react';
import { supabase, Deliverable, Project } from '../../lib/supabase';
import { COMPANY, SIC_CODES } from '../../data/site';
import { Badge, Card, Empty, ErrorBox, Modal, PageTitle, Spinner, btn, btnGhost, formatDate, inputClass, labelClass } from './ui';

const DEFAULT_APPROVER = `${COMPANY.director}, Managing Director`;
const REFERENCE_PATTERN = /^GPY-\d{4}-[A-Z0-9]{4,12}$/;

// Unambiguous characters (no 0/O, 1/I) for a non-guessable suffix.
const randomReference = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const suffix = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `GPY-${new Date().getFullYear()}-${suffix}`;
};

const newForm = () => ({
  reference: randomReference(),
  client_classification: '',
  sic_code: '62012',
  deliverable_summary: '',
  accepted_on: new Date().toISOString().slice(0, 10),
  approved_by: DEFAULT_APPROVER,
  is_public: false,
  project_id: '',
});

const Deliverables: React.FC = () => {
  const [items, setItems] = useState<Deliverable[] | null>(null);
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name'>[]>([]);
  const [editing, setEditing] = useState<Deliverable | 'new' | null>(null);
  const [form, setForm] = useState(newForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    const [d, p] = await Promise.all([
      supabase!.from('deliverables').select('*').order('accepted_on', { ascending: false }),
      supabase!.from('projects').select('id, name').order('name'),
    ]);
    if (d.error || p.error) setError('Could not load deliverables.');
    else {
      setItems(d.data as Deliverable[]);
      setProjects(p.data);
    }
  };

  useEffect(() => { load(); }, []);

  const openForm = (item: Deliverable | 'new') => {
    setEditing(item);
    setForm(item === 'new' ? newForm() : {
      reference: item.reference,
      client_classification: item.client_classification,
      sic_code: item.sic_code,
      deliverable_summary: item.deliverable_summary,
      accepted_on: item.accepted_on,
      approved_by: item.approved_by,
      is_public: item.is_public,
      project_id: item.project_id ?? '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reference = form.reference.trim().toUpperCase();
    if (!REFERENCE_PATTERN.test(reference)) {
      setError('Reference must look like GPY-2026-AB12CD.');
      return;
    }
    setSaving(true);
    const payload = { ...form, reference, project_id: form.project_id || null };
    const { error } = editing === 'new'
      ? await supabase!.from('deliverables').insert(payload)
      : await supabase!.from('deliverables').update(payload).eq('id', (editing as Deliverable).id);
    setSaving(false);
    if (error) {
      setError(error.code === '23505' ? 'That reference already exists.' : 'Could not save the deliverable.');
      return;
    }
    setError(null);
    setEditing(null);
    load();
  };

  const remove = async (item: Deliverable) => {
    if (!window.confirm(`Delete ${item.reference}? It will no longer verify.`)) return;
    const { error } = await supabase!.from('deliverables').delete().eq('id', item.id);
    if (error) setError('Could not delete the deliverable.');
    else {
      setItems((list) => list!.filter((d) => d.id !== item.id));
      setEditing(null);
    }
  };

  const copyLink = async (reference: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/verify?ref=${reference}`);
    setCopied(reference);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!items) return error ? <ErrorBox message={error} /> : <Spinner />;

  return (
    <div>
      <PageTitle
        title="Deliverables"
        subtitle="Accepted deliveries for the public Verification Portal. Only records marked public can be looked up."
        action={<button onClick={() => openForm('new')} className={btn}>+ Record delivery</button>}
      />
      {error && <ErrorBox message={error} />}

      {items.length === 0 ? (
        <Empty>No deliveries recorded yet.</Empty>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-steel bg-mist text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Deliverable</th>
                <th className="px-5 py-3">Accepted</th>
                <th className="px-5 py-3">Visibility</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3 font-mono text-xs">{item.reference}</td>
                  <td className="px-5 py-3">
                    <p className="text-obsidian">{item.deliverable_summary}</p>
                    <p className="text-xs text-slate-500">{item.client_classification} · SIC {item.sic_code}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(item.accepted_on)}</td>
                  <td className="px-5 py-3"><Badge value={item.is_public ? 'public' : 'private'} /></td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    {item.is_public && (
                      <button onClick={() => copyLink(item.reference)} className="mr-4 text-slate-600 hover:underline">
                        {copied === item.reference ? 'Copied ✓' : 'Copy link'}
                      </button>
                    )}
                    <button onClick={() => openForm(item)} className="text-accent-dark hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Record delivery' : `Edit ${editing.reference}`} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Reference</label>
              <input name="reference" value={form.reference} onChange={handleChange} required className={`${inputClass} font-mono uppercase`} />
            </div>
            <div>
              <label className={labelClass}>Deliverable summary</label>
              <input name="deliverable_summary" value={form.deliverable_summary} onChange={handleChange} required placeholder="e.g. REST API Gateway Deployed" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Client classification (no names)</label>
              <input name="client_classification" value={form.client_classification} onChange={handleChange} required placeholder="e.g. UK SME · E-commerce" className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Service area</label>
                <select name="sic_code" value={form.sic_code} onChange={handleChange} className={inputClass}>
                  {SIC_CODES.map((s) => <option key={s.code} value={s.code}>{s.code} · {s.area}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Accepted on</label><input name="accepted_on" type="date" value={form.accepted_on} onChange={handleChange} required className={inputClass} /></div>
              <div>
                <label className={labelClass}>Project</label>
                <select name="project_id" value={form.project_id} onChange={handleChange} className={inputClass}>
                  <option value="">Not linked</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Approved by</label><input name="approved_by" value={form.approved_by} onChange={handleChange} required className={inputClass} /></div>
            </div>
            <label className="flex items-start gap-3 rounded-md bg-mist p-3 text-sm text-slate-700">
              <input type="checkbox" name="is_public" checked={form.is_public} onChange={handleChange} className="mt-0.5 accent-accent" />
              <span>Publish on the Verification Portal. Only tick this if the client has accepted the delivery and agreed to publication.</span>
            </label>
            {editing !== 'new' && (
              <p className="break-all font-mono text-[11px] text-slate-500">Fingerprint: {editing.fingerprint}</p>
            )}
            <div className="flex flex-wrap justify-between gap-3">
              {editing !== 'new' ? (
                <button type="button" onClick={() => remove(editing)} className="text-sm text-red-600 hover:underline">Delete</button>
              ) : <span />}
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

export default Deliverables;
