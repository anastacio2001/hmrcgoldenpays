import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { COMPANY } from '../data/site';
import { btnPrimary } from '../components/ui';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Opt-out link included in every outreach email.
const Unsubscribe: React.FC = () => {
  const [params] = useSearchParams();
  const token = params.get('t') ?? '';
  const [state, setState] = useState<'working' | 'done' | 'invalid' | 'error'>('working');
  const [company, setCompany] = useState<string | null>(null);

  useEffect(() => {
    if (!UUID.test(token) || !supabase) {
      setState('invalid');
      return;
    }
    supabase.rpc('unsubscribe', { p_token: token }).then(({ data, error }) => {
      if (error) setState('error');
      else if (!data) setState('invalid');
      else {
        setCompany(data as string);
        setState('done');
      }
    });
  }, [token]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-obsidian bg-grid px-6 pt-24 text-center text-white">
      <div className="max-w-lg">
        {state === 'working' && <p className="text-slate-400">Processing your request…</p>}
        {state === 'done' && (
          <>
            <h1 className="text-3xl font-bold tracking-tight">You have been unsubscribed.</h1>
            <p className="mt-4 text-slate-400">
              {company ? <><span className="text-white">{company}</span> will</> : 'You will'} not receive any further emails from {COMPANY.name}. We keep a record of this request so it is respected permanently.
            </p>
          </>
        )}
        {(state === 'invalid' || state === 'error') && (
          <>
            <h1 className="text-3xl font-bold tracking-tight">{state === 'invalid' ? 'This link is not valid.' : 'Something went wrong.'}</h1>
            <p className="mt-4 text-slate-400">
              To stop all emails from us, reply "unsubscribe" to any message or write to{' '}
              <a href={`mailto:${COMPANY.email}?subject=Unsubscribe`} className="text-accent underline">{COMPANY.email}</a>.
            </p>
          </>
        )}
        <Link to="/" className={`${btnPrimary} mt-8`}>Go to goldenpays.uk</Link>
      </div>
    </div>
  );
};

export default Unsubscribe;
