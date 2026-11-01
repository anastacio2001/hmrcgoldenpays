import React, { useEffect, useState } from 'react';
import { supabase, Client, Payment, PaymentKind, PaymentMethod, PaymentStatus, Project } from '../../lib/supabase';
import { Badge, Card, Empty, ErrorBox, Modal, PageTitle, Spinner, Stat, btn, btnGhost, formatDate, formatGbp, inputClass, labelClass } from './ui';

const STATUSES: PaymentStatus[] = ['pending', 'paid', 'refunded', 'cancelled'];
const KINDS: PaymentKind[] = ['invoice', 'deposit', 'balance', 'subscription', 'licence'];
const METHODS: PaymentMethod[] = ['stripe', 'bank-transfer', 'other'];
const INVOICE_PATTERN = /^INV-\d{4}-[A-Z0-9]{4,12}$/;

const today = () => new Date().toISOString().slice(0, 10);

const addDays = (date: string, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const randomInvoiceNumber = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `INV-${new Date().getFullYear()}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
};

const isOverdue = (p: Payment) => p.status === 'pending' && !!p.due_on && p.due_on < today();
const displayStatus = (p: Payment) => (isOverdue(p) ? 'overdue' : p.status);
const total = (p: Payment) => Number(p.amount_gbp) + Number(p.vat_gbp);

const newForm = () => {
  const issued = today();
  return {
    invoice_number: randomInvoiceNumber(),
    client_id: '',
    project_id: '',
    description: '',
    kind: 'invoice' as PaymentKind,
    method: 'stripe' as PaymentMethod,
    amount_gbp: '',
    vat_gbp: '0',
    status: 'pending' as PaymentStatus,
    issued_on: issued,
    due_on: addDays(issued, 14), // Terms of Service: invoices payable within 14 days
    paid_on: '',
    stripe_payment_id: '',
    notes: '',
  };
};

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [clients, setClients] = useState<Pick<Client, 'id' | 'name' | 'company'>[]>([]);
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name' | 'client_id'>[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [editing, setEditing] = useState<Payment | 'new' | null>(null);
  const [form, setForm] = useState(newForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [p, c, pr] = await Promise.all([
      supabase!.from('payments').select('*').order('issued_on', { ascending: false }),
      supabase!.from('clients').select('id, name, company').order('name'),
      supabase!.from('projects').select('id, name, client_id').order('name'),
    ]);
    if (p.error || c.error || pr.error) setError('Could not load payments.');
    else {
      setPayments(p.data as Payment[]);
      setClients(c.data);
      setProjects(pr.data);
    }
  };

  useEffect(() => { load(); }, []);

  const clientName = (id: string | null) => {
    const client = clients.find((c) => c.id === id);
    return client ? client.company || client.name : '—';
  };

  const openForm = (payment: Payment | 'new') => {
    setEditing(payment);
    setForm(payment === 'new' ? newForm() : {
      invoice_number: payment.invoice_number,
      client_id: payment.client_id ?? '',
      project_id: payment.project_id ?? '',
      description: payment.description,
      kind: payment.kind,
      method: payment.method,
      amount_gbp: String(payment.amount_gbp),
      vat_gbp: String(payment.vat_gbp),
      status: payment.status,
      issued_on: payment.issued_on,
      due_on: payment.due_on ?? '',
      paid_on: payment.paid_on ?? '',
      stripe_payment_id: payment.stripe_payment_id ?? '',
      notes: payment.notes ?? '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    // Marking as paid needs a payment date; default it to today.
    if (name === 'status' && value === 'paid' && !next.paid_on) next.paid_on = today();
    setForm(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const invoice_number = form.invoice_number.trim().toUpperCase();
    if (!INVOICE_PATTERN.test(invoice_number)) {
      setError('Invoice number must look like INV-2026-AB12CD.');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      invoice_number,
      client_id: form.client_id || null,
      project_id: form.project_id || null,
      amount_gbp: Number(form.amount_gbp),
      vat_gbp: Number(form.vat_gbp || 0),
      due_on: form.due_on || null,
      paid_on: form.paid_on || null,
      stripe_payment_id: form.stripe_payment_id.trim() || null,
      notes: form.notes || null,
    };
    const { error } = editing === 'new'
      ? await supabase!.from('payments').insert(payload)
      : await supabase!.from('payments').update(payload).eq('id', (editing as Payment).id);
    setSaving(false);
    if (error) {
      setError(
        error.code === '23505' ? 'That invoice number or Stripe payment ID already exists.'
        : error.code === '23514' ? 'Check the amounts and dates (due date after issue date; paid payments need a paid date).'
        : 'Could not save the payment.'
      );
      return;
    }
    setError(null);
    setEditing(null);
    load();
  };

  const markPaid = async (payment: Payment) => {
    const { error } = await supabase!.from('payments').update({ status: 'paid', paid_on: today() }).eq('id', payment.id);
    if (error) setError('Could not update the payment.');
    else load();
  };

  const remove = async (payment: Payment) => {
    if (!window.confirm(`Delete ${payment.invoice_number}? Consider marking it cancelled instead, to keep the record.`)) return;
    const { error } = await supabase!.from('payments').delete().eq('id', payment.id);
    if (error) setError('Could not delete the payment.');
    else {
      setEditing(null);
      load();
    }
  };

  if (!payments) return error ? <ErrorBox message={error} /> : <Spinner />;

  const yearStart = `${new Date().getFullYear()}-01-01`;
  const receivedYtd = payments.filter((p) => p.status === 'paid' && (p.paid_on ?? '') >= yearStart).reduce((s, p) => s + total(p), 0);
  const outstanding = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + total(p), 0);
  const overdue = payments.filter(isOverdue);

  const filtered = filter === 'all' ? payments : payments.filter((p) => displayStatus(p) === filter);
  const projectOptions = form.client_id ? projects.filter((p) => p.client_id === form.client_id) : projects;

  return (
    <div>
      <PageTitle
        title="Payments"
        subtitle="Invoices, deposits, subscriptions and licence sales. Amounts in GBP."
        action={<button onClick={() => openForm('new')} className={btn}>+ Record payment</button>}
      />
      {error && <ErrorBox message={error} />}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={`Received ${new Date().getFullYear()}`} value={formatGbp(receivedYtd)} />
        <Stat label="Outstanding" value={formatGbp(outstanding)} />
        <Stat label="Overdue" value={<span className={overdue.length ? 'text-red-600' : ''}>{overdue.length}</span>} />
        <Stat label="Records" value={payments.length} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {['all', 'pending', 'overdue', 'paid', 'refunded', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${filter === s ? 'bg-obsidian text-white' : 'bg-white text-slate-600 hover:bg-mist'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Empty>{payments.length === 0 ? 'No payments recorded yet.' : `No ${filter} payments.`}</Empty>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-steel bg-mist text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Invoice</th>
                <th className="px-5 py-3">Client</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs text-obsidian">{p.invoice_number}</p>
                    <p className="text-xs text-slate-500">{p.description} · {p.kind} · {p.method}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{clientName(p.client_id)}</td>
                  <td className="px-5 py-3 text-right font-medium text-obsidian">
                    {formatGbp(total(p))}
                    {Number(p.vat_gbp) > 0 && <p className="text-[11px] font-normal text-slate-400">incl. VAT {formatGbp(p.vat_gbp)}</p>}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{p.status === 'paid' ? `Paid ${formatDate(p.paid_on)}` : formatDate(p.due_on)}</td>
                  <td className="px-5 py-3"><Badge value={displayStatus(p)} /></td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    {p.status === 'pending' && (
                      <button onClick={() => markPaid(p)} className="mr-4 text-emerald-700 hover:underline">Mark paid</button>
                    )}
                    <button onClick={() => openForm(p)} className="text-accent-dark hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <p className="mt-6 text-xs text-slate-500">
        Stripe payments will be recorded here automatically once the Stripe webhook is connected. Until then, record them manually with the Stripe payment ID.
      </p>

      {editing && (
        <Modal title={editing === 'new' ? 'Record payment' : `Edit ${editing.invoice_number}`} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Invoice number</label>
                <input name="invoice_number" value={form.invoice_number} onChange={handleChange} required className={`${inputClass} font-mono uppercase`} />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select name="kind" value={form.kind} onChange={handleChange} className={inputClass}>
                  {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <input name="description" value={form.description} onChange={handleChange} required placeholder="e.g. 5-day development sprint: deposit" className={inputClass} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Client</label>
                <select name="client_id" value={form.client_id} onChange={handleChange} className={inputClass}>
                  <option value="">No client</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Project</label>
                <select name="project_id" value={form.project_id} onChange={handleChange} className={inputClass}>
                  <option value="">No project</option>
                  {projectOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Amount (£, excl. VAT)</label><input name="amount_gbp" type="number" min="0.01" step="0.01" value={form.amount_gbp} onChange={handleChange} required className={inputClass} /></div>
              <div><label className={labelClass}>VAT (£)</label><input name="vat_gbp" type="number" min="0" step="0.01" value={form.vat_gbp} onChange={handleChange} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Method</label>
                <select name="method" value={form.method} onChange={handleChange} className={inputClass}>
                  {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Issued on</label><input name="issued_on" type="date" value={form.issued_on} onChange={handleChange} required className={inputClass} /></div>
              <div><label className={labelClass}>Due on</label><input name="due_on" type="date" value={form.due_on} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Paid on</label><input name="paid_on" type="date" value={form.paid_on} onChange={handleChange} required={form.status === 'paid'} className={inputClass} /></div>
              <div><label className={labelClass}>Stripe payment ID</label><input name="stripe_payment_id" value={form.stripe_payment_id} onChange={handleChange} placeholder="pi_… (optional)" className={`${inputClass} font-mono`} /></div>
            </div>
            <div><label className={labelClass}>Notes</label><textarea name="notes" rows={2} value={form.notes} onChange={handleChange} className={inputClass} /></div>
            <p className="text-sm text-slate-600">
              Total: <span className="font-semibold text-obsidian">{formatGbp(Number(form.amount_gbp || 0) + Number(form.vat_gbp || 0))}</span>
            </p>
            <div className="flex flex-wrap justify-between gap-3">
              {editing !== 'new' ? (
                <button type="button" onClick={() => remove(editing)} className="text-sm text-red-600 hover:underline">Delete</button>
              ) : <span />}
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
                <button type="submit" disabled={saving} className={btn}>{saving ? 'Saving…' : 'Save payment'}</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Payments;
