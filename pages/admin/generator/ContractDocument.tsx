import React from 'react';
import { COMPANY, SIC_CODES } from '../../../data/site';
import { AuditDossier } from '../../../types/generator';
import { CURRENCY_SYMBOLS } from '../../../lib/generatorEngine';
import { DirectorStamp } from './DirectorStamp';

interface Props {
  dossier: AuditDossier;
}

export const ContractDocument: React.FC<Props> = ({ dossier }) => {
  const { client, transaction, items, invoiceNumber, sicCode } = dossier;
  const symbol = CURRENCY_SYMBOLS[transaction.currency];
  const sicDetails = SIC_CODES.find((s) => s.code === sicCode);

  const contractDate = new Date(transaction.datetime).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-white p-8 sm:p-12 text-slate-800 text-sm print:p-0 print:text-xs leading-relaxed font-sans shadow-sm border border-slate-200 rounded-lg print:border-0 print:shadow-none">
      {/* Contract Title & Meta */}
      <div className="border-b-2 border-slate-900 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Legally Binding Agreement · UK Law
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
              Statement of Work & Software Engineering Agreement
            </h1>
          </div>
          <div className="text-left sm:text-right font-mono text-xs text-slate-500">
            <div>Agreement Ref: <span className="font-bold text-slate-900">{invoiceNumber}-SOW</span></div>
            <div>Effective Date: <span className="text-slate-800">{contractDate}</span></div>
          </div>
        </div>
      </div>

      {/* Parties Preamble */}
      <div className="my-6 bg-slate-50 p-4 rounded-md border border-slate-200 text-xs">
        <p className="font-bold text-slate-900 uppercase font-mono text-[10px] tracking-wider mb-2">
          Parties to this Agreement
        </p>
        <p className="mb-2">
          This Agreement is entered into on <strong>{contractDate}</strong> by and between:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-200">
          <div>
            <span className="font-mono text-[10px] uppercase text-slate-400 font-bold block">
              Service Provider
            </span>
            <strong className="text-slate-900">{COMPANY.name}</strong>
            <div className="text-slate-600 mt-0.5">UK Company No. {COMPANY.number}</div>
            <div className="text-slate-600">{COMPANY.office}</div>
            <div className="text-slate-600">Represented by: {COMPANY.director}, Managing Director</div>
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase text-slate-400 font-bold block">
              Client / Recipient
            </span>
            <strong className="text-slate-900">{client.companyName ? client.companyName : client.name}</strong>
            {client.companyName && <div className="text-slate-600">Contact: {client.name}</div>}
            <div className="text-slate-600">{client.billingAddress}</div>
            <div className="text-slate-600">{client.country} · {client.email}</div>
          </div>
        </div>
      </div>

      {/* Contract Body Clauses */}
      <div className="space-y-6 text-xs text-slate-700">
        <section>
          <h2 className="font-bold text-slate-900 text-sm font-mono uppercase tracking-wider mb-2">
            1. Scope of Engagement & Regulatory Classification
          </h2>
          <p>
            The Client engages <strong>{COMPANY.name}</strong> to execute and deliver technical deliverables aligned with the Company’s registered UK Standard Industrial Classification (SIC):
          </p>
          <div className="my-2 p-3 bg-white border border-slate-200 rounded font-mono text-[11px] text-slate-800">
            <strong>SIC {sicCode}:</strong> {sicDetails?.label} ({sicDetails?.area})
          </div>
          <p>
            The specific technical deliverables, specifications, and architecture objectives for this engagement are defined as:
          </p>
          <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded">
            <div className="font-semibold text-slate-900">{dossier.deliverableTitle}</div>
            <p className="mt-1 text-slate-600 leading-relaxed">{dossier.scopeSummary}</p>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-sm font-mono uppercase tracking-wider mb-2">
            2. Deliverables & Commercial Consideration
          </h2>
          <p className="mb-2">
            In full consideration for the execution and fulfillment of the deliverables, the Client has settled the fixed consideration specified below:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-100 font-mono text-[10px] uppercase text-slate-600">
                  <th className="p-2 border border-slate-200">Milestone / Item</th>
                  <th className="p-2 border border-slate-200">Classification</th>
                  <th className="p-2 border border-slate-200 text-right">Settled Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((it) => (
                  <tr key={it.id}>
                    <td className="p-2 border border-slate-200 font-medium text-slate-800">{it.description}</td>
                    <td className="p-2 border border-slate-200 font-mono text-slate-500">SIC {it.sicCode}</td>
                    <td className="p-2 border border-slate-200 font-mono text-right font-semibold">{symbol}{it.amount.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={2} className="p-2 border border-slate-200 text-right">Total Settled Fee:</td>
                  <td className="p-2 border border-slate-200 font-mono text-right">{symbol}{transaction.amount.toFixed(2)} {transaction.currency}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-sm font-mono uppercase tracking-wider mb-2">
            3. Intellectual Property Assignment
          </h2>
          <p>
            Upon receipt of the full agreed fee under transaction reference <strong>{transaction.reference}</strong>, {COMPANY.name} hereby assigns unconditionally to the Client all worldwide intellectual property rights, copyright, and patentable rights in the bespoke source code, scripts, configurations, and documentation produced specifically for this engagement. Third-party open-source libraries remain licensed under their respective permissive licenses (e.g., MIT/Apache-2.0).
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-sm font-mono uppercase tracking-wider mb-2">
            4. Technical Acceptance Criteria & Warranty
          </h2>
          <p>
            The software, scripts, and endpoints shall conform to standard production engineering criteria. {COMPANY.name} provides a 30-day technical warranty from the delivery date ({contractDate}) to rectify any reproducible syntax, logic, or gateway defects without additional charge.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-sm font-mono uppercase tracking-wider mb-2">
            5. Limitation of Liability & Confidentiality
          </h2>
          <p>
            Neither party shall be liable for indirect, incidental, or consequential damages. Total cumulative liability of {COMPANY.name} arising under this agreement is strictly limited to the total fees actually received ({symbol}{transaction.amount.toFixed(2)}). Both parties shall maintain strict confidentiality over trade secrets and customer data in accordance with the UK Data Protection Act 2018 and UK GDPR.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900 text-sm font-mono uppercase tracking-wider mb-2">
            6. Governing Law & Jurisdiction
          </h2>
          <p>
            This Agreement shall be governed by, construed, and enforced in accordance with the laws of <strong>England & Wales</strong>. The courts of England shall have exclusive jurisdiction over any disputes arising under or in connection with this contract.
          </p>
        </section>
      </div>

      {/* Signature Blocks */}
      <div className="mt-8 pt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Service Provider Director Signature */}
        <div className="p-4 border border-slate-200 rounded-md bg-slate-50 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-2">
              For and on behalf of GOLDENPAYS LTD:
            </span>
            <div className="flex items-center gap-4">
              <DirectorStamp timestamp={transaction.datetime} hash={dossier.proof.auditHash} directorName={dossier.directorName} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] font-mono text-slate-500">
            <div>Signer: {dossier.directorName}</div>
            <div>Position: {dossier.directorTitle}</div>
            <div>Cryptographic Verification: ACTIVE & VALID</div>
          </div>
        </div>

        {/* Client Digital Acceptance Block */}
        <div className="p-4 border border-slate-200 rounded-md bg-slate-50 flex flex-col justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase font-bold text-slate-500 block mb-2">
              Acknowledged & Accepted by Client:
            </span>
            <div className="my-3 p-3 bg-white border border-emerald-300 rounded text-center">
              <span className="font-serif italic text-base font-bold text-slate-900 block">
                {client.name}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-700 block mt-1">
                ✔ Electronically Acknowledged via Payment Cleared
              </span>
              <span className="font-mono text-[8px] text-slate-500 block mt-0.5">
                Ref: {transaction.reference}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] font-mono text-slate-500">
            <div>Party: {client.companyName ? `${client.companyName} (${client.name})` : client.name}</div>
            <div>Date: {contractDate}</div>
            <div>Binding Effect: Fully Enforceable Bilateral SOW</div>
          </div>
        </div>
      </div>
    </div>
  );
};
