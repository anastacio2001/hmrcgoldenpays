import React, { useEffect, useState } from 'react';
import { supabase, Client, ClientStatus } from '../../lib/supabase';
import { Badge, Card, Empty, ErrorBox, Modal, PageTitle, Spinner, Stat, btn, btnDanger, btnGhost, formatDate, inputClass, labelClass } from './ui';

const STATUSES: ClientStatus[] = ['prospect', 'active', 'inactive'];
const emptyForm = { name: '', company: '', email: '', phone: '', status: 'prospect' as ClientStatus, notes: '' };

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [editing, setEditing] = useState<Client | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase!.from('clients').select('*').order('created_at', { ascending: false });
    if (error) setError('Could not load clients.');
    else setClients(data as Client[]);
  };

  useEffect(() => { load(); }, []);

  const openForm = (client: Client | 'new') => {
    setEditing(client);
    setForm(client === 'new' ? emptyForm : {
      name: client.name,
      company: client.company ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      status: client.status,
      notes: client.notes ?? '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      company: form.company || null,
      email: form.email || null,
      phone: form.phone || null,
      notes: form.notes || null,
    };
    const { error } = editing === 'new'
      ? await supabase!.from('clients').insert(payload)
      : await supabase!.from('clients').update(payload).eq('id', (editing as Client).id);
    setSaving(false);
    if (error) {
      setError('Could not save the client.');
      return;
    }
    setEditing(null);
    load();
  };

  const remove = async (client: Client) => {
    if (!window.confirm(`Delete ${client.name}? Their projects will be kept without a client.`)) return;
    const { error } = await supabase!.from('clients').delete().eq('id', client.id);
    if (error) setError(error.code === '23503' ? 'This client has payments recorded and cannot be deleted. Mark them inactive instead.' : 'Could not delete the client.');
    else setClients((list) => list!.filter((c) => c.id !== client.id));
  };

  if (!clients) return error ? <ErrorBox message={error} /> : <Spinner />;

  return (
    <div>
      <PageTitle title="Clients" subtitle="Client and prospect records." action={<button onClick={() => openForm('new')} className={btn}>+ Add client</button>} />
      {error && <ErrorBox message={error} />}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {STATUSES.map((s) => <Stat key={s} label={s} value={clients.filter((c) => c.status === s).length} />)}
      </div>

      {clients.length === 0 ? (
        <Empty>No clients yet. Add one, or convert an inquiry.</Empty>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-steel bg-mist text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Added</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-obsidian">{client.name}</p>
                    <p className="text-slate-500">{client.company}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    <p>{client.email}</p>
                    <p>{client.phone}</p>
                  </td>
                  <td className="px-5 py-3"><Badge value={client.status} /></td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(client.created_at)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <button onClick={() => openForm(client)} className="mr-4 text-accent-dark hover:underline">Edit</button>
                    <button onClick={() => remove(client)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add client' : 'Edit client'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelClass}>Name</label><input name="name" value={form.name} onChange={handleChange} required className={inputClass} /></div>
              <div><label className={labelClass}>Company</label><input name="company" value={form.company} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Phone</label><input name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputClass} /></div>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Notes</label><textarea name="notes" rows={3} value={form.notes} onChange={handleChange} className={inputClass} /></div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
              <button type="submit" disabled={saving} className={btn}>{saving ? 'Saving…' : 'Save client'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Clients;
