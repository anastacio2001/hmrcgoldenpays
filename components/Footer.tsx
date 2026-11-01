import React from 'react';
import { Link } from 'react-router-dom';
import { COMPANY, SIC_CODES } from '../data/site';
import { Logo } from './Navbar';

const columns = [
  {
    heading: 'Services',
    links: [
      { name: 'Solutions', path: '/solutions' },
      { name: 'Productized Services', path: '/services' },
      { name: 'SaaS Catalog', path: '/saas' },
      { name: 'Contact', path: '/contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { name: 'Terms of Service', path: '/legal/terms' },
      { name: 'Privacy Policy (GDPR)', path: '/legal/privacy' },
      { name: 'Refund & Cancellation', path: '/legal/refunds' },
      { name: 'Verification Portal', path: '/verify' },
    ],
  },
];

const Footer: React.FC = () => (
  <footer className="bg-obsidian text-slate-400">
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed">
            Software engineering and cloud automation studio. Custom digital systems, automated workflows and managed cloud data infrastructure.
          </p>
          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Legal entity</dt>
              <dd className="text-slate-200">{COMPANY.name} · Company No. <span className="font-mono">{COMPANY.number}</span></dd>
              <dd>{COMPANY.jurisdiction}</dd>
            </div>
            <div>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Registered office</dt>
              <dd>{COMPANY.office}</dd>
            </div>
          </dl>
        </div>

        {columns.map((col) => (
          <div key={col.heading} className="md:col-span-2">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">{col.heading}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="transition-colors hover:text-white">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="md:col-span-3">
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-500">Registered SIC codes</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SIC_CODES.map((sic) => (
              <li key={sic.code}>
                <span className="font-mono text-accent">{sic.code}</span> {sic.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
        <a href={COMPANY.companiesHouseUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
          View on Companies House ↗
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
