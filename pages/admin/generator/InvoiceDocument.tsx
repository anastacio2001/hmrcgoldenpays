import React from 'react';
import { COMPANY, SIC_CODES } from '../../../data/site';
import { AuditDossier } from '../../../types/generator';
import { CURRENCY_SYMBOLS } from '../../../lib/generatorEngine';
import { DirectorStamp } from './DirectorStamp';
import { DynamicQrCode } from '../../../components/DynamicQrCode';

interface Props {
  dossier: AuditDossier;
}

export const InvoiceDocument: React.FC<Props> = ({ dossier }) => {
  const { client, transaction, items, invoiceNumber, sicCode } = dossier;
  const symbol = CURRENCY_SYMBOLS[transaction.currency];
  const sicDetails = SIC_CODES.find((s) => s.code === sicCode);

  const formattedPaymentDate = new Date(transaction.datetime).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedPaymentTime = new Date(transaction.datetime).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return (
    <div className="bg-white p-8 sm:p-12 text-slate-800 text-sm print:p-0 print:text-xs leading-relaxed font-sans shadow-sm border border-slate-200 rounded-lg print:border-0 print:shadow-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-900 pb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
              GP-UK
            </span>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {COMPANY.name}
            </span>
          </div>
          <p className="mt-1 font-mono text-xs font-semibold text-slate-600">
            Company No. {COMPANY.number} · {COMPANY.jurisdiction}
          </p>
          <div className="mt-2 text-xs text-slate-500 max-w-sm">
            <p>Registered Office: {COMPANY.office}</p>
            <p className="mt-0.5">Contact: {COMPANY.email} · Web: goldenpays.uk</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="inline-block bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            ● PAID IN FULL
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">
            Commercial Invoice
          </h1>
          <p className="font-mono font-bold text-base text-slate-900 mt-1">{invoiceNumber}</p>
          <p className="font-mono text-xs text-slate-500 mt-0.5">
            Issue Date: {formattedPaymentDate}
          </p>
        </div>
      </div>

      {/* Bill To & Payment Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 my-8 py-4 border-b border-slate-200">
        <div>
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Client & Billing Party ({client.type === 'corporate' ? 'B2B / Corporate' : 'B2C / Individual'})
          </h2>
          <div className="font-semibold text-slate-900 text-base">
            {client.companyName ? client.companyName : client.name}
          </div>
          {client.companyName && (
            <div className="text-slate-700 font-medium">Attn: {client.name}</div>
          )}
          <div className="text-slate-600 mt-1 whitespace-pre-line text-xs">
            {client.billingAddress}
          </div>
          <div className="text-slate-600 text-xs font-medium mt-0.5">{client.country}</div>
          <div className="text-slate-500 text-xs mt-1">Email: {client.email}</div>
          {client.vatTaxId && (
            <div className="text-slate-500 text-xs font-mono mt-0.5">
              Tax / VAT ID: {client.vatTaxId}
            </div>
          )}
          {client.companyNumber && (
            <div className="text-slate-500 text-xs font-mono mt-0.5">
              Co. Reg: {client.companyNumber}
            </div>
          )}
        </div>

        <div className="sm:text-right">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Payment & Settlement Record
          </h2>
          <dl className="space-y-1.5 text-xs">
            <div>
              <span className="text-slate-500">Method: </span>
              <span className="font-semibold text-slate-800">
                {transaction.method === 'stripe'
                  ? 'Stripe Payment Gateway / Card'
                  : 'Taptap Send / UK Direct Bank Transfer'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Transaction ID: </span>
              <span className="font-mono font-semibold text-slate-800 break-all">
                {transaction.reference}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Execution Timestamp: </span>
              <span className="font-mono text-slate-700">
                {formattedPaymentDate} {formattedPaymentTime}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Official SIC Classification: </span>
              <span className="font-mono font-semibold text-slate-800">
                SIC {sicCode} · {sicDetails?.area || 'Tech Services'}
              </span>
            </div>
          </dl>
        </div>
      </div>

      {/* Service Scope Header */}
      <div className="mb-4 bg-slate-50 p-4 rounded-md border border-slate-200">
        <div className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Technical Scope & Tier Classification
        </div>
        <div className="font-bold text-slate-900 mt-0.5 text-sm sm:text-base">
          {dossier.deliverableTitle} (Tier {dossier.tier})
        </div>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{dossier.scopeSummary}</p>
      </div>

      {/* Itemized Table */}
      <div className="overflow-x-auto my-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-300 font-mono text-[11px] uppercase tracking-wider text-slate-500">
              <th className="py-2.5 pr-4">Description & Technical Deliverables</th>
              <th className="py-2.5 px-3">SIC Code</th>
              <th className="py-2.5 px-3 text-center">Unit / Qty</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 pl-4 text-right">Total ({transaction.currency})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-3.5 pr-4 font-medium text-slate-800">
                  {item.description}
                </td>
                <td className="py-3.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                  {item.sicCode}
                </td>
                <td className="py-3.5 px-3 text-center text-slate-600 whitespace-nowrap">
                  {item.quantity} {item.unit}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                  {symbol}{item.unitPrice.toFixed(2)}
                </td>
                <td className="py-3.5 pl-4 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                  {symbol}{item.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals & VAT Exemption Clause */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t-2 border-slate-200">
        <div className="max-w-md">
          <div className="rounded-md border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900">
            <p className="font-bold font-mono text-[10px] uppercase tracking-wider text-amber-800">
              Official UK VAT Exemption Notice
            </p>
            <p className="mt-1 leading-snug">
              Exempt from UK VAT under the domestic small business threshold provisions (Turnover below standard registration limit).
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Governing Law: England & Wales. All intellectual property delivered is transferred upon full settlement.
          </p>
        </div>

        <div className="w-full sm:w-64 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
            <span>Net Subtotal:</span>
            <span className="font-mono font-medium">{symbol}{transaction.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200 text-slate-600">
            <span>UK VAT (0.00% Exempt):</span>
            <span className="font-mono font-medium">{symbol}0.00</span>
          </div>
          <div className="flex justify-between py-2 border-b-2 border-slate-900 text-slate-900 font-bold text-sm">
            <span>Total Paid ({transaction.currency}):</span>
            <span className="font-mono">{symbol}{transaction.amount.toFixed(2)}</span>
          </div>
          <div className="text-right text-[11px] font-mono text-emerald-700 font-semibold pt-1">
            Status: Fully Settled & Cleared
          </div>
        </div>
      </div>

      {/* Official Settlement / Bank Transfer Instructions Block */}
      <div className="mt-6 rounded-lg border border-slate-300 bg-slate-50/90 p-4 print:border-slate-400">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-900">
              Direct Bank Transfer & Settlement Details (GBP Account)
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 uppercase">
            UK Domestic (FPS) & International Wire (SWIFT / IBAN)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="block text-[10px] uppercase font-mono font-semibold text-slate-400">
              Account Name
            </span>
            <span className="font-bold text-slate-900">{COMPANY.bank.accountName}</span>
          </div>

          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="block text-[10px] uppercase font-mono font-semibold text-slate-400">
              Account Number
            </span>
            <span className="font-mono font-bold text-slate-900 tracking-wider">
              {COMPANY.bank.accountNumber}
            </span>
          </div>

          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="block text-[10px] uppercase font-mono font-semibold text-slate-400">
              Sort Code
            </span>
            <span className="font-mono font-bold text-slate-900 tracking-wider">
              {COMPANY.bank.sortCode} ({COMPANY.bank.sortCodeRaw})
            </span>
          </div>

          <div className="bg-white p-2.5 rounded border border-slate-200">
            <span className="block text-[10px] uppercase font-mono font-semibold text-slate-400">
              SWIFT / BIC
            </span>
            <span className="font-mono font-bold text-slate-900 tracking-wider">
              {COMPANY.bank.swiftBic}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-3 bg-white p-2.5 rounded border border-slate-200">
            <span className="block text-[10px] uppercase font-mono font-semibold text-slate-400">
              International Bank Account Number (IBAN)
            </span>
            <span className="font-mono font-bold text-slate-900 tracking-wider break-all">
              {COMPANY.bank.iban}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white p-2.5 rounded border border-slate-200">
            <span className="block text-[10px] uppercase font-mono font-semibold text-slate-400">
              Payment Reference
            </span>
            <span className="font-mono font-bold text-emerald-800 tracking-wider">
              {invoiceNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Sign-off Footer, Digital Stamp & QR Verification */}
      <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <DynamicQrCode
            data={`${typeof window !== 'undefined' ? window.location.origin : 'https://goldenpays.uk'}/verify?ref=${invoiceNumber}`}
            size={88}
            label="SCAN TO VERIFY"
          />
          <div className="text-xs text-slate-500 max-w-xs">
            <p className="font-mono text-[10px] uppercase font-bold text-slate-700">Audit & Compliance Verification</p>
            <p className="mt-1">
              This invoice is backed by an automated verification record and cryptographic SHA-256 deliverable fingerprint.
            </p>
            <p className="mt-1 font-mono text-[10px] text-slate-600">
              Audit Hash: {dossier.proof.auditHash.slice(0, 24)}...
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <DirectorStamp timestamp={transaction.datetime} hash={dossier.proof.auditHash} directorName={dossier.directorName} />
        </div>
      </div>
    </div>
  );
};
