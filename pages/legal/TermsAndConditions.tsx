import React from 'react';
import { Link } from 'react-router-dom';
import LegalLayout, { LegalSection } from './LegalLayout';

const sections: LegalSection[] = [
  {
    title: 'About these terms',
    body: (
      <>
        <p>These Terms of Service govern the purchase and use of software, digital products and technical services supplied by GOLDENPAYS LTD ("we", "us"), a company registered in England & Wales (No. 16227513).</p>
        <p>By purchasing a product, booking a service or using our software you agree to these terms. If you are buying on behalf of a business, you confirm you are authorised to bind that business.</p>
      </>
    ),
  },
  {
    title: 'What we supply',
    body: (
      <ul>
        <li><strong>Software licences and digital tooling</strong>: subscriptions and perpetual licences for software we publish.</li>
        <li><strong>Development sprints</strong>: time-boxed development of software to an agreed scope.</li>
        <li><strong>Systems and API integration</strong>: fixed-scope integration work.</li>
        <li><strong>Cloud infrastructure and data hosting</strong>: provisioning and ongoing management under a monthly retainer.</li>
      </ul>
    ),
  },
  {
    title: 'Orders, scope and acceptance',
    body: (
      <>
        <p>A contract is formed when we confirm your order or booking in writing (including by email). For sprints and integrations, the agreed scope is the written scope we confirm before work starts; changes to scope may change the price or timeline and require your agreement.</p>
        <p>On completion we will ask you to review the deliverable. Acceptance occurs when you confirm in writing, or 10 business days after delivery if you have not reported a material defect. Accepted deliveries receive a reference (GPY-YYYY-XXXX) and, only with your consent, may be published in sanitized form on our <Link to="/verify" className="text-accent-dark underline">Verification Portal</Link>.</p>
      </>
    ),
  },
  {
    title: 'Prices and payment',
    body: (
      <>
        <p>Prices are shown in pounds sterling. GOLDENPAYS LTD is not currently registered for VAT, so no VAT is charged. Online payments are processed by Stripe; we do not store your card details.</p>
        <p>Subscriptions and retainers are billed in advance each month until cancelled. Packages are paid in full at checkout. Custom engagements are invoiced, and invoices are payable within 14 days unless otherwise agreed.</p>
      </>
    ),
  },
  {
    title: 'Cancellations and refunds',
    body: <p>Your cancellation and refund rights are set out in our <Link to="/legal/refunds" className="text-accent-dark underline">Refund & Cancellation Policy</Link>, which forms part of these terms.</p>,
  },
  {
    title: 'Licences and intellectual property',
    body: (
      <>
        <p><strong>Published software:</strong> we grant you a non-exclusive, non-transferable licence to use the software for your internal business purposes, for the term of your subscription or, for perpetual licences, indefinitely. You may not resell, sublicense or redistribute it.</p>
        <p><strong>Bespoke work:</strong> on full payment, ownership of code written specifically for you transfers to you. We retain ownership of our pre-existing tools, libraries and know-how, and grant you a perpetual licence to use any of them included in your deliverable.</p>
      </>
    ),
  },
  {
    title: 'Your responsibilities',
    body: (
      <ul>
        <li>Provide timely access to the systems, accounts and information we need.</li>
        <li>Ensure you have the right to share any data or third-party credentials with us.</li>
        <li>Keep your licence keys and account credentials secure.</li>
      </ul>
    ),
  },
  {
    title: 'Hosting and availability',
    body: <p>For hosting retainers we use reasonable care and skill to keep services available and backed up in line with the agreed backup policy. Services rely on third-party cloud providers, and we are not responsible for outages caused by those providers or events outside our reasonable control.</p>,
  },
  {
    title: 'Confidentiality and data protection',
    body: <p>Each party will keep the other's confidential information confidential. Where we process personal data on your behalf, we do so as a processor under your instructions and in accordance with UK GDPR. See our <Link to="/legal/privacy" className="text-accent-dark underline">Privacy Policy</Link>.</p>,
  },
  {
    title: 'Liability',
    body: (
      <>
        <p>Nothing in these terms limits liability for death or personal injury caused by negligence, fraud, or any liability that cannot be limited by law. If you are a consumer, nothing in these terms affects your statutory rights.</p>
        <p>For business customers, our total liability under any contract is limited to the amount you paid us under that contract in the 12 months before the claim, and we are not liable for indirect or consequential loss, or loss of profit, revenue or data.</p>
      </>
    ),
  },
  {
    title: 'Termination',
    body: <p>Either party may terminate a contract if the other materially breaches it and does not remedy the breach within 14 days of written notice. On termination you pay for work performed up to the termination date.</p>,
  },
  {
    title: 'Governing law',
    body: <p>These terms are governed by the law of England and Wales, and the courts of England and Wales have jurisdiction. Consumers resident elsewhere in the UK may also bring proceedings in their local courts.</p>,
  },
];

const TermsAndConditions: React.FC = () => (
  <LegalLayout
    title="Terms of Service"
    updated="1 November 2026"
    intro="Terms for software licences, digital products and technical services supplied by GOLDENPAYS LTD."
    sections={sections}
  />
);

export default TermsAndConditions;
