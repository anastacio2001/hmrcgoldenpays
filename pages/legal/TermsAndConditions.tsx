import React from 'react';
import { Link } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="font-serif text-4xl text-navy mb-4">Terms and Conditions</h1>
          <p className="text-sm text-slate-500">Last Updated: 4th February 2026</p>
          <p className="text-sm text-slate-600 mt-2">
            GOLDENPAYS LTD | Company Number: 16227513 | Registered in England and Wales
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">1. Introduction and Acceptance</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              These Terms and Conditions ("Terms") constitute a legally binding agreement between GOLDENPAYS LTD ("Company", "we", "us", or "our"), a private limited company incorporated in England and Wales under company number 16227513, and the Client ("you" or "Client") for the provision of management consultancy and information technology advisory services.
            </p>
            <p className="text-slate-700 leading-relaxed">
              By engaging our services, submitting a formal inquiry, or executing a Statement of Work (SOW), you acknowledge that you have read, understood, and agree to be bound by these Terms in their entirety.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">2. Scope of Services</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              GOLDENPAYS LTD provides the following non-regulated professional services:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Enterprise IT Advisory (B2B):</strong> Strategic consultancy for cloud architecture, infrastructure modernisation, security auditing, and disaster recovery planning.</li>
              <li><strong>Professional Services (B2C/Sole Traders):</strong> Bespoke technical support, management mentorship, operational efficiency guidance, and fiscal compliance readiness (non-regulated).</li>
              <li><strong>Operational Excellence:</strong> Resource allocation audits, workflow automation, and cost-benefit analysis for research and development initiatives.</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">
              All services are delivered pursuant to a mutually executed Statement of Work (SOW) which shall form an integral part of these Terms.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">3. Client Engagement and Onboarding</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              3.1. All new clients are subject to a mandatory Know Your Customer (KYC) assessment and due diligence process in compliance with UK Anti-Money Laundering (AML) regulations.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              3.2. The Company reserves the absolute right to decline any engagement without providing justification.
            </p>
            <p className="text-slate-700 leading-relaxed">
              3.3. Services operate exclusively on a private referral and selective B2B outreach basis. Submission of an inquiry does not constitute a binding contract for services.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">4. Payment Terms and Conditions</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              4.1. <strong>Private Clients and Sole Traders:</strong> Payment terms are Net 0 (immediate payment upon invoice issuance). Services will not commence until full prepayment is received and cleared funds are confirmed.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              4.2. <strong>Corporate Clients (B2B):</strong> Payment terms are Net 15 or Net 30 from the invoice date, as specified in the executed SOW. Late payments shall incur interest at a rate of 8% per annum above the Bank of England base rate, in accordance with the Late Payment of Commercial Debts (Interest) Act 1998.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              4.3. All fees are quoted exclusive of Value Added Tax (VAT). VAT shall be applied at the prevailing UK statutory rate and is payable in addition to the stated fees.
            </p>
            <p className="text-slate-700 leading-relaxed">
              4.4. The Company accepts payment via bank transfer (BACS/CHAPS), corporate credit card, or other pre-approved payment methods. We do not issue payment cards or provide payment processing services.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">5. No-Refund Policy</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              5.1. Due to the bespoke nature of our consultancy services and the allocation of specialist resources, <strong>all fees are non-refundable once the Statement of Work (SOW) has been executed and work has commenced.</strong>
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              5.2. In the event of Client cancellation after commencement, the Client remains liable for the full contract value as stipulated in the SOW.
            </p>
            <p className="text-slate-700 leading-relaxed">
              5.3. The Company may, at its sole discretion, consider partial refunds in exceptional circumstances where services have demonstrably failed to meet the agreed scope, subject to written arbitration.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">6. Confidentiality and Non-Disclosure</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              6.1. All information exchanged between the Company and the Client shall be treated as strictly confidential and proprietary.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              6.2. The Company operates under a high-confidentiality framework for all consultancy engagements. Project documentation and deliverables are restricted to verified stakeholders and authorised compliance officers (e.g., HMRC, banking institutions, AML auditors).
            </p>
            <p className="text-slate-700 leading-relaxed">
              6.3. Both parties agree not to disclose confidential information to third parties without prior written consent, except where required by law or regulatory obligation.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">7. Limitation of Liability</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              7.1. The Company's total liability under these Terms, whether in contract, tort (including negligence), breach of statutory duty, or otherwise, shall not exceed the total fees paid by the Client for the specific engagement giving rise to the claim.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              7.2. The Company shall not be liable for any indirect, consequential, or incidental damages, including but not limited to loss of profits, revenue, data, or business opportunities.
            </p>
            <p className="text-slate-700 leading-relaxed">
              7.3. Nothing in these Terms shall exclude or limit liability for death or personal injury caused by negligence, fraud, or fraudulent misrepresentation.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">8. Intellectual Property Rights</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              8.1. All pre-existing intellectual property owned by the Company remains the exclusive property of GOLDENPAYS LTD.
            </p>
            <p className="text-slate-700 leading-relaxed">
              8.2. Deliverables created specifically for the Client under an executed SOW shall transfer to the Client upon full payment, subject to the Company retaining the right to use anonymised case studies for marketing purposes.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">9. Termination</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              9.1. Either party may terminate the engagement by providing 30 days' written notice, subject to settlement of all outstanding fees and completion of in-progress deliverables.
            </p>
            <p className="text-slate-700 leading-relaxed">
              9.2. The Company reserves the right to terminate the engagement immediately in cases of Client breach, non-payment, or fraudulent conduct.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">10. Governing Law and Jurisdiction</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              10.1. These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed in accordance with the <strong>laws of England and Wales.</strong>
            </p>
            <p className="text-slate-700 leading-relaxed">
              10.2. The parties irrevocably agree that the courts of England and Wales shall have exclusive jurisdiction to settle any dispute or claim arising out of or in connection with these Terms.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">11. Amendments</h2>
            <p className="text-slate-700 leading-relaxed">
              The Company reserves the right to amend these Terms at any time. Updated Terms shall be published on our website and shall take effect immediately upon publication. Continued use of our services constitutes acceptance of the amended Terms.
            </p>
          </section>

          {/* Contact */}
          <section className="mt-12 p-6 bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-navy mb-3">Contact Information</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              <strong>GOLDENPAYS LTD</strong><br />
              Company Number: 16227513<br />
              Registered Office: Office 12 Initial Business Centre, Wilson Business Park, Manchester, UK, M40 8WN<br />
              Email: enquiries@goldenpays.uk<br />
              <br />
              For legal inquiries: legal@goldenpays.uk
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link to="/" className="text-gold hover:underline text-sm font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
