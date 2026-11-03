import React, { useEffect, useMemo, useState } from 'react';
import { supabase, Client, CompanyDocument, DocumentCategory, Project } from '../../../lib/supabase';
import { deleteDocument, formatBytes, MAX_DOCUMENT_BYTES, openDocument, uploadDocument } from '../../../lib/documents';
import { Badge, Card, Empty, ErrorBox, Modal, PageTitle, Spinner, btn, btnGhost, formatDate, inputClass, labelClass } from '../ui';

export const DOCUMENT_CATEGORIES: DocumentCategory[] = ['contract', 'invoice', 'receipt', 'certificate', 'company', 'tax', 'bank', 'other'];

const emptyForm = { title: '', category: 'contract' as DocumentCategory, document_date: '', client_id: '', project_id: '', notes: '' };

const Documents: React.FC = () => {
  const [docs, setDocs] = useState<CompanyDocument[] | null>(null);
  const [clients, setClients] = useState<Pick<Client, 'id' | 'name' | 'company'>[]>([]);
  const [projects, setProjects] = useState<Pick<Project, 'id' | 'name' | 'client_id'>[]>([]);
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [d, c, p] = await Promise.all([
      supabase!.from('documents').select('*').order('created_at', { ascending: false }),
      supabase!.from('clients').select('id, name, company').order('name'),
      supabase!.from('projects').select('id, name, client_id').order('name'),
    ]);
    if (d.error || c.error || p.error) setError('Could not load documents.');
    else {
      setDocs(d.data as CompanyDocument[]);
      setClients(c.data);
      setProjects(p.data);
    }
  };

  useEffect(() => { load(); }, []);

  const clientName = (id: string | null) => {
    const c = clients.find((x) => x.id === id);
    return c ? c.company || c.name : null;
  };
  const projectName = (id: string | null) => projects.find((x) => x.id === id)?.name ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (docs ?? []).filter((d) =>
      (category === 'all' || d.category === category) &&
      (!q || [d.title, d.file_name, d.notes, clientName(d.client_id), projectName(d.project_id)]
        .some((v) => v?.toLowerCase().includes(q)))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docs, category, search, clients, projects]);

  const chooseFile = (f: File | null) => {
    setFile(f);
    if (f && !form.title) setForm((prev) => ({ ...prev, title: f.name.replace(/\.[^.]+$/, '') }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await uploadDocument({ file, ...form });
      setShowUpload(false);
      setFile(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setBusy(false);
    }
  };

  const open = async (doc: CompanyDocument) => {
    try {
      await openDocument(doc.storage_path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open the document.');
    }
  };

  const remove = async (doc: CompanyDocument) => {
    if (!window.confirm(`Delete "${doc.title}" permanently? This also deletes the file.`)) return;
    try {
      await deleteDocument(doc);
      setDocs((list) => list!.filter((d) => d.id !== doc.id));
    } catch {
      setError('Could not delete the document.');
    }
  };

  if (!docs) return error ? <ErrorBox message={error} /> : <Spinner />;

  const projectOptions = form.client_id ? projects.filter((p) => p.client_id === form.client_id) : projects;

  return (
    <div>
      <PageTitle
        title="Documents"
        subtitle="Private company files: contracts, invoices, receipts, certificates. Only you can access them."
        action={<button onClick={() => setShowUpload(true)} className={btn}>+ Upload document</button>}
      />
      {error && <ErrorBox message={error} />}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, client, project…" className={`${inputClass} sm:max-w-xs`} />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${inputClass} sm:w-44`}>
          <option value="all">All categories</option>
          {DOCUMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Empty>{docs.length === 0 ? 'No documents yet. Upload your first contract or certificate.' : 'No documents match your filters.'}</Empty>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-steel bg-mist text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Document</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Linked to</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Size</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {filtered.map((doc) => (
                <tr key={doc.id}>
                  <td className="px-5 py-3">
                    <button onClick={() => open(doc)} className="text-left font-medium text-obsidian hover:text-accent-dark hover:underline">{doc.title}</button>
                    <p className="text-xs text-slate-500">{doc.file_name}</p>
                  </td>
                  <td className="px-5 py-3"><Badge value={doc.category} /></td>
                  <td className="px-5 py-3 text-slate-600">
                    {[clientName(doc.client_id), projectName(doc.project_id)].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(doc.document_date ?? doc.created_at)}</td>
                  <td className="px-5 py-3 text-slate-500">{formatBytes(doc.size_bytes)}</td>
                  <td className="whitespace-nowrap px-5 py-3 text-right">
                    <button onClick={() => open(doc)} className="mr-4 text-accent-dark hover:underline">Open</button>
                    <button onClick={() => remove(doc)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showUpload && (
        <Modal title="Upload document" onClose={() => setShowUpload(false)}>
          <form onSubmit={handleUpload} className="space-y-4">
            <label
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-steel bg-mist px-4 py-8 text-center text-sm text-slate-600 hover:border-accent"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); chooseFile(e.dataTransfer.files[0] ?? null); }}
            >
              <input type="file" className="sr-only" onChange={(e) => chooseFile(e.target.files?.[0] ?? null)} />
              {file ? (
                <span><span className="font-medium text-obsidian">{file.name}</span> · {formatBytes(file.size)}</span>
              ) : (
                <span>Drop a file here or <span className="font-semibold text-accent-dark">browse</span><br /><span className="text-xs text-slate-400">PDF, images, Office documents · up to {MAX_DOCUMENT_BYTES / 1024 / 1024} MB</span></span>
              )}
            </label>
            <div><label className={labelClass}>Title</label><input name="title" value={form.title} onChange={handleChange} required className={inputClass} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Category</label>
                <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                  {DOCUMENT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Document date</label><input name="document_date" type="date" value={form.document_date} onChange={handleChange} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Client</label>
                <select name="client_id" value={form.client_id} onChange={handleChange} className={inputClass}>
                  <option value="">None</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Project</label>
                <select name="project_id" value={form.project_id} onChange={handleChange} className={inputClass}>
                  <option value="">None</option>
                  {projectOptions.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div><label className={labelClass}>Notes</label><textarea name="notes" rows={2} value={form.notes} onChange={handleChange} className={inputClass} /></div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowUpload(false)} className={btnGhost}>Cancel</button>
              <button type="submit" disabled={busy || !file} className={btn}>{busy ? 'Uploading…' : 'Upload'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Documents;
