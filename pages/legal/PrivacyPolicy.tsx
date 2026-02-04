import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="font-serif text-4xl text-navy mb-4">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last Updated: 4th February 2026</p>
          <p className="text-sm text-slate-600 mt-2">
            GOLDENPAYS LTD | Company Number: 16227513 | Registered in England and Wales
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">1. Introduction</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              GOLDENPAYS LTD ("we", "us", "our") is committed to protecting and respecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data in compliance with the <strong>UK General Data Protection Regulation (UK GDPR)</strong> and the <strong>Data Protection Act 2018.</strong>
            </p>
            <p className="text-slate-700 leading-relaxed">
              This policy applies to all personal data processed by GOLDENPAYS LTD in the course of our business operations, including data collected through our website, client inquiries, and contractual engagements.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">2. Data Controller</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              For the purposes of UK GDPR, the Data Controller is:
            </p>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded">
              <p className="text-slate-700 leading-relaxed">
                <strong>GOLDENPAYS LTD</strong><br />
                Company Number: 16227513<br />
                Registered Office: Office 12 Initial Business Centre, Wilson Business Park, Manchester, UK, M40 8WN<br />
                Email: privacy@goldenpays.uk<br />
                <br />
                <strong>Director and Data Protection Officer:</strong> As designated by the Board of Directors
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">3. Personal Data We Collect</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We collect and process the following categories of personal data:
            </p>
            
            <h3 className="text-lg font-bold text-navy mb-3">3.1. Information You Provide to Us</h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 mb-6">
              <li><strong>Contact Details:</strong> Name, company name, email address, telephone number, and business address.</li>
              <li><strong>Inquiry Data:</strong> Information submitted through our contact forms, including the nature of your inquiry and service requirements.</li>
              <li><strong>Contractual Data:</strong> Information necessary for the execution and performance of our consultancy services, including project specifications, technical requirements, and payment details.</li>
              <li><strong>Communication Records:</strong> Correspondence via email, telephone, or other communication channels.</li>
            </ul>

            <h3 className="text-lg font-bold text-navy mb-3">3.2. Information We Collect Automatically</h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Technical Data:</strong> IP address, browser type, operating system, and device information.</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on our website, and referral sources (via analytics tools).</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">4. Lawful Basis for Processing</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We process your personal data under the following lawful bases as defined by UK GDPR:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Contractual Necessity:</strong> To perform our obligations under a contract with you or to take steps at your request before entering into a contract.</li>
              <li><strong>Legitimate Interests:</strong> To conduct our business operations, including responding to inquiries, improving our services, and ensuring the security of our systems.</li>
              <li><strong>Legal Obligation:</strong> To comply with statutory requirements, including tax obligations (HMRC), anti-money laundering regulations (AML), and financial reporting standards.</li>
              <li><strong>Consent:</strong> Where you have provided explicit consent for specific processing activities (e.g., marketing communications).</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">5. How We Use Your Personal Data</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We use your personal data for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>To respond to your inquiries and assess suitability for our services.</li>
              <li>To execute and deliver consultancy services as outlined in the Statement of Work (SOW).</li>
              <li>To process invoices, payments, and maintain financial records for tax and accounting purposes.</li>
              <li>To comply with legal and regulatory obligations, including Know Your Customer (KYC) and Anti-Money Laundering (AML) requirements.</li>
              <li>To improve our website, services, and client experience through analytics and feedback.</li>
              <li>To communicate updates, service notifications, or respond to support requests.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">6. Data Sharing and Disclosure</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We do not sell, rent, or trade your personal data to third parties. We may share your data in the following limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Service Providers:</strong> Trusted third-party providers who assist us with IT infrastructure, payment processing, and professional services (e.g., accountants, legal advisors) under strict confidentiality agreements.</li>
              <li><strong>Regulatory Authorities:</strong> HMRC, Companies House, financial institutions (e.g., WorldFirst, Sokin), and AML compliance bodies, where legally required.</li>
              <li><strong>Legal Obligations:</strong> To comply with court orders, legal proceedings, or governmental requests.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred to the acquiring entity, subject to equivalent data protection standards.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">7. International Data Transfers</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We primarily process data within the United Kingdom. Where data is transferred to third countries, we ensure compliance with UK GDPR through:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Adequacy decisions recognised by the UK government.</li>
              <li>Standard Contractual Clauses (SCCs) approved by the UK Information Commissioner's Office (ICO).</li>
              <li>Binding Corporate Rules or other lawful transfer mechanisms.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">8. Data Retention</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We retain your personal data only for as long as necessary to fulfil the purposes outlined in this policy, unless a longer retention period is required or permitted by law.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Inquiry Data:</strong> Retained for 2 years from the date of inquiry, unless converted to a client relationship.</li>
              <li><strong>Client and Contractual Data:</strong> Retained for 7 years from the conclusion of the engagement, in compliance with UK tax and accounting regulations.</li>
              <li><strong>Financial Records:</strong> Retained for 7 years as required by HMRC and Companies Act 2006.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">9. Your Data Protection Rights</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Under UK GDPR, you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
              <li><strong>Right to Erasure:</strong> Request deletion of your data (subject to legal retention obligations).</li>
              <li><strong>Right to Restrict Processing:</strong> Request limitation of processing in certain circumstances.</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a structured, commonly used format.</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing.</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent.</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">
              To exercise any of these rights, please contact us at <strong>privacy@goldenpays.uk</strong>. We will respond to your request within 30 days.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">10. Data Security</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, or misuse, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Encryption of data in transit and at rest (AES-256).</li>
              <li>Access controls and authentication protocols for internal systems.</li>
              <li>Regular security audits and penetration testing.</li>
              <li>Employee training on data protection and confidentiality obligations.</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">11. Cookies and Tracking Technologies</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Our website may use cookies and similar technologies to enhance user experience and analyse website traffic. You can manage cookie preferences through your browser settings. For more information, please refer to our separate Cookie Policy (if applicable).
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-slate-700 leading-relaxed">
              We reserve the right to update this Privacy Policy at any time to reflect changes in our practices or legal requirements. Updated policies will be published on our website with a revised "Last Updated" date. Continued use of our services constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-2xl font-serif text-navy mb-4">13. Complaints and Regulatory Authority</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              If you are not satisfied with how we handle your personal data, you have the right to lodge a complaint with the UK Information Commissioner's Office (ICO):
            </p>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded">
              <p className="text-slate-700 leading-relaxed">
                <strong>Information Commissioner's Office (ICO)</strong><br />
                Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF<br />
                Telephone: 0303 123 1113<br />
                Website: <a href="https://ico.org.uk" className="text-gold hover:underline" target="_blank" rel="noopener noreferrer">https://ico.org.uk</a>
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="mt-12 p-6 bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-navy mb-3">Contact Us</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              If you have any questions or concerns regarding this Privacy Policy or our data processing practices, please contact us at:
              <br /><br />
              <strong>GOLDENPAYS LTD</strong><br />
              Email: privacy@goldenpays.uk<br />
              Address: Office 12 Initial Business Centre, Wilson Business Park, Manchester, UK, M40 8WN
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

export default PrivacyPolicy;
