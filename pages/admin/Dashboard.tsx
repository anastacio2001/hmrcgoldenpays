import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Inquiry } from '../../lib/supabase';
import { Badge, Card, ErrorBox, PageTitle, Spinner, Stat, formatDate, formatGbp } from './ui';

interface Stats {
  newInquiries: number;
  activeClients: number;
  activeProjects: number;
  pipelineValue: number;
  outstanding: number;
  overdue: number;
}

const count = async (table: string, column?: string, value?: string | boolean) => {
  let query = supabase!.from(table).select('*', { count: 'exact', head: true });
  if (column) query = query.eq(column, value);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Inquiry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [newInquiries, activeClients, activeProjects, values, pending, latest] = await Promise.all([
          count('inquiries', 'status', 'new'),
          count('clients', 'status', 'active'),
          count('projects', 'status', 'active'),
          supabase!.from('projects').select('value_gbp').in('status', ['planning', 'active', 'on-hold']),
          supabase!.from('payments').select('amount_gbp, vat_gbp, due_on').eq('status', 'pending'),
          supabase!.from('inquiries').select('*').order('created_at', { ascending: false }).limit(5),
        ]);
        if (values.error) throw values.error;
        if (pending.error) throw pending.error;
        if (latest.error) throw latest.error;
        setStats({
          newInquiries,
          activeClients,
          activeProjects,
          outstanding: pending.data.reduce((sum, p) => sum + Number(p.amount_gbp) + Number(p.vat_gbp), 0),
          overdue: pending.data.filter((p) => p.due_on && p.due_on < new Date().toISOString().slice(0, 10)).length,
          pipelineValue: values.data.reduce((sum, p) => sum + Number(p.value_gbp ?? 0), 0),
        });
        setRecent(latest.data as Inquiry[]);
      } catch (err) {
        console.error('Dashboard load failed:', err);
        setError('Could not load dashboard data.');
      }
    };
    load();
  }, []);

  if (error) return <ErrorBox message={error} />;
  if (!stats) return <Spinner />;

  return (
    <div>
      <PageTitle title="Dashboard" subtitle="Live figures from the GOLDENPAYS database." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="New inquiries" value={stats.newInquiries} />
        <Stat label="Active clients" value={stats.activeClients} />
        <Stat label="Active projects" value={stats.activeProjects} />
        <Stat label="Open pipeline" value={formatGbp(stats.pipelineValue)} />
        <Stat label="Outstanding payments" value={formatGbp(stats.outstanding)} />
        <Stat label="Overdue payments" value={<Link to="/admin/payments" className={stats.overdue ? 'text-red-600 hover:underline' : ''}>{stats.overdue}</Link>} />
      </div>

      <Card className="mt-8">
        <div className="flex items-center justify-between border-b border-steel px-6 py-4">
          <h2 className="font-semibold text-obsidian">Latest inquiries</h2>
          <Link to="/admin/inquiries" className="text-sm text-accent-dark hover:underline">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No inquiries yet.</p>
        ) : (
          <ul className="divide-y divide-steel">
            {recent.map((inq) => (
              <li key={inq.id} className="flex items-center justify-between gap-4 px-6 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-obsidian">{inq.name}{inq.company ? ` · ${inq.company}` : ''}</p>
                  <p className="truncate text-slate-500">{inq.service}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-slate-400">{formatDate(inq.created_at)}</span>
                  <Badge value={inq.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
