import React, { useState } from 'react';
import { AuditDossier } from '../../../types/generator';
import { CURRENCY_SYMBOLS, saveDossierToStorage } from '../../../lib/generatorEngine';
import { InvoiceDocument } from './InvoiceDocument';
import { ContractDocument } from './ContractDocument';
import { EmailThreadDocument } from './EmailThreadDocument';
import { DeliveryCertificateDocument } from './DeliveryCertificateDocument';
import { PublicVerificationDocument } from './PublicVerificationDocument';
import { supabase } from '../../../lib/supabase';

type TabKey = 'invoice' | 'contract' | 'emails' | 'delivery' | 'verify' | 'full';

interface Props {
  dossier: AuditDossier;
  onEdit?: () => void;
  onSaved?: () => void;
}

export const DossierContainer: React.FC<Props> = ({ dossier, onEdit, onSaved }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('invoice');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3500);
  };

  const getVerificationUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://goldenpays.uk';
    return `${origin}/verify?ref=${dossier.invoiceNumber}`;
  };

  const handlePrint = (tab?: TabKey) => {
    if (tab) setActiveTab(tab);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const downloadSingleDocument = (tab: TabKey) => {
    setActiveTab(tab);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleCopyVerificationUrl = async () => {
    const url = getVerificationUrl();
    try {
      await navigator.clipboard.writeText(url);
      showToast('Copied verification URL to clipboard!');
    } catch {
      showToast(url);
    }
  };

  const handleCopyWhatsApp = async () => {
    const symbol = CURRENCY_SYMBOLS[dossier.transaction.currency];
    const url = getVerificationUrl();
    const clientName = dossier.client.companyName ? `${dossier.client.companyName} (${dossier.client.name})` : dossier.client.name;

    const message = `*GOLDENPAYS LTD - Technical Fulfillment & Delivery Confirmation*\n\n` +
      `Dear ${clientName},\n` +
      `Your project deliverable has been successfully deployed and verified by our engineering team.\n\n` +
      `📄 *Invoice & Ref:* ${dossier.invoiceNumber}\n` +
      `💼 *Deliverable:* ${dossier.deliverableTitle}\n` +
      `💰 *Amount Cleared:* ${symbol}${dossier.transaction.amount.toFixed(2)} ${dossier.transaction.currency}\n` +
      `🛡️ *Audit Hash (SHA-256):* ${dossier.proof.auditHash.slice(0, 16)}...\n\n` +
      `🔍 *Public Compliance & Verification Link:*\n${url}\n\n` +
      `All intellectual property has transferred unconditionally under our bilateral agreement.\n` +
      `Thank you for choosing GOLDENPAYS LTD.\n` +
      `_Ladislau S. Anastácio, Managing Director (UK Co. #16227513)_`;

    try {
      await navigator.clipboard.writeText(message);
      showToast('Copied WhatsApp confirmation message to clipboard!');
    } catch {
      showToast('Could not copy to clipboard.');
    }
  };

  const handleSaveDossier = async () => {
    saveDossierToStorage(dossier);

    // Optional Supabase sync for deliverable verification
    if (supabase) {
      setIsSyncing(true);
      try {
        // Attempt to sync deliverable record if table exists
        await supabase.from('deliverables').upsert({
          reference: dossier.invoiceNumber,
          client_classification: `${dossier.client.country} · ${dossier.client.type === 'corporate' ? 'B2B Enterprise' : 'B2C Individual'}`,
          sic_code: dossier.sicCode,
          deliverable_summary: dossier.deliverableTitle,
          accepted_on: dossier.transaction.datetime.slice(0, 10),
          approved_by: 'Ladislau S. Anastácio, Managing Director',
          is_public: true,
        }, { onConflict: 'reference' });
      } catch (err) {
        console.warn('Supabase sync notice (saved locally in storage):', err);
      } finally {
        setIsSyncing(false);
      }
    }

    showToast('Audit Dossier successfully saved to records!');
    if (onSaved) onSaved();
  };

  const tabs: { key: TabKey; label: string; badge?: string }[] = [
    { key: 'invoice', label: '1. UK Commercial Invoice' },
    { key: 'contract', label: '2. SOW Agreement' },
    { key: 'emails', label: '3. Email Thread' },
    { key: 'delivery', label: '4. Delivery Certificate' },
    { key: 'verify', label: '5. Public Verification' },
    { key: 'full', label: 'FULL DOSSIER (All 5)', badge: 'PRINT ALL' },
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-slate-900 px-4 py-3 text-white text-sm shadow-xl flex items-center gap-3 border border-emerald-500/40 no-print animate-fade-up">
          <span className="text-emerald-400 font-bold">✔</span>
          <span>{feedback}</span>
        </div>
      )}

      {/* Control / Export Bar (Hidden in Print) */}
      <div className="no-print rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                Dossier Ready:
              </span>
              <span className="font-mono text-sm font-bold text-slate-900">
                {dossier.invoiceNumber}
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Tier {dossier.tier} · SIC {dossier.sicCode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Client: <strong className="text-slate-800">{dossier.client.name}</strong> · Amount:{' '}
              <strong className="text-slate-800 font-mono">
                {CURRENCY_SYMBOLS[dossier.transaction.currency]}
                {dossier.transaction.amount.toFixed(2)} {dossier.transaction.currency}
              </strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ✏️ Edit Parameters
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveDossier}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              💾 Save to Records
            </button>

            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="Copy formatted WhatsApp client confirmation"
            >
              💬 WhatsApp Confirm
            </button>

            <button
              type="button"
              onClick={handleCopyVerificationUrl}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="Copy shareable link for banking partners & compliance desks"
            >
              🔗 Compliance Link
            </button>

            <button
              type="button"
              onClick={() => {
                const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `audit-dossier-${dossier.invoiceNumber}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                showToast('Audit JSON payload downloaded successfully!');
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              title="Download structured JSON audit payload for Stripe disputes or HMRC filings"
            >
              📥 Export JSON
            </button>

            <button
              type="button"
              onClick={() => handlePrint()}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800"
              title="Print or Save PDF of the currently selected document or all 5"
            >
              🖨️ {activeTab === 'full' ? 'Print Full Dossier (5 PDFs)' : 'Download / Print This Doc'}
            </button>
          </div>
        </div>

        {/* Tab Selectors & Quick Download Per-Document Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`rounded px-1.5 py-0.2 font-mono text-[9px] uppercase font-bold ${
                        isActive ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-800'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Separate Download Dropdown / Buttons */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200">
            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase px-1">
              Baixar Separado:
            </span>
            <button
              type="button"
              onClick={() => downloadSingleDocument('invoice')}
              className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px]"
              title="Baixar apenas a Fatura Comercial UK em PDF"
            >
              1. Fatura
            </button>
            <button
              type="button"
              onClick={() => downloadSingleDocument('contract')}
              className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px]"
              title="Baixar apenas o Contrato SOW em PDF"
            >
              2. SOW
            </button>
            <button
              type="button"
              onClick={() => downloadSingleDocument('emails')}
              className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px]"
              title="Baixar apenas os E-mails RFC-822 em PDF"
            >
              3. E-mails
            </button>
            <button
              type="button"
              onClick={() => downloadSingleDocument('delivery')}
              className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px]"
              title="Baixar apenas o Certificado de Entrega em PDF"
            >
              4. Certificado
            </button>
            <button
              type="button"
              onClick={() => downloadSingleDocument('verify')}
              className="px-2 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-mono text-[11px]"
              title="Baixar apenas a Verificação de Arquitetura em PDF"
            >
              5. Portal
            </button>
          </div>
        </div>
      </div>

      {/* Rendered Document View */}
      <div className="w-full">
        {activeTab === 'invoice' && <InvoiceDocument dossier={dossier} />}
        {activeTab === 'contract' && <ContractDocument dossier={dossier} />}
        {activeTab === 'emails' && <EmailThreadDocument dossier={dossier} />}
        {activeTab === 'delivery' && <DeliveryCertificateDocument dossier={dossier} />}
        {activeTab === 'verify' && <PublicVerificationDocument dossier={dossier} />}

        {/* FULL DOSSIER: Sequentially renders all 5 documents with print page breaks */}
        {activeTab === 'full' && (
          <div className="space-y-8">
            <div className="no-print bg-slate-100 p-3 rounded text-center text-xs text-slate-600">
              Rendering Complete 5-Piece Audit Dossier. When you print, each document will start on a separate page.
            </div>

            {/* 1. Commercial Invoice */}
            <div className="dossier-page">
              <div className="mb-2 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest no-print">
                Document 1 of 5: UK Commercial Invoice
              </div>
              <InvoiceDocument dossier={dossier} />
            </div>

            {/* 2. SOW Contract */}
            <div className="dossier-page print-page-break">
              <div className="mb-2 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest no-print">
                Document 2 of 5: Statement of Work (SOW) Agreement
              </div>
              <ContractDocument dossier={dossier} />
            </div>

            {/* 3. Verified Email Thread */}
            <div className="dossier-page print-page-break">
              <div className="mb-2 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest no-print">
                Document 3 of 5: RFC 822 Email Correspondence Thread
              </div>
              <EmailThreadDocument dossier={dossier} />
            </div>

            {/* 4. Delivery Certificate */}
            <div className="dossier-page print-page-break">
              <div className="mb-2 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest no-print">
                Document 4 of 5: Technical Fulfillment Certificate
              </div>
              <DeliveryCertificateDocument dossier={dossier} />
            </div>

            {/* 5. Public Verification */}
            <div className="dossier-page print-page-break">
              <div className="mb-2 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest no-print">
                Document 5 of 5: Public Audit Verification & Architecture Schema
              </div>
              <PublicVerificationDocument dossier={dossier} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
