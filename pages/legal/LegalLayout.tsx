import React from 'react';
import { COMPANY } from '../../data/site';
import { PageHeader } from '../../components/ui';

export interface LegalSection {
  title: string;
  body: React.ReactNode;
}

const LegalLayout: React.FC<{ title: string; updated: string; intro: string; sections: LegalSection[] }> = ({ title, updated, intro, sections }) => (
  <div>
    <PageHeader eyebrow={`Legal · Last updated ${updated}`} title={title} intro={intro} />
    <article className="mx-auto max-w-3xl px-6 py-16">
      <div className="space-y-10 text-[15px] leading-relaxed text-slate-700 [&_li]:mt-1.5 [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        {sections.map((section, i) => (
          <section key={section.title}>
            <h2 className="mb-3 text-lg font-semibold text-obsidian">
              <span className="mr-2 font-mono text-sm text-accent-dark">{String(i + 1).padStart(2, '0')}</span>
              {section.title}
            </h2>
            {section.body}
          </section>
        ))}
      </div>
      <footer className="mt-14 rounded-xl bg-mist p-6 text-sm text-slate-600">
        <p className="font-semibold text-obsidian">{COMPANY.name}</p>
        <p>Company No. {COMPANY.number} · {COMPANY.jurisdiction}</p>
        <p>{COMPANY.office}</p>
        <p>Email: <a href={`mailto:${COMPANY.email}`} className="text-accent-dark underline">{COMPANY.email}</a></p>
      </footer>
    </article>
  </div>
);

export default LegalLayout;
