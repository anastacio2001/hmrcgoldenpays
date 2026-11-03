import React, { useCallback, useEffect, useState } from 'react';
import { supabase, ContentPost } from '../../lib/supabase';
import { Badge, Card, Empty, ErrorBox, PageTitle, Spinner, Stat, btn, btnGhost, formatDate, inputClass, labelClass } from './ui';

const PILLARS = [
  { id: '', label: 'Mix of pillars' },
  { id: 'pain-fix', label: 'Pain → fix (one manual process automated)' },
  { id: 'how-it-works', label: 'How a sprint / integration works' },
  { id: 'checklist', label: 'Practical checklist' },
  { id: 'myth-busting', label: 'Myth-busting' },
  { id: 'transparency', label: 'Transparency (prices, code ownership, verification)' },
  { id: 'behind-the-build', label: 'Behind the build' },
];

const STATUSES: ContentPost['status'][] = ['draft', 'approved', 'posted', 'archived'];

const fullText = (p: ContentPost) => `${p.body.trim()}\n\n${p.hashtags.join(' ')}`;

const Content: React.FC = () => {
  const [posts, setPosts] = useState<ContentPost[] | null>(null);
  const [segments, setSegments] = useState<string[]>([]);
  const [filter, setFilter] = useState<ContentPost['status']>('draft');
  const [form, setForm] = useState({ pillar: '', segment: '', count: '3', notes: '' });
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [p, s, ...c] = await Promise.all([
      supabase!.from('content_posts').select('*').eq('status', filter).order('scheduled_for', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false }),
      supabase!.from('lead_searches').select('segment'),
      ...STATUSES.map((st) => supabase!.from('content_posts').select('*', { count: 'exact', head: true }).eq('status', st)),
    ]);
    if (p.error) {
      setError('Could not load posts.');
      return;
    }
    setPosts(p.data as ContentPost[]);
    setSegments([...new Set((s.data ?? []).map((r) => r.segment).filter(Boolean))].sort() as string[]);
    setCounts(Object.fromEntries(STATUSES.map((st, i) => [st, c[i].count ?? 0])));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const { data, error } = await supabase!.functions.invoke('ai-agent', {
      body: { task: 'linkedin_posts', pillar: form.pillar || undefined, segment: form.segment || undefined, count: Number(form.count), notes: form.notes || undefined },
    });
    setBusy(false);
    if (error) {
      const detail = await (error as { context?: Response }).context?.json?.().catch(() => null);
      setError(detail?.error ?? 'Could not generate posts. Try again in a minute.');
      return;
    }
    setMessage(`${data.created} draft(s) created ($${data.cost_usd.toFixed(2)}). Review and edit them below.`);
    setFilter('draft');
    load();
  };

  const update = async (post: ContentPost, patch: Partial<ContentPost>) => {
    const { error } = await supabase!.from('content_posts').update(patch).eq('id', post.id);
    if (error) setError('Could not update the post.');
    else load();
  };

  const saveBody = async (post: ContentPost) => {
    const body = edits[post.id];
    if (body == null) return;
    await update(post, { body });
    setEdits((e) => { const { [post.id]: _, ...rest } = e; return rest; });
  };

  const copy = async (post: ContentPost) => {
    await navigator.clipboard.writeText(fullText({ ...post, body: edits[post.id] ?? post.body }));
    setCopied(post.id);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!posts) return error ? <ErrorBox message={error} /> : <Spinner />;

  return (
    <div>
      <PageTitle title="LinkedIn Studio" subtitle="AI-drafted posts for the company page and your profile. You review, edit and post them yourself." />
      {error && <ErrorBox message={error} />}
      {message && <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</div>}

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Drafts" value={counts.draft ?? 0} />
        <Stat label="Approved" value={counts.approved ?? 0} />
        <Stat label="Posted" value={counts.posted ?? 0} />
        <Stat label="Suggested rhythm" value={<span className="text-base font-semibold">3 posts / week</span>} />
      </div>

      <Card className="mb-8 p-5">
        <form onSubmit={generate} className="grid gap-4 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-4">
            <label className={labelClass}>Pillar</label>
            <select value={form.pillar} onChange={(e) => setForm({ ...form, pillar: e.target.value })} className={inputClass}>
              {PILLARS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>
          <div className="lg:col-span-3">
            <label className={labelClass}>Sector</label>
            <select value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} className={inputClass}>
              <option value="">UK SMEs in general</option>
              {segments.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className={labelClass}>Posts</label>
            <input type="number" min="1" max="5" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} className={inputClass} />
          </div>
          <div className="lg:col-span-4">
            <label className={labelClass}>Your notes (optional)</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="e.g. we just launched the verification portal" className={inputClass} />
          </div>
          <div className="lg:col-span-12 flex items-center justify-between gap-4">
            <p className="text-xs text-slate-500">Posts never invent clients or results; any example scenario is labelled as an example.</p>
            <button type="submit" disabled={busy} className={btn}>{busy ? 'Writing… (up to 1 min)' : 'Generate drafts'}</button>
          </div>
        </form>
      </Card>

      <div className="mb-4 flex gap-2">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${filter === s ? 'bg-obsidian text-white' : 'bg-white text-slate-600'}`}>{s} ({counts[s] ?? 0})</button>
        ))}
      </div>

      {posts.length === 0 ? (
        <Empty>{filter === 'draft' ? 'No drafts. Generate some above.' : `No ${filter} posts.`}</Empty>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {posts.map((post) => {
            const body = edits[post.id] ?? post.body;
            return (
              <Card key={post.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-obsidian">{post.title}</p>
                    <p className="text-xs text-slate-500">{post.pillar} · {post.format}{post.segment ? ` · ${post.segment}` : ''}</p>
                  </div>
                  <Badge value={post.status === 'draft' ? 'new' : post.status === 'approved' ? 'qualified' : post.status === 'posted' ? 'won' : 'lost'} />
                </div>
                <textarea value={body} onChange={(e) => setEdits({ ...edits, [post.id]: e.target.value })} rows={12} className={`${inputClass} mt-3 flex-1 text-sm leading-relaxed`} />
                <p className="mt-2 text-xs text-accent-dark">{post.hashtags.join(' ')}</p>
                {post.image_idea && <p className="mt-2 text-xs text-slate-500"><b>Visual idea:</b> {post.image_idea}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button onClick={() => copy(post)} className={btn}>{copied === post.id ? 'Copied ✓' : 'Copy post'}</button>
                  {edits[post.id] != null && <button onClick={() => saveBody(post)} className={btnGhost}>Save edits</button>}
                  {post.status === 'draft' && <button onClick={() => update(post, { status: 'approved' })} className={btnGhost}>Approve</button>}
                  {post.status !== 'posted' && <button onClick={() => update(post, { status: 'posted', posted_at: new Date().toISOString() })} className={btnGhost}>Mark posted</button>}
                  <label className="flex items-center gap-1 text-xs text-slate-500">
                    Plan for
                    <input type="date" value={post.scheduled_for ?? ''} onChange={(e) => update(post, { scheduled_for: e.target.value || null })} className="rounded border border-steel px-2 py-1 text-xs" />
                  </label>
                  <span className="flex-1" />
                  {post.status !== 'archived' && <button onClick={() => update(post, { status: 'archived' })} className="text-xs text-slate-400 hover:underline">Archive</button>}
                </div>
                {post.posted_at && <p className="mt-2 text-[11px] text-slate-400">Posted {formatDate(post.posted_at)}</p>}
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-8 p-5 text-sm text-slate-600">
        <p className="font-semibold text-obsidian">How to post</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Copy the post and paste it on LinkedIn (company page or your profile). Add the suggested visual if you have one.</li>
          <li>Post Tuesday to Thursday, 8–10am UK time, and reply to every comment in the first hour.</li>
          <li>Click "Mark posted" here so the studio avoids repeating the topic.</li>
        </ol>
      </Card>
    </div>
  );
};

export default Content;
