import React from 'react';
import { Link } from 'react-router-dom';

const ProfessionalDisclaimer: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="font-serif text-4xl text-navy mb-4">Professional Disclaimer</h1>
          <p className="text-sm text-slate-500">Last Updated: 4th February 2026</p>
          <p className="text-sm text-slate-600 mt-2">
            GOLDENPAYS LTD | Company Number: 16227513 | Registered in England and Wales
          </p>
        </div>

        {/* Critical Banking Notice */}
        <div className="mb-8 p-6 bg-amber-50 border-l-4 border-amber-500">
          <h3 className="font-bold text-amber-900 mb-2">⚠️ IMPORTANT BANKING AND REGULATORY NOTICE</h3>
          <p className="text-sm text-amber-800 leading-relaxed">
            This disclaimer is provided to ensure full transparency for banking institutions (including WorldFirst, Sokin, and other financial service providers), HMRC, and regulatory authorities regarding the precise nature and scope of services provided by GOLDENPAYS LTD.
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">1. Nature of Business Operations</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              GOLDENPAYS LTD is a <strong>management and information technology consultancy</strong> registered in England and Wales under company number 16227513. Our registered office is located at Office 12 Initial Business Centre, Wilson Business Park, Manchester, UK, M40 8WN.
            </p>
            <p className="text-slate-700 leading-relaxed">
              We provide strategic advisory services in the fields of IT infrastructure, cloud architecture, operational efficiency, and business management. Our services are exclusively consultative and technical in nature.
            </p>
          </section>

          {/* Section 2 - FCA Disclaimer */}
          <section className="bg-blue-50 border border-blue-200 p-6 rounded">
            <h2 className="text-2xl font-serif text-navy mb-4">2. Financial Services Disclaimer (FCA)</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>GOLDENPAYS LTD is NOT authorised or regulated by the Financial Conduct Authority (FCA).</strong>
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              We do <strong>NOT</strong> provide:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
              <li>Regulated financial advice or investment services</li>
              <li>Insurance brokerage or underwriting</li>
              <li>Consumer credit or lending services</li>
              <li>Payment services or electronic money issuance</li>
              <li>Cryptocurrency trading or investment advice</li>
              <li>Portfolio management or wealth advisory services</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Any references to "financial management" within our service descriptions relate exclusively to <strong>non-regulated business operational efficiency, fiscal compliance readiness (e.g., HMRC reporting structures), and resource allocation optimisation</strong> — activities that do not constitute regulated financial advice under the Financial Services and Markets Act 2000 (FSMA).
            </p>
          </section>

          {/* Section 3 - Tax & Legal Disclaimer */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">3. Tax and Legal Advisory Disclaimer</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>GOLDENPAYS LTD does NOT provide tax legal advice or regulated tax consultancy services.</strong>
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              While we may assist clients with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
              <li>Operational compliance readiness for HMRC reporting</li>
              <li>Structuring business workflows to align with statutory obligations</li>
              <li>Advising on record-keeping best practices for tax purposes</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>We do NOT:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
              <li>Prepare or submit tax returns on behalf of clients</li>
              <li>Provide formal tax planning or avoidance strategies</li>
              <li>Offer legal representation in tax disputes or HMRC investigations</li>
              <li>Act as registered tax agents or advisors under HMRC regulations</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              Clients are advised to seek independent professional advice from qualified chartered accountants, tax advisors, or solicitors for all tax and legal matters.
            </p>
          </section>

          {/* Section 4 - Payment Cards Disclaimer */}
          <section className="bg-red-50 border border-red-200 p-6 rounded">
            <h2 className="text-2xl font-serif text-navy mb-4">4. Payment Card and Financial Technology Disclaimer</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              <strong>GOLDENPAYS LTD does NOT issue payment cards, prepaid cards, or any form of electronic money instruments.</strong>
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              We are <strong>NOT</strong> a payment service provider (PSP), payment institution, or electronic money institution (EMI) under the Payment Services Regulations 2017 or the Electronic Money Regulations 2011.
            </p>
            <p className="text-slate-700 leading-relaxed mb-4">
              Our technical consulting services in the fintech domain are strictly limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
              <li><strong>API Integration Consultancy:</strong> Advising on the technical implementation of third-party payment gateway APIs (e.g., Stripe, PayPal, banking APIs).</li>
              <li><strong>Infrastructure Architecture:</strong> Designing secure IT infrastructure for clients who operate payment systems (not operating such systems ourselves).</li>
              <li><strong>Compliance Advisory:</strong> Providing guidance on PCI-DSS standards, data encryption protocols, and secure transaction workflows.</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              <strong>We do NOT:</strong> process payments, hold client funds, issue cards, or act as a merchant acquirer. All payment processing is conducted by authorised third-party institutions with whom our clients contract independently.
            </p>
          </section>

          {/* Section 5 - Scope of IT Services */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">5. Scope of Information Technology Services</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Our IT consultancy services include, but are not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
              <li>Cloud infrastructure design and migration (AWS, Azure, Google Cloud)</li>
              <li>Security auditing and penetration testing coordination</li>
              <li>Disaster recovery and business continuity planning</li>
              <li>Legacy system modernisation and technical debt reduction</li>
              <li>API architecture and integration strategy</li>
              <li>DevOps workflow optimisation and CI/CD pipeline design</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              All services are delivered on a consultative basis. We do not provide managed IT services, 24/7 infrastructure monitoring, or break-fix support unless explicitly agreed in a Statement of Work (SOW).
            </p>
          </section>

          {/* Section 6 - Client Responsibility */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">6. Client Responsibility and Independent Verification</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Clients are solely responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
              <li>Ensuring that any advice or recommendations provided by GOLDENPAYS LTD are appropriate for their specific circumstances.</li>
              <li>Seeking independent professional advice from qualified financial advisors, legal counsel, or tax specialists before making business decisions.</li>
              <li>Verifying compliance with all applicable laws, regulations, and industry standards relevant to their operations.</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              GOLDENPAYS LTD assumes no liability for client decisions made in reliance on our consultancy services without independent verification.
            </p>
          </section>

          {/* Section 7 - Limitation of Warranties */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">7. Limitation of Warranties</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              While we strive to provide accurate, up-to-date, and reliable advice, <strong>all services are provided on an "as is" basis without warranties of any kind, whether express or implied.</strong>
            </p>
            <p className="text-slate-700 leading-relaxed">
              We do not warrant that our advice will result in specific business outcomes, regulatory approval, or financial gains. Technology recommendations are subject to rapid industry evolution and may require updates or revisions.
            </p>
          </section>

          {/* Section 8 - Third-Party Services */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">8. Third-Party Services and Referrals</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Where we refer clients to third-party service providers (e.g., cloud hosting providers, payment processors, legal firms), such referrals are made in good faith based on our professional assessment.
            </p>
            <p className="text-slate-700 leading-relaxed">
              <strong>GOLDENPAYS LTD is not liable for the performance, conduct, or failures of any third-party service providers.</strong> Clients contract independently with such providers and are responsible for conducting their own due diligence.
            </p>
          </section>

          {/* Section 9 - Regulatory Compliance Statement */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">9. Regulatory Compliance and Transparency Statement</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              GOLDENPAYS LTD operates in full compliance with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
              <li>UK Companies Act 2006</li>
              <li>UK GDPR and Data Protection Act 2018</li>
              <li>Anti-Money Laundering Regulations (MLR 2017)</li>
              <li>HMRC tax and accounting requirements</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              We maintain full transparency with banking partners, including WorldFirst, Sokin, and traditional financial institutions, regarding the nature of our services, client base, and transaction flows.
            </p>
          </section>

          {/* Section 10 - Banking Institution Notice */}
          <section className="bg-green-50 border border-green-200 p-6 rounded">
            <h2 className="text-2xl font-serif text-navy mb-4">10. Notice to Banking Institutions and Payment Service Providers</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              This disclaimer is provided to ensure full clarity for our banking partners (WorldFirst, Sokin, and others) regarding our business model:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-4">
              <li><strong>Business Activity:</strong> IT and management consultancy (non-regulated)</li>
              <li><strong>Revenue Model:</strong> Professional services fees for consultancy and advisory work</li>
              <li><strong>Transaction Nature:</strong> Incoming payments from B2B clients for consultancy services; outgoing payments for business expenses (software subscriptions, subcontractors, operational costs)</li>
              <li><strong>No Financial Services:</strong> We do NOT handle client funds, issue cards, or provide payment processing</li>
              <li><strong>KYC/AML Compliance:</strong> We conduct mandatory due diligence on all clients and maintain comprehensive transaction records</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              For verification purposes, banking institutions may request additional documentation, including client contracts (anonymised), invoices, and SOWs. We commit to full cooperation with all regulatory and compliance inquiries.
            </p>
          </section>

          {/* Contact */}
          <section className="mt-12 p-6 bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-navy mb-3">Regulatory and Compliance Inquiries</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              For regulatory verification, compliance inquiries, or clarification requests from banking institutions, HMRC, or authorised agencies, please contact:
              <br /><br />
              <strong>GOLDENPAYS LTD</strong><br />
              Compliance Officer: As designated by the Board of Directors<br />
              Email: compliance@goldenpays.uk<br />
              Address: Office 12 Initial Business Centre, Wilson Business Park, Manchester, UK, M40 8WN<br />
              <br />
              We respond to all verified regulatory inquiries within 48 hours.
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

export default ProfessionalDisclaimer;
