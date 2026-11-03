import { SicCode } from './site';

export interface PublicProject {
  reference: string;
  title: string;
  category: string;
  sicCode: SicCode;
  clientClassification: string;
  jurisdiction: string;
  valueBadge: string;
  acceptedDate: string;
  gitRelease: string;
  fingerprint: string;
  tags: string[];
  description: string;
  architectureHighlights: string[];
  deliverableType: string;
}

export const SEED_PUBLIC_PROJECTS: PublicProject[] = [
  {
    reference: 'GPY-202610-8B39',
    title: 'Customer Self-Service Account Portal & Billing Webhook Integration',
    category: 'Bespoke Software & Full-Stack Apps',
    sicCode: '62012',
    clientClassification: 'Private Individual · Independent Consultant',
    jurisdiction: 'United Kingdom (Bristol)',
    valueBadge: '£500 · Tier B Engagement',
    acceptedDate: '2026-10-24',
    gitRelease: 'v2026.10.3',
    fingerprint: 'a89f310b7c29e18d6411aa5039df881c9b2f481023a104f9814cc5903b12ef90',
    tags: ['React 19', 'Stripe Billing', 'Supabase Auth', 'Tailwind CSS'],
    description: 'Custom client account portal developed for an independent consultant. Features authenticated session management, invoice history download, real-time subscription status via Stripe Webhooks, and automated PDF delivery.',
    architectureHighlights: [
      'Responsive client frontend with passwordless email magic link authentication',
      'Encrypted webhook receiver handling Stripe checkout.session.completed events',
      'Automated receipt dispatch and digital asset entitlement provisioned upon payment',
    ],
    deliverableType: 'Cloud Environment Initialized & Integration Pipeline Deployed',
  },
  {
    reference: 'GPY-202610-2F71',
    title: 'High-Throughput Order Ingestion Engine & REST Microservices',
    category: 'Bespoke Software & Full-Stack Apps',
    sicCode: '62012',
    clientClassification: 'Mid-Market Logistics Operator',
    jurisdiction: 'United Kingdom (London)',
    valueBadge: '£1,500 · Tier C Engagement',
    acceptedDate: '2026-10-18',
    gitRelease: 'v2026.10.1',
    fingerprint: '7cc194ba3501fef49912cd3104bc88a52994ef01824aa39921bdfa8019e34c21',
    tags: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'REST API'],
    description: 'Bespoke backend microservice architecture for automated delivery routing and third-party parcel tracking ingestion. Integrated with UK carrier APIs with end-to-end telemetry and automated retry queues.',
    architectureHighlights: [
      'Decoupled queue worker processing up to 250 webhook events per second',
      'PostgreSQL database cluster with automated schema migrations and read replicas',
      'Full CI/CD pipeline deployment to containerized staging and production clusters',
    ],
    deliverableType: 'Production Software Architecture Deployed & Live Acceptance Validated',
  },
  {
    reference: 'GPY-202609-91C4',
    title: 'Cloud Database Architecture, Security Hardening & Backup Automation',
    category: 'Cloud Infrastructure & Database Pipelines',
    sicCode: '63110',
    clientClassification: 'Fintech Analytics Operator',
    jurisdiction: 'Netherlands (Amsterdam)',
    valueBadge: '£450 · Tier B Engagement',
    acceptedDate: '2026-09-30',
    gitRelease: 'v2026.9.4',
    fingerprint: '3db88901cb00192e441278ff9921ca4901baef89021cdff91024ccaa8920bc31',
    tags: ['PostgreSQL', 'Row-Level Security', 'Automated Backups', 'TLS 1.3'],
    description: 'Provisioning and configuration of dedicated PostgreSQL database with comprehensive Row-Level Security (RLS) policies, immutable audit logging, automated daily WAL backups, and zero-downtime point-in-time recovery.',
    architectureHighlights: [
      'Hardened database schemas with strict foreign-key integrity and role-based permissions',
      'Automated daily backup lifecycle with encrypted off-site disaster recovery storage',
      'Health probe monitoring with alerting integration into operational channels',
    ],
    deliverableType: 'Cloud Environment Initialized & Database Security Audit Passed',
  },
  {
    reference: 'GPY-202609-4K12',
    title: 'Proprietary Workflow Automation Engine & Digital API License',
    category: 'SaaS & Proprietary Platforms',
    sicCode: '58290',
    clientClassification: 'Digital Marketing & Content Agency',
    jurisdiction: 'United Kingdom (Manchester)',
    valueBadge: '£199 · Tier A Engagement',
    acceptedDate: '2026-09-12',
    gitRelease: 'v2026.9.1',
    fingerprint: 'ef1992bc44a1024de7720912cb89aa450123ccdd8901234baaa89201cdfe9812',
    tags: ['Automation Scripts', 'REST API Gateway', 'Bearer Tokens', 'Documentation'],
    description: 'Licensing and turnkey deployment of proprietary multi-tenant workflow automation scripts. Delivers automated lead qualification and webhook dispatching for agency CRM systems.',
    architectureHighlights: [
      'Single-tenant isolated execution runtime with dedicated API secret keys',
      'Complete Swagger/OpenAPI documentation and deployment runbook',
      'Instant license token activation with digital signature verification',
    ],
    deliverableType: 'License Token Provisioned & Digital Gateway Activated',
  },
  {
    reference: 'GPY-202608-7H55',
    title: 'Payment Gateway Pipeline & Risk Assessment Architecture Sprint',
    category: 'Architecture & Systems Integration',
    sicCode: '62020',
    clientClassification: 'E-commerce Retailer',
    jurisdiction: 'United Kingdom (Birmingham)',
    valueBadge: '£650 · Tier B Engagement',
    acceptedDate: '2026-08-25',
    gitRelease: 'v2026.8.2',
    fingerprint: '94bf0012ac992014bba112ef8801cb923a104f9814cc5903b12ef90123f810aa',
    tags: ['Stripe Radar', '3D Secure 2', 'Fraud Prevention', 'Technical Advisory'],
    description: 'Technical consultancy sprint reviewing checkout conversion and fraud mitigation. Implemented 3DS2 dynamic challenge rules, Stripe Radar custom risk heuristics, and webhook reconciliation.',
    architectureHighlights: [
      'Idempotent webhook reconciliation catching 100% of delayed transaction settlements',
      'Custom fraud scoring rules reducing chargeback exposure to under 0.05%',
      'Handover architecture document and operational runbook for accounting personnel',
    ],
    deliverableType: 'Technical Integration Sprint Completed & Security Verified',
  },
];
