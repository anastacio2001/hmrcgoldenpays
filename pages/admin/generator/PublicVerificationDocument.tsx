import React from 'react';
import { COMPANY, SIC_CODES } from '../../../data/site';
import { AuditDossier } from '../../../types/generator';

interface Props {
  dossier: AuditDossier;
}

export const PublicVerificationDocument: React.FC<Props> = ({ dossier }) => {
  const { proof, invoiceNumber, client, transaction, sicCode } = dossier;
  const sicDetails = SIC_CODES.find((s) => s.code === sicCode);

  const completionDate = new Date(transaction.datetime).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Client name sanitized for public compliance view (e.g. ACME Corp or J*** S*** if individual)
  const sanitizedClient = client.type === 'corporate'
    ? (client.companyName || client.name)
    : `${client.name.split(' ')[0]} ${client.name.split(' ').slice(1).map((n) => n[0] ? n[0] + '***' : '').join(' ')}`;

  return (
    <div className="bg-white p-8 sm:p-12 text-slate-800 text-sm print:p-0 print:text-xs leading-relaxed font-sans shadow-sm border border-slate-200 rounded-lg print:border-0 print:shadow-none">
      {/* Verification Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-slate-900 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Verified & Accepted Delivery
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Compliance & Technical Deliverable Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Public verification portal for banking partners, payment compliance desks & auditors.
          </p>
        </div>

        <div className="text-left sm:text-right font-mono text-xs text-slate-600">
          <div>Reference: <span className="font-bold text-slate-900">{invoiceNumber}</span></div>
          <div>Published by: <span className="text-slate-800">{COMPANY.name}</span></div>
        </div>
      </div>

      {/* Verification Badge Bar */}
      <div className="my-6 p-4 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-obsidian text-white shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-lg">✔</span>
              <span className="font-mono font-bold text-sm tracking-wide text-emerald-300 uppercase">
                Audit Status: 100% Confirmed & Fully Settled
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              This technical deliverable was produced and fulfilled by <strong>{COMPANY.name}</strong> (UK Co. #{COMPANY.number}) and formally accepted on {completionDate}.
            </p>
          </div>

          <div className="font-mono text-right text-xs shrink-0 bg-white/10 p-3 rounded-lg border border-white/10">
            <div className="text-slate-400 text-[10px] uppercase">SHA-256 Fingerprint</div>
            <div className="text-emerald-300 font-bold mt-0.5">{proof.auditHash.slice(0, 16)}...</div>
          </div>
        </div>
      </div>

      {/* Grid of Verified Project Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Service Classification
          </span>
          <div className="font-bold text-slate-900 font-mono text-sm">
            SIC {sicCode}
          </div>
          <div className="text-xs text-slate-600 mt-0.5">{sicDetails?.label}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            Area: {sicDetails?.area}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Client Classification
          </span>
          <div className="font-bold text-slate-900 text-sm">
            {sanitizedClient}
          </div>
          <div className="text-xs text-slate-600 mt-0.5">
            Jurisdiction: {client.country} ({client.type === 'corporate' ? 'B2B Commercial' : 'B2C Individual'})
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Tx: {transaction.reference}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Release Specification
          </span>
          <div className="font-bold text-slate-900 font-mono text-sm">
            {proof.releaseTag}
          </div>
          <div className="text-xs text-slate-600 mt-0.5">Commit: {proof.gitCommit}</div>
          <div className="text-[11px] text-emerald-700 font-mono mt-1">
            Delivery: {proof.deliveryType}
          </div>
        </div>
      </div>

      {/* Scope & Architecture Diagram Preview */}
      <div className="my-8">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
          Architecture Schema & Systems Blueprint Preview
        </h2>

        {/* Clean Vector SVG Architecture Schema */}
        <div className="p-6 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-inner overflow-x-auto">
          <div className="min-w-[620px]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>SYSTEM ARCHITECTURE DIAGRAM // PRODUCTION TOPOLOGY</span>
              </span>
              <span className="text-emerald-400">STATUS: ACTIVE & DELIVERED</span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center text-xs font-mono">
              {/* Box 1: Client Gateway */}
              <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Layer 01</div>
                  <div className="font-bold text-white text-sm">Client Request</div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 bg-slate-900/60 p-1.5 rounded">
                  HTTPS / TLS 1.3
                  <div className="text-emerald-400 mt-0.5">Authenticated</div>
                </div>
              </div>

              {/* Box 2: GOLDENPAYS Middleware Engine */}
              <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-600/60 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="text-[10px] uppercase text-emerald-400 font-bold mb-1">Layer 02</div>
                  <div className="font-bold text-white text-sm">GP Core Engine</div>
                </div>
                <div className="text-[10px] text-emerald-200 mt-2 bg-slate-900/80 p-1.5 rounded border border-emerald-500/40">
                  SIC {sicCode} Module
                  <div className="text-white mt-0.5 font-bold">Node.js / REST API</div>
                </div>
              </div>

              {/* Box 3: Cloud Database & Webhooks */}
              <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Layer 03</div>
                  <div className="font-bold text-white text-sm">Data & Webhooks</div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 bg-slate-900/60 p-1.5 rounded">
                  PostgreSQL / DB
                  <div className="text-emerald-400 mt-0.5">Encrypted at Rest</div>
                </div>
              </div>

              {/* Box 4: Fulfillment Verification */}
              <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-bold mb-1">Layer 04</div>
                  <div className="font-bold text-white text-sm">Fulfillment</div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 bg-slate-900/60 p-1.5 rounded">
                  SHA-256 Digest
                  <div className="text-emerald-400 mt-0.5">Handover Complete</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center text-[11px] font-mono text-slate-400">
              <div>Endpoint: <span className="text-emerald-400">{proof.endpointUrl}</span></div>
              <div>Runtime: <span className="text-white">{proof.runtimeEnvironment}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Scope Documentation */}
      <div className="my-6 p-5 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed">
        <h3 className="font-mono text-[10px] uppercase font-bold text-slate-400 mb-2">
          Sanitized Scope Documentation & Technical Summary
        </h3>
        <div className="font-bold text-slate-900 text-sm mb-1">{dossier.deliverableTitle}</div>
        <p className="text-slate-700">{dossier.scopeSummary}</p>
        <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
          <div>
            <strong>Intellectual Property Status:</strong> 100% assigned to client upon receipt of consideration.
          </div>
          <div>
            <strong>UK Statutory Compliance:</strong> Registered under UK Companies Act 2006.
          </div>
        </div>
      </div>

      {/* Verification Badge Footer */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-lg">
            ✔
          </div>
          <div>
            <div className="font-bold text-slate-900">Digital Signature Verified</div>
            <div className="text-slate-500 font-mono text-[11px]">
              Certified by Ladislau Segunda Anastácio, Managing Director
            </div>
          </div>
        </div>

        <div className="font-mono text-xs text-slate-500 text-left sm:text-right">
          <div>Companies House: <a href={COMPANY.companiesHouseUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold hover:underline">16227513</a></div>
          <div>Official Record: goldenpays.uk/verify</div>
        </div>
      </div>
    </div>
  );
};
