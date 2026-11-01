import React, { useEffect, useState } from 'react';
import { supabase, Inquiry, InquiryStatus } from '../../lib/supabase';
import { Badge, Card, Empty, ErrorBox, PageTitle, Spinner, btn, btnDanger, btnGhost, formatDate, inputClass } from './ui';

const STATUSES: InquiryStatus[] = ['new', 'in-progress', 'resolved'];

const Inquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase!.from('inquiries').select('*').order('created_at', { ascending: false });
    if (error) setError('Could not load inquiries.');
    else setInquiries(data as Inquiry[]);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: InquiryStatus) => {
    const { error } = await supabase!.from('inquiries').update({ status }).eq('id', id);
    if (error) setError('Could not update the inquiry.');
    else setInquiries((list) => list!.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    const { error } = await supabase!.from('inquiries').delete().eq('id', id);
    if (error) setError('Could not delete the inquiry.');
    else {
      setInquiries((list) => list!.filter((i) => i.id !== id));
      setSelectedId(null);
    }
  };

  const convertToClient = async (inq: Inquiry) => {
    const { error } = await supabase!.from('clients').insert({
      name: inq.name,
      company: inq.company,
      email: inq.email,
      status: 'prospect',
      notes: `From inquiry (${inq.service}): ${inq.message}`,
    });
    if (error) setError('Could not create the client.');
    else await updateStatus(inq.id, 'in-progress');
  };

  if (!inquiries) return error ? <ErrorBox message={error} /> : <Spinner />;

  const filtered = filterStatus === 'all' ? inquiries : inquiries.filter((i) => i.status === filterStatus);
  const selected = inquiries.find((i) => i.id === selectedId) ?? null;

  return (
    <div>
      <PageTitle
        title="Inquiries"
        subtitle="Submissions from the website contact form."
        action={
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${inputClass} sm:w-44`}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        }
      />
      {error && <ErrorBox message={error} />}

      {filtered.length === 0 ? (
        <Empty>No inquiries{filterStatus !== 'all' ? ` with status "${filterStatus}"` : ' yet'}.</Empty>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="max-h-[70vh] overflow-y-auto lg:col-span-2">
            <ul className="divide-y divide-steel">
              {filtered.map((inq) => (
                <li key={inq.id}>
                  <button
                    onClick={() => setSelectedId(inq.id)}
                    className={`w-full px-5 py-4 text-left transition hover:bg-mist ${selectedId === inq.id ? 'bg-mist' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-sm font-medium text-obsidian">{inq.name}</p>
                      <Badge value={inq.status} />
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">{inq.service}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{formatDate(inq.created_at)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="lg:col-span-3">
            {selected ? (
              <div>
                <div className="border-b border-steel p-6">
                  <h2 className="text-lg font-semibold text-obsidian">{selected.name}</h2>
                  <p className="text-sm text-slate-500">{selected.company ?? 'No company given'}</p>
                  <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                    <div><dt className="text-xs text-slate-500">Email</dt><dd><a href={`mailto:${selected.email}`} className="text-accent-dark hover:underline">{selected.email}</a></dd></div>
                    <div><dt className="text-xs text-slate-500">Received</dt><dd>{new Date(selected.created_at).toLocaleString('en-GB')}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Service</dt><dd>{selected.service}</dd></div>
                  </dl>
                </div>
                <p className="whitespace-pre-wrap border-b border-steel p-6 text-sm leading-relaxed text-slate-700">{selected.message}</p>
                <div className="flex flex-wrap items-center gap-3 p-6">
                  <select value={selected.status} onChange={(e) => updateStatus(selected.id, e.target.value as InquiryStatus)} className={`${inputClass} w-40`}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <a href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: ${selected.service}`)}`} className={btn}>Reply by email</a>
                  <button onClick={() => convertToClient(selected)} className={btnGhost}>Convert to client</button>
                  <button onClick={() => remove(selected.id)} className={btnDanger}>Delete</button>
                </div>
              </div>
            ) : (
              <p className="p-12 text-center text-sm text-slate-500">Select an inquiry to view details.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Inquiries;
