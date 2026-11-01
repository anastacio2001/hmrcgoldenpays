import React from 'react';
import { Link } from 'react-router-dom';
import { btnPrimary } from '../components/ui';

const NotFound: React.FC = () => (
  <div className="flex min-h-[70vh] items-center justify-center bg-obsidian bg-grid px-6 pt-24 text-center text-white">
    <div>
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-3 text-slate-400">The page you requested does not exist or has moved.</p>
      <Link to="/" className={`${btnPrimary} mt-8`}>Back to home</Link>
    </div>
  </div>
);

export default NotFound;
