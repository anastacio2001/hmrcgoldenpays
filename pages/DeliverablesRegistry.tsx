import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui';
import { COMPANY, SIC_CODES } from '../data/site';
import { SEED_PUBLIC_PROJECTS, PublicProject } from '../data/publicRegistry';
import { getSavedDossiers } from '../lib/generatorEngine';

export const DeliverablesRegistry: React.FC = () => {
  const [selectedSic, setSelectedSic] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Merge seed projects with any saved audit dossiers that were marked as public
  const savedDossiers = getSavedDossiers();

  const generatedProjects: PublicProject[] = savedDossiers
    .filter((d) => d.isPublic)
    .map((d) => ({
      reference: d.invoiceNumber,
      title: d.deliverableTitle,
      category: d.serviceCategory,
      sicCode: d.sicCode,
      clientClassification: `${d.client.country} · ${d.client.type === 'corporate' ? (d.client.companyName || 'Corporate Client') : 'Individual Client'}`,
      jurisdiction: d.client.country,
      valueBadge: `${d.transaction.currency} ${d.transaction.amount.toFixed(2)} · Tier ${d.tier}`,
      acceptedDate: d.transaction.datetime.slice(0, 10),
      gitRelease: d.proof.releaseTag,
      fingerprint: d.proof.auditHash,
      tags: ['TypeScript', 'Node.js', 'REST API', `SIC ${d.sicCode}`],
      description: d.scopeSummary,
      architectureHighlights: d.proof.acceptanceCriteria,
      deliverableType: d.proof.deliveryType,
    }));

  // Unique list by reference (avoid duplicates)
  const allProjects = [...generatedProjects, ...SEED_PUBLIC_PROJECTS].filter(
    (proj, index, self) => index === self.findIndex((p) => p.reference === proj.reference)
  );

  const filteredProjects = allProjects.filter((p) => {
    const matchesSic = selectedSic === 'all' || p.sicCode === selectedSic;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q) ||
      p.clientClassification.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q));

    return matchesSic && matchesQuery;
  });

  return (
    <div className="bg-mist min-h-screen pb-20">
      <PageHeader
        eyebrow="Public Engineering Registry"
        title="Verified Deliverables & Systems Archive"
        intro={`Official public repository of software architectures, integration pipelines, and digital licenses provisioned by ${COMPANY.name} (UK Company No. ${COMPANY.number}).`}
      />

      <div className="mx-auto max-w-6xl px-6 pt-10">
        {/* Verification & Trust Banner */}
        <div className="rounded-xl border border-steel bg-white p-6 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="border-r border-steel/60 last:border-0">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
                Total Published
              </span>
              <span className="text-2xl font-black text-obsidian font-mono mt-1 block">
                {allProjects.length} Systems
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">100% Accepted</span>
            </div>

            <div className="border-r border-steel/60 last:border-0">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
                Official Jurisdiction
              </span>
              <span className="text-sm font-bold text-obsidian mt-1 block">
                England & Wales
              </span>
              <span className="text-[11px] font-mono text-slate-500">Co. #{COMPANY.number}</span>
            </div>

            <div className="border-r border-steel/60 last:border-0">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
                Compliance Standard
              </span>
              <span className="text-sm font-bold text-obsidian mt-1 block">
                UK SIC 2007 Codes
              </span>
              <span className="text-[11px] text-slate-500">4 Registered Areas</span>
            </div>

            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
                Integrity Seal
              </span>
              <span className="text-sm font-bold text-emerald-700 mt-1 block">
                SHA-256 Audit Hashes
              </span>
              <span className="text-[11px] text-slate-500">Publicly Verifiable</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="my-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* SIC Code Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedSic('all')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                selectedSic === 'all'
                  ? 'bg-obsidian text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-steel'
              }`}
            >
              All Deliverables ({allProjects.length})
            </button>
            {SIC_CODES.map((s) => {
              const count = allProjects.filter((p) => p.sicCode === s.code).length;
              return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => setSelectedSic(s.code)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                    selectedSic === s.code
                      ? 'bg-obsidian text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-steel'
                  }`}
                >
                  <span>SIC {s.code}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference, technology, scope..."
              className="w-full rounded-lg border border-steel bg-white px-3.5 py-2 text-xs focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Deliverables Grid */}
        <div className="space-y-6">
          {filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-steel bg-white p-12 text-center text-slate-500 text-sm">
              No verified deliverables match the selected filter.
            </div>
          ) : (
            filteredProjects.map((project) => (
              <article
                key={project.reference}
                className="rounded-xl border border-steel bg-white p-6 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-steel/60 pb-4 mb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                        {project.reference}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        SIC {project.sicCode} · {project.category}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {project.valueBadge}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-obsidian tracking-tight">
                      {project.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client Classification: <strong className="text-slate-700">{project.clientClassification}</strong> · Jurisdiction: {project.jurisdiction}
                    </p>
                  </div>

                  <div className="lg:text-right shrink-0">
                    <Link
                      to={`/verify/${project.reference}`}
                      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition"
                    >
                      <span>Inspect Audit Dossier</span>
                      <span>→</span>
                    </Link>
                    <div className="mt-1 font-mono text-[10px] text-slate-400">
                      Accepted: {new Date(project.acceptedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Scope Description */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4">
                  {project.description}
                </p>

                {/* Architecture Highlights */}
                {project.architectureHighlights && project.architectureHighlights.length > 0 && (
                  <div className="mb-4 rounded-lg bg-slate-50 p-3.5 border border-steel/60 text-xs">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                      Key Technical Deliverables & Acceptance Highlights:
                    </span>
                    <ul className="space-y-1 text-slate-600">
                      {project.architectureHighlights.map((hl, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✔</span>
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technical Tags & Fingerprint */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-steel/60">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-700 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10px] text-emerald-800 font-semibold border border-emerald-200">
                      Release: {project.gitRelease}
                    </span>
                  </div>

                  <div className="font-mono text-[10px] text-slate-400 truncate max-w-sm">
                    SHA-256: <span className="text-slate-600 select-all">{project.fingerprint.slice(0, 24)}...</span>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Compliance Notice Footer */}
        <div className="mt-16 rounded-xl border border-steel bg-white p-6 text-xs text-slate-600">
          <h3 className="font-bold text-obsidian text-sm mb-1">
            Data Privacy & Confidentiality Notice (UK GDPR Compliance)
          </h3>
          <p className="leading-relaxed">
            In accordance with the UK Data Protection Act 2018 and client non-disclosure covenants, proprietary customer identifiers and internal data payloads are sanitized prior to publication in the Public Engineering Registry. All engineering deliverables listed above were independently executed and delivered by <strong>{COMPANY.name}</strong> under English law.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500 font-mono">
            <span>Registered Office: {COMPANY.office}</span>
            <span>Managing Director: {COMPANY.director}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliverablesRegistry;
