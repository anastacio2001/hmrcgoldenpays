import React, { useEffect, useState } from 'react';
import { supabase, Client, Project, ProjectStatus } from '../../lib/supabase';
import { SIC_CODES } from '../../data/site';
import { Badge, Card, Empty, ErrorBox, Modal, PageTitle, Spinner, Stat, btn, btnGhost, formatDate, formatGbp, inputClass, labelClass } from './ui';

const STATUSES: ProjectStatus[] = ['planning', 'active', 'on-hold', 'completed'];
const emptyForm = { name: '', client_id: '', sic_code: '', status: 'planning' as ProjectStatus, value_gbp: '', start_date: '', end_date: '', description: '' };

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [clients, setClients] = useState<Pick<Client, 'id' | 'name' | 'company'>[]>([]);
  const [editing, setEditing] = useState<Project | 'new' | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const [p, c] = await Promise.all([
      supabase!.from('projects').select('*').order('created_at', { ascending: false }),
      supabase!.from('clients').select('id, name, company').order('name'),
    ]);
    if (p.error || c.error) setError('Could not load projects.');
    else {
      setProjects(p.data as Project[]);
      setClients(c.data);
    }
  };

  useEffect(() => { load(); }, []);

  const clientName = (id: string | null) => {
    const client = clients.find((c) => c.id === id);
    return client ? client.company || client.name : '—';
  };

  const openForm = (project: Project | 'new') => {
    setEditing(project);
    setForm(project === 'new' ? emptyForm : {
      name: project.name,
      client_id: project.client_id ?? '',
      sic_code: project.sic_code ?? '',
      status: project.status,
      value_gbp: project.value_gbp?.toString() ?? '',
      start_date: project.start_date ?? '',
      end_date: project.end_date ?? '',
      description: project.description ?? '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      status: form.status,
      client_id: form.client_id || null,
      sic_code: form.sic_code || null,
      value_gbp: form.value_gbp === '' ? null : Number(form.value_gbp),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      description: form.description || null,
    };
    const { error } = editing === 'new'
      ? await supabase!.from('projects').insert(payload)
      : await supabase!.from('projects').update(payload).eq('id', (editing as Project).id);
    setSaving(false);
    if (error) {
      setError(error.code === '23514' ? 'End date must be on or after the start date.' : 'Could not save the project.');
      return;
    }
    setEditing(null);
    load();
  };

  const remove = async (project: Project) => {
    if (!window.confirm(`Delete project "${project.name}"?`)) return;
    const { error } = await supabase!.from('projects').delete().eq('id', project.id);
    if (error) setError('Could not delete the project.');
    else {
      setProjects((list) => list!.filter((p) => p.id !== project.id));
      setEditing(null);
    }
  };

  if (!projects) return error ? <ErrorBox message={error} /> : <Spinner />;

  return (
    <div>
      <PageTitle title="Projects" subtitle="Engagements and their delivery status." action={<button onClick={() => openForm('new')} className={btn}>+ New project</button>} />
      {error && <ErrorBox message={error} />}

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {STATUSES.map((s) => <Stat key={s} label={s} value={projects.filter((p) => p.status === s).length} />)}
      </div>

      {projects.length === 0 ? (
        <Empty>No projects yet.</Empty>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-obsidian">{project.name}</h3>
                  <p className="text-sm text-slate-500">{clientName(project.client_id)}</p>
                </div>
                <Badge value={project.status} />
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div><dt className="text-xs text-slate-500">Value</dt><dd className="font-medium">{formatGbp(project.value_gbp)}</dd></div>
                <div><dt className="text-xs text-slate-500">Start</dt><dd>{formatDate(project.start_date)}</dd></div>
                <div><dt className="text-xs text-slate-500">End</dt><dd>{formatDate(project.end_date)}</dd></div>
              </dl>
              {project.sic_code && <p className="mt-3 font-mono text-[11px] text-slate-500">SIC {project.sic_code}</p>}
              <button onClick={() => openForm(project)} className="mt-4 text-sm text-accent-dark hover:underline">Edit →</button>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'New project' : 'Edit project'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className={labelClass}>Project name</label><input name="name" value={form.name} onChange={handleChange} required className={inputClass} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Client</label>
                <select name="client_id" value={form.client_id} onChange={handleChange} className={inputClass}>
                  <option value="">No client</option>
                  {clients.map((c) => <option key={c.id} value={c.id}>{c.company || c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Service area</label>
                <select name="sic_code" value={form.sic_code} onChange={handleChange} className={inputClass}>
                  <option value="">Not set</option>
                  {SIC_CODES.map((s) => <option key={s.code} value={s.code}>{s.code} · {s.area}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Value (£)</label><input name="value_gbp" type="number" min="0" step="0.01" value={form.value_gbp} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>Start date</label><input name="start_date" type="date" value={form.start_date} onChange={handleChange} className={inputClass} /></div>
              <div><label className={labelClass}>End date</label><input name="end_date" type="date" value={form.end_date} onChange={handleChange} className={inputClass} /></div>
            </div>
            <div><label className={labelClass}>Description</label><textarea name="description" rows={3} value={form.description} onChange={handleChange} className={inputClass} /></div>
            <div className="flex flex-wrap justify-between gap-3">
              {editing !== 'new' ? (
                <button type="button" onClick={() => remove(editing)} className="text-sm text-red-600 hover:underline">Delete project</button>
              ) : <span />}
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
                <button type="submit" disabled={saving} className={btn}>{saving ? 'Saving…' : 'Save project'}</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Projects;
