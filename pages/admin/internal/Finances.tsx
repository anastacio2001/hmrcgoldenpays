import React, { useEffect, useMemo, useState } from 'react';
import { supabase, Client, Expense, ExpenseCategory, Payment, Project } from '../../../lib/supabase';
import { openDocument, uploadDocument } from '../../../lib/documents';
import { Card, Empty, ErrorBox, Modal, PageTitle, Spinner, Stat, btn, btnGhost, formatDate, formatGbp, inputClass, labelClass } from '../ui';

const CATEGORIES: ExpenseCategory[] = ['software', 'hosting', 'equipment', 'professional-fees', 'office', 'travel', 'marketing', 'bank-fees', 'insurance', 'training', 'other'];
const METHODS = ['card', 'bank-transfer', 'direct-debit', 'cash', 'other'] as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const today = () => new Date().toISOString().slice(0, 10);
const emptyForm = () => ({ spent_on: today(), supplier: '', description: '', category: 'software' as ExpenseCategory, amount_gbp: '', method: 'card' as Expense['method'], project_id: '', notes: '' });

/** Revenue is recognised on the date a payment was received; refunded/cancelled payments are excluded. */
const paidIn = (p: Payment, year: number) => p.status === 'paid' && !!p.paid_on && p.paid_on.startsWith(String(year));
const paymentTotal = (p: Payment) => Number(p.amount_gbp) + Number(p.vat_gbp);

const csvCell = (value: unknown) => {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const downloadCsv = (filename: string, rows: unknown[][]) => {
  const blob = new Blob(['﻿' + rows.map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
};

const Finances: React.FC = () => {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [clients, setClients] = useState<Pick<Client, 'id' | 'name' | 'company'>[]>([]);
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name'>[]>([]);
  const [receiptPaths, setReceiptPaths] = useState<Record<string, string>>({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [editing, setEditing] = useState<Expense | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [p, e, c, pr, d] = await Promise.all([
      supabase!.from('payments').select('*'),
      supabase!.from('expenses').select('*').order('spent_on', { ascending: false }),
      supabase!.from('clients').select('id, name, company'),
      supabase!.from('projects').select('id, name').order('name'),
      supabase!.from('documents').select('id, storage_path').eq('category', 'receipt'),
    ]);
    if (p.error || e.error || c.error || pr.error || d.error) {
      setError('Could not load financial data.');
      return;
    }
    setPayments(p.data as Payment[]);
    setExpenses(e.data as Expense[]);
    setClients(c.data);
    setProjects(pr.data);
    setReceiptPaths(Object.fromEntries(d.data.map((doc) => [doc.id, doc.storage_path])));
  };

  useEffect(() => { load(); }, []);

  const years = useMemo(() => {
    const set = new Set([new Date().getFullYear()]);
    payments?.forEach((p) => p.paid_on && set.add(Number(p.paid_on.slice(0, 4))));
    expenses.forEach((e) => set.add(Number(e.spent_on.slice(0, 4))));
    return [...set].sort((a, b) => b - a);
  }, [payments, expenses]);

  if (!payments) return error ? <ErrorBox message={error} /> : <Spinner />;

  const yearPayments = payments.filter((p) => paidIn(p, year));
  const yearExpenses = expenses.filter((e) => e.spent_on.startsWith(String(year)));
  const revenue = yearPayments.reduce((s, p) => s + paymentTotal(p), 0);
  const spent = yearExpenses.reduce((s, e) => s + Number(e.amount_gbp), 0);
  const outstanding = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + paymentTotal(p), 0);

  const monthly = MONTHS.map((label, i) => {
    const prefix = `${year}-${String(i + 1).padStart(2, '0')}`;
    const r = yearPayments.filter((p) => p.paid_on!.startsWith(prefix)).reduce((s, p) => s + paymentTotal(p), 0);
    const x = yearExpenses.filter((e) => e.spent_on.startsWith(prefix)).reduce((s, e) => s + Number(e.amount_gbp), 0);
    return { label, revenue: r, expenses: x, profit: r - x };
  });

  const byCategory = CATEGORIES
    .map((cat) => ({ cat, total: yearExpenses.filter((e) => e.category === cat).reduce((s, e) => s + Number(e.amount_gbp), 0) }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const clientName = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : '';
  };

  const exportLedger = () => {
    const rows: unknown[][] = [['Date', 'Type', 'Reference', 'Counterparty', 'Description', 'Category', 'Method', 'Amount GBP', 'Stripe ID']];
    yearPayments.forEach((p) => rows.push([p.paid_on, 'Income', p.invoice_number, clientName(p.client_id), p.description, p.kind, p.method, paymentTotal(p).toFixed(2), p.stripe_payment_id]));
    yearExpenses.forEach((e) => rows.push([e.spent_on, 'Expense', '', e.supplier, e.description, e.category, e.method, (-Number(e.amount_gbp)).toFixed(2), '']));
    rows.splice(1, rows.length - 1, ...rows.slice(1).sort((a, b) => String(a[0]).localeCompare(String(b[0]))));
    downloadCsv(`goldenpays-ledger-${year}.csv`, rows);
  };

  const openForm = (exp: Expense | 'new') => {
    setEditing(exp);
    setReceipt(null);
    setForm(exp === 'new' ? emptyForm() : {
      spent_on: exp.spent_on,
      supplier: exp.supplier,
      description: exp.description ?? '',
      category: exp.category,
      amount_gbp: String(exp.amount_gbp),
      method: exp.method,
      project_id: exp.project_id ?? '',
      notes: exp.notes ?? '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      let receipt_document_id = editing !== 'new' ? editing!.receipt_document_id : null;
      if (receipt) {
        const doc = await uploadDocument({
          file: receipt,
          title: `Receipt: ${form.supplier} ${form.spent_on}`,
          category: 'receipt',
          document_date: form.spent_on,
          project_id: form.project_id || null,
        });
        receipt_document_id = doc.id;
      }
      const payload = {
        ...form,
        amount_gbp: Number(form.amount_gbp),
        description: form.description || null,
        project_id: form.project_id || null,
        notes: form.notes || null,
        receipt_document_id,
      };
      const { error } = editing === 'new'
        ? await supabase!.from('expenses').insert(payload)
        : await supabase!.from('expenses').update(payload).eq('id', (editing as Expense).id);
      if (error) throw new Error('Could not save the expense.');
      setEditing(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the expense.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (exp: Expense) => {
    if (!window.confirm(`Delete the ${formatGbp(exp.amount_gbp)} expense from ${exp.supplier}? Its receipt stays in Documents.`)) return;
    const { error } = await supabase!.from('expenses').delete().eq('id', exp.id);
    if (error) setError('Could not delete the expense.');
    else {
      setEditing(null);
      load();
    }
  };

  const openReceipt = async (exp: Expense) => {
    const path = exp.receipt_document_id && receiptPaths[exp.receipt_document_id];
    if (!path) return;
    try { await openDocument(path); } catch { setError('Could not open the receipt.'); }
  };

  const maxMonth = Math.max(...monthly.map((m) => Math.max(m.revenue, m.expenses)), 1);

  return (
    <div>
      <PageTitle
        title="Finances"
        subtitle="Income from Payments, company expenses and profit. Amounts in GBP (not VAT registered)."
        action={
          <div className="flex gap-3">
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={`${inputClass} w-28`}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={exportLedger} className={btnGhost}>Export CSV</button>
            <button onClick={() => openForm('new')} className={btn}>+ Expense</button>
          </div>
        }
      />
      {error && <ErrorBox message={error} />}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={`Income ${year}`} value={formatGbp(revenue)} />
        <Stat label={`Expenses ${year}`} value={formatGbp(spent)} />
        <Stat label={`Profit ${year}`} value={<span className={revenue - spent < 0 ? 'text-red-600' : 'text-emerald-700'}>{formatGbp(revenue - spent)}</span>} />
        <Stat label="Outstanding invoices" value={formatGbp(outstanding)} />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="overflow-x-auto lg:col-span-2">
          <table className="w-full text-sm">
            <thead className="border-b border-steel bg-mist text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Month</th>
                <th className="px-5 py-3 text-right">Income</th>
                <th className="px-5 py-3 text-right">Expenses</th>
                <th className="px-5 py-3 text-right">Profit</th>
                <th className="hidden px-5 py-3 sm:table-cell" aria-label="Income vs expenses" />
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {monthly.map((m) => (
                <tr key={m.label}>
                  <td className="px-5 py-2.5 text-slate-600">{m.label}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{m.revenue ? formatGbp(m.revenue) : '—'}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{m.expenses ? formatGbp(m.expenses) : '—'}</td>
                  <td className={`px-5 py-2.5 text-right font-medium tabular-nums ${m.profit < 0 ? 'text-red-600' : 'text-obsidian'}`}>{m.revenue || m.expenses ? formatGbp(m.profit) : '—'}</td>
                  <td className="hidden w-40 px-5 py-2.5 sm:table-cell">
                    <div className="space-y-1" aria-hidden="true">
                      <div className="h-1.5 rounded-full bg-accent" style={{ width: `${(m.revenue / maxMonth) * 100}%` }} />
                      <div className="h-1.5 rounded-full bg-slate-400" style={{ width: `${(m.expenses / maxMonth) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="flex gap-4 border-t border-steel px-5 py-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-accent" /> Income</span>
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-slate-400" /> Expenses</span>
          </p>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold text-obsidian">Expenses by category</h2>
          {byCategory.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No expenses in {year}.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {byCategory.map(({ cat, total }) => (
                <li key={cat}>
                  <div className="flex justify-between"><span className="text-slate-600">{cat}</span><span className="font-medium tabular-nums">{formatGbp(total)}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-mist"><div className="h-1.5 rounded-full bg-slate-400" style={{ width: `${(total / spent) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <h2 className="mb-3 font-semibold text-obsidian">Expenses {year}</h2>
      {yearExpenses.length === 0 ? (
        <Empty>No expenses recorded for {year}.</Empty>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-steel bg-mist text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Supplier</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3">Receipt</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {yearExpenses.map((exp) => (
                <tr key={exp.id}>
                  <td className="px-5 py-3 text-slate-500">{formatDate(exp.spent_on)}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-obsidian">{exp.supplier}</p>
                    {exp.description && <p className="text-xs text-slate-500">{exp.description}</p>}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{exp.category}</td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">{formatGbp(exp.amount_gbp)}</td>
                  <td className="px-5 py-3">
                    {exp.receipt_document_id ? (
                      <button onClick={() => openReceipt(exp)} className="text-accent-dark hover:underline">View</button>
                    ) : <span className="text-xs text-amber-700">Missing</span>}
                  </td>
                  <td className="px-5 py-3 text-right"><button onClick={() => openForm(exp)} className="text-accent-dark hover:underline">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Record expense' : 'Edit expense'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelClass}>Supplier</label><input name="supplier" value={form.supplier} onChange={handleChange} required placeholder="e.g. Vercel, Supabase" className={inputClass} /></div>
              <div><label className={labelClass}>Date</label><input name="spent_on" type="date" value={form.spent_on} onChange={handleChange} required className={inputClass} /></div>
              <div><label className={labelClass}>Amount (£)</label><input name="amount_gbp" type="number" min="0.01" step="0.01" value={form.amount_gbp} onChange={handleChange} required className={inputClass} /></div>
              <div>
                <label className={labelClass}>Category</label>
                <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Paid by</label>
                <select name="method" value={form.method} onChange={handleChange} className={inputClass}>
                  {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Project</label>
                <select name="project_id" value={form.project_id} onChange={handleChange} className={inputClass}>
                  <option value="">None</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div><label className={labelClass}>Description</label><input name="description" value={form.description} onChange={handleChange} className={inputClass} /></div>
            <div>
              <label className={labelClass}>Receipt {editing !== 'new' && editing.receipt_document_id ? '(replace)' : ''}</label>
              <input type="file" accept="application/pdf,image/*" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-mist file:px-3 file:py-2 file:text-sm file:font-semibold" />
              <p className="mt-1 text-xs text-slate-500">Saved privately in Documents → receipt.</p>
            </div>
            <div><label className={labelClass}>Notes</label><textarea name="notes" rows={2} value={form.notes} onChange={handleChange} className={inputClass} /></div>
            <div className="flex flex-wrap justify-between gap-3">
              {editing !== 'new' ? <button type="button" onClick={() => remove(editing)} className="text-sm text-red-600 hover:underline">Delete</button> : <span />}
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
                <button type="submit" disabled={saving} className={btn}>{saving ? 'Saving…' : 'Save expense'}</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Finances;
