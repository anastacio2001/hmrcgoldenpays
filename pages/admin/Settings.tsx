import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { COMPANY, SIC_CODES } from '../../data/site';
import { Card, PageTitle, btn, inputClass, labelClass } from './ui';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 12) {
      setMessage({ ok: false, text: 'Use at least 12 characters.' });
      return;
    }
    if (password !== confirm) {
      setMessage({ ok: false, text: 'Passwords do not match.' });
      return;
    }
    setSaving(true);
    const { error } = await supabase!.auth.updateUser({ password });
    setSaving(false);
    if (error) setMessage({ ok: false, text: error.message });
    else {
      setMessage({ ok: true, text: 'Password updated.' });
      setPassword('');
      setConfirm('');
    }
  };

  return (
    <div>
      <PageTitle title="Settings" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-semibold text-obsidian">Your account</h2>
          <p className="mt-1 text-sm text-slate-500">Signed in as {user?.email}</p>
          <form onSubmit={changePassword} className="mt-6 space-y-4">
            {message && (
              <p className={`rounded-md px-3 py-2 text-sm ${message.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{message.text}</p>
            )}
            <div>
              <label className={labelClass}>New password</label>
              <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Confirm password</label>
              <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className={inputClass} />
            </div>
            <button type="submit" disabled={saving} className={btn}>{saving ? 'Updating…' : 'Change password'}</button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-obsidian">Company information</h2>
          <p className="mt-1 text-sm text-slate-500">Shown across the website. Edit in <code className="font-mono text-xs">data/site.ts</code>.</p>
          <dl className="mt-6 space-y-3 text-sm">
            {[
              ['Legal name', COMPANY.name],
              ['Company number', COMPANY.number],
              ['Registered office', COMPANY.office],
              ['Email', COMPANY.email],
              ['Director', COMPANY.director],
              ['SIC codes', SIC_CODES.map((s) => s.code).join(', ')],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="text-obsidian">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
