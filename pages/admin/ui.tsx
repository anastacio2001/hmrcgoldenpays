import React from 'react';

// Shared building blocks for the admin pages.

export const inputClass = 'w-full rounded-md border border-steel bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none';
export const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500';
export const btn = 'inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark disabled:opacity-50';
export const btnGhost = 'inline-flex items-center justify-center rounded-md border border-steel bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-mist';
export const btnDanger = 'inline-flex items-center justify-center rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50';

export const Spinner: React.FC = () => (
  <div className="flex h-64 items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-accent" aria-label="Loading" />
  </div>
);

export const PageTitle: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-obsidian">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-steel bg-white ${className}`}>{children}</div>
);

export const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Card className="p-5">
    <p className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-bold text-obsidian">{value}</p>
  </Card>
);

const badgeColors: Record<string, string> = {
  new: 'bg-sky-100 text-sky-800',
  'in-progress': 'bg-amber-100 text-amber-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  prospect: 'bg-amber-100 text-amber-800',
  active: 'bg-emerald-100 text-emerald-800',
  inactive: 'bg-slate-200 text-slate-700',
  planning: 'bg-sky-100 text-sky-800',
  'on-hold': 'bg-amber-100 text-amber-800',
  completed: 'bg-violet-100 text-violet-800',
  pending: 'bg-sky-100 text-sky-800',
  paid: 'bg-emerald-100 text-emerald-800',
  overdue: 'bg-red-100 text-red-800',
  refunded: 'bg-violet-100 text-violet-800',
  cancelled: 'bg-slate-200 text-slate-700',
  contract: 'bg-sky-100 text-sky-800',
  invoice: 'bg-emerald-100 text-emerald-800',
  receipt: 'bg-amber-100 text-amber-800',
  certificate: 'bg-violet-100 text-violet-800',
  company: 'bg-slate-200 text-slate-700',
  tax: 'bg-red-100 text-red-800',
  bank: 'bg-cyan-100 text-cyan-800',
  qualified: 'bg-sky-100 text-sky-800',
  contacted: 'bg-amber-100 text-amber-800',
  replied: 'bg-cyan-100 text-cyan-800',
  meeting: 'bg-violet-100 text-violet-800',
  proposal: 'bg-violet-100 text-violet-800',
  won: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-slate-200 text-slate-700',
  excluded: 'bg-red-100 text-red-800',
  high: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  manual: 'bg-sky-100 text-sky-800',
  unsubscribed: 'bg-red-100 text-red-800',
  public: 'bg-emerald-100 text-emerald-800',
  private: 'bg-slate-200 text-slate-700',
};

export const Badge: React.FC<{ value: string }> = ({ value }) => (
  <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${badgeColors[value] ?? 'bg-slate-100 text-slate-700'}`}>
    {value}
  </span>
);

export const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Card className="p-12 text-center text-sm text-slate-500">{children}</Card>
);

export const ErrorBox: React.FC<{ message: string }> = ({ message }) => (
  <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{message}</div>
);

export const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
      <div className="flex items-center justify-between border-b border-steel px-6 py-4">
        <h2 className="font-semibold text-obsidian">{title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-obsidian" aria-label="Close">✕</button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

export const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatGbp = (value: number | null) =>
  value == null ? '—' : `£${Number(value).toLocaleString('en-GB', { maximumFractionDigits: 2 })}`;
