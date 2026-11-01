import React from 'react';
import { COMPANY } from '../../data/site';
import LegalLayout, { LegalSection } from './LegalLayout';

const sections: LegalSection[] = [
  {
    title: 'Who we are',
    body: <p>{COMPANY.name} (Company No. {COMPANY.number}) is the data controller for personal data collected through this website and in providing our services. Contact: <a href={`mailto:${COMPANY.email}`} className="text-accent-dark underline">{COMPANY.email}</a>.</p>,
  },
  {
    title: 'Data we collect',
    body: (
      <ul>
        <li><strong>Enquiries:</strong> name, company, email address and the details you include in your message.</li>
        <li><strong>Purchases:</strong> name, billing email and address, and transaction records. Card details are collected and processed by Stripe and never reach our servers.</li>
        <li><strong>Client projects:</strong> contact details of client staff and any information needed to deliver the work.</li>
        <li><strong>Website usage:</strong> if you accept analytics cookies, anonymised usage statistics via Google Analytics.</li>
      </ul>
    ),
  },
  {
    title: 'Why we use it and our lawful basis',
    body: (
      <ul>
        <li>Responding to enquiries and delivering services: <em>contract</em> or steps prior to a contract.</li>
        <li>Invoicing, accounting and tax records: <em>legal obligation</em>.</li>
        <li>Fraud prevention and service security: <em>legitimate interests</em>.</li>
        <li>Analytics cookies: <em>consent</em>, which you can withdraw at any time.</li>
      </ul>
    ),
  },
  {
    title: 'Who we share it with',
    body: (
      <>
        <p>We use trusted processors only as needed to run our business: Stripe (payments), Resend (transactional email), Supabase and our cloud hosting providers (data storage and hosting), and Google (analytics, only with consent).</p>
        <p>We do not sell personal data. We may disclose data where required by law or to a regulator.</p>
      </>
    ),
  },
  {
    title: 'International transfers',
    body: <p>Some processors store data outside the UK. Where they do, transfers are protected by UK adequacy regulations or the International Data Transfer Agreement / Addendum.</p>,
  },
  {
    title: 'Verification Portal',
    body: <p>Records on the Verification Portal contain no personal data. Client identities are replaced with a sanitized classification and are published only with the client's consent.</p>,
  },
  {
    title: 'How long we keep it',
    body: <p>Enquiries that do not lead to an engagement are deleted after 12 months. Client and transaction records are kept for 6 years after the end of the financial year they relate to, as required for UK accounting purposes.</p>,
  },
  {
    title: 'Your rights',
    body: (
      <>
        <p>Under UK GDPR you have the right to access, correct, erase, restrict or object to processing of your data, and to data portability. To exercise them, email us; we respond within one month.</p>
        <p>You can also complain to the Information Commissioner's Office (ico.org.uk, 0303 123 1113).</p>
      </>
    ),
  },
  {
    title: 'Cookies',
    body: <p>We use strictly necessary browser storage to remember your cookie choice. Analytics cookies are set only if you accept them in the cookie banner.</p>,
  },
];

const PrivacyPolicy: React.FC = () => (
  <LegalLayout
    title="Privacy Policy"
    updated="1 November 2026"
    intro="How GOLDENPAYS LTD collects and uses personal data, in line with UK GDPR and the Data Protection Act 2018."
    sections={sections}
  />
);

export default PrivacyPolicy;
