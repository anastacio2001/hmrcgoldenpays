// Single source of truth for company facts, SIC codes and productized offerings.

export const COMPANY = {
  name: 'GOLDENPAYS LTD',
  number: '16227513',
  jurisdiction: 'Registered in England & Wales',
  office: 'Office 12 Initial Business Centre, Wilson Business Park, Manchester, UK, M40 8WN',
  officeLines: ['Office 12 Initial Business Centre', 'Wilson Business Park', 'Manchester, UK, M40 8WN'],
  email: 'enquiries@goldenpays.uk',
  director: 'Ladislau S. Anastácio',
  directorTitle: 'Founder & Managing Director',
  companiesHouseUrl: 'https://find-and-update.company-information.service.gov.uk/company/16227513',
  bank: {
    accountName: 'GOLDENPAYS LTD',
    accountNumber: '01164345',
    sortCode: '04-19-19',
    sortCodeRaw: '041919',
    iban: 'GB71TAPD04191901164345',
    swiftBic: 'CLRBGB22',
    currency: 'GBP',
  },
};

export const SIC_CODES = [
  { code: '58290', label: 'Other software publishing', area: 'SaaS & Proprietary Platforms' },
  { code: '62012', label: 'Business and domestic software development', area: 'Bespoke Software & Full-Stack Apps' },
  { code: '62020', label: 'Information technology consultancy activities', area: 'Architecture & Systems Integration' },
  { code: '63110', label: 'Data processing, hosting and related activities', area: 'Cloud Infrastructure & Database Pipelines' },
] as const;

export type SicCode = (typeof SIC_CODES)[number]['code'];

export interface Offering {
  id: 'licence' | 'sprint' | 'integration' | 'cloud';
  sic: SicCode;
  title: string;
  description: string;
  price: string;
  priceNote: string;
  includes: string[];
  cta: string;
  /** Stripe Payment Link; when unset, the CTA falls back to the contact form. */
  checkoutUrl?: string;
}

export const OFFERINGS: Offering[] = [
  {
    id: 'licence',
    sic: '58290',
    title: 'Platform Licences & Digital Tooling',
    description: 'Proprietary automation scripts, multi-tenant workflow engines and SaaS platform seats, delivered as licensed software.',
    price: '£49',
    priceNote: '/ month · or £199 perpetual licence',
    includes: ['Instant licence key delivery', 'Hosted or self-hosted deployment', 'Version updates during subscription', 'Email support'],
    cta: 'Deploy Licence / Instant Access',
    checkoutUrl: import.meta.env.VITE_STRIPE_LINK_LICENCE,
  },
  {
    id: 'sprint',
    sic: '62012',
    title: 'Full-Stack Development Sprints',
    description: 'Fast-track development of web applications, client portals, custom REST/GraphQL APIs and internal dashboards.',
    price: 'From £750',
    priceNote: '5-day sprint',
    includes: ['Scoping call and written sprint plan', 'Daily progress updates', 'Source code in your repository', 'Deployment to your environment'],
    cta: 'Book Sprint',
    checkoutUrl: import.meta.env.VITE_STRIPE_LINK_SPRINT,
  },
  {
    id: 'integration',
    sic: '62020',
    title: 'Technical Systems & API Integration',
    description: 'End-to-end integration of CRM systems, custom webhooks, payment gateway pipelines and third-party enterprise tools.',
    price: '£450',
    priceNote: 'fixed-scope delivery',
    includes: ['Integration architecture review', 'Webhook and API implementation', 'Error handling and retry logic', 'Handover documentation'],
    cta: 'Initiate Integration',
    checkoutUrl: import.meta.env.VITE_STRIPE_LINK_INTEGRATION,
  },
  {
    id: 'cloud',
    sic: '63110',
    title: 'Cloud Infrastructure & Data Hosting',
    description: 'Dedicated PostgreSQL/Supabase database setup, cloud hosting provisioning, automated backup policies and uptime monitoring.',
    price: 'From £150',
    priceNote: '/ month retainer',
    includes: ['Database provisioning and hardening', 'Automated backup policy', 'Uptime monitoring and alerts', 'Monthly infrastructure report'],
    cta: 'Configure Cloud Environment',
    checkoutUrl: import.meta.env.VITE_STRIPE_LINK_CLOUD,
  },
];

/** Stripe Payment Link for the one-off perpetual licence (the licence offering above is the monthly plan). */
export const PERPETUAL_LICENCE_CHECKOUT_URL: string | undefined = import.meta.env.VITE_STRIPE_LINK_LICENCE_PERPETUAL;

/** Where an offering's CTA should send the visitor. */
export const offeringHref = (offering: Offering) =>
  offering.checkoutUrl || `/contact?package=${offering.id}`;
