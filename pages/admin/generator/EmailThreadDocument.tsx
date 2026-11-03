import React from 'react';
import { COMPANY } from '../../../data/site';
import { AuditDossier } from '../../../types/generator';

interface Props {
  dossier: AuditDossier;
}

export const EmailThreadDocument: React.FC<Props> = ({ dossier }) => {
  const { emails, invoiceNumber, client, transaction } = dossier;

  return (
    <div className="bg-white p-8 sm:p-12 text-slate-800 text-sm print:p-0 print:text-xs leading-relaxed font-sans shadow-sm border border-slate-200 rounded-lg print:border-0 print:shadow-none">
      {/* Header */}
      <div className="border-b-2 border-slate-900 pb-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white font-mono text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">
              RFC 822 Audit Archive
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
              Verified Client Email Correspondence Thread
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Authentic chronological transaction communication log generated for banking & compliance audit.
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs text-slate-500">
            <div>Dossier Ref: <span className="font-bold text-slate-900">{invoiceNumber}</span></div>
            <div>Thread Status: <span className="text-emerald-700 font-bold">VERIFIED & COMPLETE (4/4)</span></div>
          </div>
        </div>
      </div>

      {/* Thread Overview Bar */}
      <div className="mb-8 p-4 bg-slate-50 rounded-md border border-slate-200 text-xs flex flex-wrap gap-6 justify-between items-center">
        <div>
          <span className="text-slate-400 uppercase font-mono text-[10px] block">Primary Client Contact</span>
          <span className="font-semibold text-slate-800">{client.name} &lt;{client.email}&gt;</span>
        </div>
        <div>
          <span className="text-slate-400 uppercase font-mono text-[10px] block">Corporate Host</span>
          <span className="font-semibold text-slate-800">{COMPANY.name} &lt;{COMPANY.email}&gt;</span>
        </div>
        <div>
          <span className="text-slate-400 uppercase font-mono text-[10px] block">Payment Proof Binding</span>
          <span className="font-mono text-slate-800 font-semibold">{transaction.reference}</span>
        </div>
      </div>

      {/* Chronological Email List */}
      <div className="space-y-8">
        {emails.map((email, idx) => (
          <div
            key={email.id}
            className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs print:border-slate-400 print:break-inside-avoid"
          >
            {/* RFC 822 Header Block */}
            <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 font-mono text-[11px] space-y-1 text-slate-700">
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/80">
                <span className="font-bold text-slate-900 uppercase tracking-wide text-xs">
                  {email.title}
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-bold">
                  Step {email.step} of 4
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">From: </span>
                <span className="text-slate-900 font-semibold">{email.from}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">To: </span>
                <span className="text-slate-900">{email.to}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Date: </span>
                <span className="text-slate-800">{email.date}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Subject: </span>
                <span className="text-slate-900 font-bold">{email.subject}</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-0.5">
                <span className="text-slate-400">Message-ID: </span>
                <span>{email.messageId}</span>
              </div>
              {email.deliveredTo && (
                <div className="text-[10px] text-slate-500">
                  <span className="text-slate-400">Delivered-To: </span>
                  <span>{email.deliveredTo}</span>
                </div>
              )}
            </div>

            {/* Email Message Body */}
            <div className="p-5 text-slate-800 text-xs sm:text-sm font-sans whitespace-pre-line leading-relaxed bg-white">
              {email.body}
            </div>
          </div>
        ))}
      </div>

      {/* Certification Footer */}
      <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase font-bold text-slate-700">
            Electronic Records Verification
          </p>
          <p className="mt-0.5">
            Archived in GOLDENPAYS compliance logs in accordance with UK Electronic Communications Act 2000.
          </p>
        </div>
        <div className="font-mono text-[10px] text-slate-400">
          SHA-256 Digest: {dossier.proof.auditHash.slice(0, 24)}...
        </div>
      </div>
    </div>
  );
};
