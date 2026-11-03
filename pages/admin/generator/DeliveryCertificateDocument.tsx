import React from 'react';
import { COMPANY, SIC_CODES } from '../../../data/site';
import { AuditDossier } from '../../../types/generator';
import { DirectorStamp } from './DirectorStamp';
import { DynamicQrCode } from '../../../components/DynamicQrCode';

interface Props {
  dossier: AuditDossier;
}

export const DeliveryCertificateDocument: React.FC<Props> = ({ dossier }) => {
  const { proof, invoiceNumber, client, transaction, sicCode } = dossier;
  const sicDetails = SIC_CODES.find((s) => s.code === sicCode);

  const completionDate = new Date(transaction.datetime).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white p-8 sm:p-12 text-slate-800 text-sm print:p-0 print:text-xs leading-relaxed font-sans shadow-sm border border-slate-200 rounded-lg print:border-0 print:shadow-none">
      {/* Formal Header */}
      <div className="border-b-2 border-slate-900 pb-6 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-900 text-emerald-100 font-mono text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase tracking-widest font-bold">
          ★ OFFICIAL TECHNICAL AUDIT RECORD ★
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-3 tracking-tight uppercase">
          {proof.title}
        </h1>
        <p className="font-mono text-xs text-slate-500 mt-1 uppercase tracking-wider">
          Issued by {COMPANY.name} · UK Registered Company No. {COMPANY.number}
        </p>
      </div>

      {/* Audit Hash Highlight Banner */}
      <div className="my-6 p-4 bg-slate-900 text-white rounded-lg border border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-800">
          <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
            Cryptographic Build & Audit Hash (SHA-256)
          </span>
          <span className="font-mono text-[10px] text-slate-400">
            Algorithm: FIPS 180-4 SHA-256
          </span>
        </div>
        <div className="mt-2 font-mono text-xs sm:text-sm text-emerald-300 break-all tracking-wider select-all">
          {proof.auditHash}
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-[11px] font-mono text-slate-400">
          <span>Git Release: <strong className="text-white">{proof.releaseTag}</strong></span>
          <span>Commit Ref: <strong className="text-white">{proof.gitCommit}</strong></span>
          <span>Delivery Type: <strong className="text-emerald-400">{proof.deliveryType}</strong></span>
        </div>
      </div>

      {/* Engagement Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-4 bg-slate-50 border border-slate-200 rounded-md text-xs">
        <div>
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Certified Deliverable Specification
          </span>
          <div className="font-bold text-slate-900 text-sm">{dossier.deliverableTitle}</div>
          <p className="text-slate-600 mt-1">{dossier.scopeSummary}</p>
          <div className="mt-2 font-mono text-slate-700">
            Registered Classification: <strong>SIC {sicCode}</strong> ({sicDetails?.area})
          </div>
        </div>

        <div>
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Client & Deployment Target
          </span>
          <div className="font-bold text-slate-900">
            {client.companyName ? `${client.companyName} (${client.name})` : client.name}
          </div>
          <div className="text-slate-600 mt-0.5">{client.billingAddress}, {client.country}</div>
          <div className="mt-2 font-mono text-[11px] text-slate-700 space-y-0.5">
            <div>Invoice & SOW Ref: <strong>{invoiceNumber}</strong></div>
            <div>Runtime Environment: <strong>{proof.runtimeEnvironment}</strong></div>
            <div>Verification Status: <span className="text-emerald-700 font-bold">100% Accepted & Live</span></div>
          </div>
        </div>
      </div>

      {/* Milestones Verification Checklist */}
      <div className="my-6">
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          Milestone Verification & Technical Execution Log
        </h2>
        <div className="border border-slate-200 rounded-md overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-100 font-mono text-[10px] uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5">Milestone / Stage</th>
                <th className="p-2.5">Audit Verification Detail</th>
                <th className="p-2.5 font-mono">Timestamp</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {proof.milestones.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50">
                  <td className="p-2.5 font-semibold text-slate-800">
                    <span className="font-mono text-slate-400 mr-1.5">{m.id}</span>
                    {m.title}
                  </td>
                  <td className="p-2.5 text-slate-600">{m.verificationDetail}</td>
                  <td className="p-2.5 font-mono text-slate-500 whitespace-nowrap">{m.timestamp}</td>
                  <td className="p-2.5 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✔ PASSED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Acceptance Criteria Affirmation */}
      <div className="my-6 p-4 bg-slate-50 border border-slate-200 rounded-md text-xs">
        <h3 className="font-mono text-[10px] uppercase font-bold text-slate-500 mb-2">
          Technical Acceptance Criteria Sign-Off
        </h3>
        <ul className="space-y-1.5 text-slate-700">
          {proof.acceptanceCriteria.map((crit, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-emerald-600 font-bold">✔</span>
              <span>{crit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Formal Director Certification, QR Audit Verification & Stamp */}
      <div className="mt-8 pt-6 border-t-2 border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <DynamicQrCode
            data={`${typeof window !== 'undefined' ? window.location.origin : 'https://goldenpays.uk'}/verify?ref=${invoiceNumber}`}
            size={88}
            label="SCAN TO VERIFY"
          />
          <div className="text-xs text-slate-600 max-w-xs">
            <p className="font-mono text-[10px] uppercase font-bold text-slate-900">
              Director Technical Attestation
            </p>
            <p className="mt-1 leading-relaxed">
              I hereby certify that the technical deliverables, software configurations, and system endpoints referenced in this certificate have been completed in accordance with professional engineering standards and formally delivered to the client.
            </p>
            <div className="mt-2 font-mono text-[10px] text-slate-500">
              Date of Certification: {completionDate}
            </div>
          </div>
        </div>

        <div>
          <DirectorStamp timestamp={transaction.datetime} hash={proof.auditHash} directorName={dossier.directorName} />
        </div>
      </div>
    </div>
  );
};
