import React from 'react';
import { COMPANY } from '../../data/site';
import LegalLayout, { LegalSection } from './LegalLayout';

const sections: LegalSection[] = [
  {
    title: 'Your statutory cancellation right (consumers)',
    body: (
      <>
        <p>If you buy as a consumer, the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 give you 14 days from the date of the contract to cancel without giving a reason.</p>
        <p>Business customers do not have this statutory right; the commercial terms below apply instead.</p>
      </>
    ),
  },
  {
    title: 'Digital products and licences',
    body: (
      <>
        <p>For software delivered digitally (licence keys, downloads, instant platform access), we start supply immediately after checkout only with your express consent and your acknowledgement that you will lose the right to cancel once supply has begun.</p>
        <p>If the software is faulty or not as described, you remain entitled to a repair, replacement or refund under the Consumer Rights Act 2015.</p>
      </>
    ),
  },
  {
    title: 'Subscriptions',
    body: <p>You can cancel a monthly subscription at any time. Cancellation takes effect at the end of the current billing period and you keep access until then. We do not refund partial months, except where required by law.</p>,
  },
  {
    title: 'Development sprints and integrations',
    body: (
      <ul>
        <li>Cancel more than 5 business days before the scheduled start: full refund of any deposit.</li>
        <li>Cancel within 5 business days of the start: the deposit is retained to cover reserved capacity.</li>
        <li>Cancel after work has started: you pay for work performed to the cancellation date; any amount paid beyond that is refunded.</li>
        <li>If you are a consumer and asked us to start within the 14-day cancellation period, you may still cancel within that period but must pay for the service supplied up to cancellation.</li>
      </ul>
    ),
  },
  {
    title: 'Cloud hosting retainers',
    body: <p>Retainers can be cancelled with 30 days' written notice. Before services end we will provide an export of your data and configuration on request.</p>,
  },
  {
    title: 'How to cancel or request a refund',
    body: (
      <>
        <p>Email <a href={`mailto:${COMPANY.email}`} className="text-accent-dark underline">{COMPANY.email}</a> with your order or invoice reference. We acknowledge requests within 2 business days.</p>
        <p>Approved refunds are made to the original payment method within 14 days of approval.</p>
      </>
    ),
  },
];

const RefundPolicy: React.FC = () => (
  <LegalLayout
    title="Refund & Cancellation Policy"
    updated="1 November 2026"
    intro="How cancellations and refunds work for digital products, subscriptions and technical services."
    sections={sections}
  />
);

export default RefundPolicy;
