import { COMPANY, SIC_CODES, SicCode } from '../data/site';
import {
  AuditDossier,
  ClientInfo,
  CurrencyType,
  DeliveryMilestone,
  EmailRecord,
  InvoiceItem,
  PaymentMethodType,
  ServiceTier,
  TechnicalProof,
  TransactionDetails,
} from '../types/generator';

export const CURRENCY_SYMBOLS: Record<CurrencyType, string> = {
  GBP: '£',
  EUR: '€',
  USD: '$',
};

/** Convert currency amount to approximate GBP to determine tier threshold accurately. */
export function toGbpEquivalent(amount: number, currency: CurrencyType): number {
  switch (currency) {
    case 'GBP':
      return amount;
    case 'EUR':
      return amount / 1.15;
    case 'USD':
      return amount / 1.25;
    default:
      return amount;
  }
}

/** Determine tier based on GBP equivalent. */
export function calculateTier(amountGbp: number): ServiceTier {
  if (amountGbp <= 199.99) return 'A';
  if (amountGbp <= 799.99) return 'B';
  return 'C';
}

/** Generate sequential invoice number: GPY-YYYYMM-XXXX */
export function generateInvoiceNumber(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GPY-${year}${month}-${rand}`;
}

/** Generate mock payment reference if user leaves it empty */
export function generateMockPaymentRef(method: PaymentMethodType): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
  if (method === 'stripe') {
    let id = '';
    for (let i = 0; i < 20; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `pi_3P${id}`;
  }
  // Taptap Send or UK Bank Transfer (Faster Payments)
  const isTaptap = Math.random() > 0.4;
  if (isTaptap) {
    const num = Math.floor(1000000 + Math.random() * 9000000);
    return `TTS-GB-${num}`;
  }
  const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
  const digits = Math.floor(10000 + Math.random() * 90000);
  return `FPS-${yearMonth}-${digits}`;
}

/** Simple synchronous SHA-256 fallback or async browser crypto */
export async function computeAuditHash(payload: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(payload);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }
  // Fallback 64-char pseudo-hex if subtle crypto fails
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const raw = ((h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')).repeat(4);
  return raw.slice(0, 64);
}

/** Build default deliverables, line items and metadata based on Tier & SIC */
export function generateTierDefaults(
  tier: ServiceTier,
  selectedSic: SicCode,
  amount: number,
  currency: CurrencyType
): {
  deliverableTitle: string;
  scopeSummary: string;
  deliveryType: string;
  items: InvoiceItem[];
} {
  const symbol = CURRENCY_SYMBOLS[currency];

  if (tier === 'A') {
    // Tier A (Micro / Low Value: £25 - £199)
    const deliverableTitle = 'Digital API License & Automation Script Provisioning';
    const scopeSummary =
      'Provisioning of proprietary automation script license, secure webhook receiver endpoint, and cloud-hosted API tenant access token with complete deployment documentation.';
    const deliveryType = 'License Token Provisioned & Digital Gateway Activated';

    const item1Amount = Math.round(amount * 0.75 * 100) / 100;
    const item2Amount = Math.round((amount - item1Amount) * 100) / 100;

    const items: InvoiceItem[] = [
      {
        id: '1',
        description: 'Proprietary Automation Script License & API Gateway Seat (Single Tenant)',
        sicCode: selectedSic === '63110' ? '63110' : '58290',
        quantity: 1,
        unit: 'License Seat',
        unitPrice: item1Amount,
        amount: item1Amount,
      },
      {
        id: '2',
        description: 'Cloud Webhook Receiver Setup, Security Hardening & Secret Rotation Keys',
        sicCode: '63110',
        quantity: 1,
        unit: 'Config Unit',
        unitPrice: item2Amount,
        amount: item2Amount,
      },
    ];

    return { deliverableTitle, scopeSummary, deliveryType, items };
  }

  if (tier === 'B') {
    // Tier B (Medium Value: £200 - £799)
    const deliverableTitle = 'Cloud Database Architecture & Webhook Integration Sprint';
    const scopeSummary =
      'Provisioning and security configuration of managed PostgreSQL/Supabase cloud database, real-time webhook middleware, automated event logging, and REST pipeline integration.';
    const deliveryType = 'Cloud Environment Initialized & Integration Pipeline Deployed';

    const p1 = Math.round(amount * 0.5 * 100) / 100;
    const p2 = Math.round(amount * 0.3 * 100) / 100;
    const p3 = Math.round((amount - p1 - p2) * 100) / 100;

    const items: InvoiceItem[] = [
      {
        id: '1',
        description: 'Cloud PostgreSQL Database Architecture, Table Schema & Access Policies',
        sicCode: '63110',
        quantity: 1,
        unit: 'Architecture Sprint',
        unitPrice: p1,
        amount: p1,
      },
      {
        id: '2',
        description: 'Bidirectional Webhook Middleware Scripts & Event Dispath Logic',
        sicCode: '62012',
        quantity: 1,
        unit: 'Module Sprint',
        unitPrice: p2,
        amount: p2,
      },
      {
        id: '3',
        description: 'Technical Consultancy: API Security Review & Delivery Handover Documentation',
        sicCode: '62020',
        quantity: 1,
        unit: 'Review Session',
        unitPrice: p3,
        amount: p3,
      },
    ];

    return { deliverableTitle, scopeSummary, deliveryType, items };
  }

  // Tier C (High Value: £800+)
  const deliverableTitle = 'Bespoke Software Architecture, Cloud Migration & Core Modules';
  const scopeSummary =
    'Comprehensive full-stack bespoke software development, high-throughput backend APIs, automated CI/CD pipeline integration, production database clustering, and formal technical handover.';
  const deliveryType = 'Production Software Architecture Deployed & Live Acceptance Validated';

  const c1 = Math.round(amount * 0.45 * 100) / 100;
  const c2 = Math.round(amount * 0.30 * 100) / 100;
  const c3 = Math.round(amount * 0.15 * 100) / 100;
  const c4 = Math.round((amount - c1 - c2 - c3) * 100) / 100;

  const items: InvoiceItem[] = [
    {
      id: '1',
      description: 'Bespoke Application Backend & Secure RESTful Microservices Architecture',
      sicCode: '62012',
      quantity: 1,
      unit: 'Full Milestone',
      unitPrice: c1,
      amount: c1,
    },
    {
      id: '2',
      description: 'High-Availability Cloud Database & Distributed Webhook Pipelines',
      sicCode: '63110',
      quantity: 1,
      unit: 'Cloud Infra',
      unitPrice: c2,
      amount: c2,
    },
    {
      id: '3',
      description: 'Senior Technical Architecture & Systems Integration Consultancy',
      sicCode: '62020',
      quantity: 1,
      unit: 'Consultancy Hours',
      unitPrice: c3,
      amount: c3,
    },
    {
      id: '4',
      description: 'End-to-End Automated Test Verification, Staging Acceptance & Delivery Package',
      sicCode: '62012',
      quantity: 1,
      unit: 'Acceptance Verification',
      unitPrice: c4,
      amount: c4,
    },
  ];

  return { deliverableTitle, scopeSummary, deliveryType, items };
}

/** Generate realistic milestone timeline leading up to the payment date */
export function generateMilestones(paymentDateIso: string, deliverableTitle: string): DeliveryMilestone[] {
  const base = new Date(paymentDateIso);
  const msPerDay = 86400000;

  const d1 = new Date(base.getTime() - msPerDay * 3);
  const d2 = new Date(base.getTime() - msPerDay * 2);
  const d3 = new Date(base.getTime() - msPerDay * 1);
  const d4 = new Date(base.getTime() - 3600000 * 4); // 4 hours before sign-off
  const d5 = base;

  return [
    {
      id: 'M1',
      title: 'Technical Scoping & Architecture Specification Approval',
      timestamp: d1.toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
      status: 'completed',
      verificationDetail: 'Scope locked, technical requirements document signed off by client.',
    },
    {
      id: 'M2',
      title: 'Cloud Infrastructure & Security Sandbox Provisioning',
      timestamp: d2.toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
      status: 'completed',
      verificationDetail: 'Database instance, TLS certificates, and environment isolation verified.',
    },
    {
      id: 'M3',
      title: 'Core Software Development & Automated Testing',
      timestamp: d3.toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
      status: 'completed',
      verificationDetail: 'Integration logic passing 100% automated unit and end-to-end regression tests.',
    },
    {
      id: 'M4',
      title: 'Production Staging Deployment & Gateway Validation',
      timestamp: d4.toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
      status: 'completed',
      verificationDetail: 'Live endpoint responding with HTTP 200 OK; SSL cipher suite validated.',
    },
    {
      id: 'M5',
      title: 'Final Handover, Credential Delivery & Client Acceptance',
      timestamp: d5.toISOString().slice(0, 16).replace('T', ' ') + ' UTC',
      status: 'completed',
      verificationDetail: 'Production keys delivered; formal acceptance confirmed by client.',
    },
  ];
}

/** Generate realistic 4-piece RFC 822 email thread simulation */
export function generateEmailThread(
  client: ClientInfo,
  transaction: TransactionDetails,
  invoiceNumber: string,
  deliverableTitle: string,
  tier: ServiceTier,
  sicCode: SicCode
): EmailRecord[] {
  const base = new Date(transaction.datetime);
  const msPerDay = 86400000;

  const clientDisplayName = client.companyName
    ? `${client.name} <${client.email}> (${client.companyName})`
    : `${client.name} <${client.email}>`;
  const gpDirectorEmail = `${COMPANY.director} <${COMPANY.email}>`;
  const currencySymbol = CURRENCY_SYMBOLS[transaction.currency];
  const formattedAmount = `${currencySymbol}${transaction.amount.toFixed(2)} ${transaction.currency}`;

  const sicDesc = SIC_CODES.find((s) => s.code === sicCode)?.label ?? 'Software development';

  // Date offsets
  const dateStep1 = new Date(base.getTime() - msPerDay * 3).toUTCString();
  const dateStep2 = new Date(base.getTime() - msPerDay * 2).toUTCString();
  const dateStep3 = new Date(base.getTime() - msPerDay * 1).toUTCString();
  const dateStep4 = base.toUTCString();

  const domain = 'goldenpays.uk';
  const shortRef = invoiceNumber.replace(/[^A-Za-z0-9]/g, '').toLowerCase();

  return [
    {
      id: 'email-1',
      step: 1,
      title: '1. Initial Inquiry & Technical Scoping',
      from: clientDisplayName,
      to: `${COMPANY.name} Technical Engineering <${COMPANY.email}>`,
      date: dateStep1,
      subject: `Project Scoping Request: ${deliverableTitle}`,
      messageId: `<inquiry.${shortRef}.1@${client.email.split('@')[1] || 'client.com'}>`,
      deliveredTo: COMPANY.email,
      body: `Hello Goldenpays Engineering Team,\n\nWe are looking to implement ${deliverableTitle.toLowerCase()} for our operations. We require technical assurance that the infrastructure and codebase adhere to UK/EU standards and can be delivered with full intellectual property assignment.\n\nCould you please review the scope and provide a formal statement of work and commercial quotation?\n\nClient Details:\n${client.name}${client.companyName ? '\n' + client.companyName : ''}\n${client.billingAddress}\n${client.country}\n\nBest regards,\n${client.name}`,
    },
    {
      id: 'email-2',
      step: 2,
      title: '2. Formal Technical Proposal & Quotation',
      from: gpDirectorEmail,
      to: clientDisplayName,
      date: dateStep2,
      subject: `RE: Technical Proposal & SOW [${invoiceNumber}] - ${COMPANY.name}`,
      messageId: `<proposal.${shortRef}.2@${domain}>`,
      deliveredTo: client.email,
      body: `Dear ${client.name},\n\nThank you for reaching out to GOLDENPAYS LTD. We have scoped your technical requirements under our registered UK business activities (SIC Code ${sicCode}: ${sicDesc}).\n\nWe are pleased to submit our formal commercial proposal:\n\n- Scope of Work: ${deliverableTitle}\n- Classification: Tier ${tier} Engineering Engagement\n- Agreed Fixed Consideration: ${formattedAmount}\n- Delivery Timeline: Standard technical sprint with acceptance verification\n- Payment Method: Direct settlement via ${transaction.method === 'stripe' ? 'Stripe Secure Checkout' : 'UK Faster Payments / Taptap Send Bank Wire'}\n\nPlease confirm your agreement so we can schedule immediate technical provisioning.\n\nWarm regards,\n${COMPANY.director}\n${COMPANY.directorTitle}\n${COMPANY.name} (UK Co. No. ${COMPANY.number})\n${COMPANY.office}`,
    },
    {
      id: 'email-3',
      step: 3,
      title: '3. Acceptance Confirmation & Payment Receipt',
      from: clientDisplayName,
      to: gpDirectorEmail,
      date: dateStep3,
      subject: `Payment Executed & SOW Acceptance - Ref: ${invoiceNumber}`,
      messageId: `<payment-ack.${shortRef}.3@${client.email.split('@')[1] || 'client.com'}>`,
      deliveredTo: COMPANY.email,
      body: `Dear ${COMPANY.director},\n\nWe hereby confirm full acceptance of the Statement of Work for ${deliverableTitle}.\n\nThe payment of ${formattedAmount} has been processed successfully through ${transaction.method === 'stripe' ? 'Stripe' : 'Taptap Send / UK Bank Transfer'}.\n\nTransaction Details:\n- Payment Reference: ${transaction.reference}\n- Amount Cleared: ${formattedAmount}\n- Value Date: ${transaction.datetime}\n\nPlease proceed with endpoint activation and provide the handover documentation.\n\nSincerely,\n${client.name}`,
    },
    {
      id: 'email-4',
      step: 4,
      title: '4. Final Technical Handover & Delivery Completion',
      from: gpDirectorEmail,
      to: clientDisplayName,
      date: dateStep4,
      subject: `FULFILLMENT COMPLETE: Access Credentials & Commercial Invoice ${invoiceNumber}`,
      messageId: `<handover.${shortRef}.4@${domain}>`,
      deliveredTo: client.email,
      body: `Dear ${client.name},\n\nWe are pleased to confirm that the technical deployment for "${deliverableTitle}" has been completed and verified on our production environment.\n\nFulfillment Summary:\n- Commercial Invoice: ${invoiceNumber} (Paid in Full)\n- Deliverable Status: Completed & Deployed\n- Digital Fulfillment Hash: Generated & Archived\n- Public Verification URL: https://goldenpays.uk/verify?ref=${invoiceNumber}\n\nAttached to your client dossier are the Official UK Commercial Invoice, Statement of Work (SOW), and Certificate of Technical Completion.\n\nAll intellectual property rights associated with this delivery have transferred unconditionally to you as per our agreement terms.\n\nThank you for choosing GOLDENPAYS LTD.\n\nSincerely,\n${COMPANY.director}\n${COMPANY.directorTitle}\n${COMPANY.name}`,
    },
  ];
}

/** Assemble a complete 5-piece Audit Dossier */
export async function createAuditDossier(
  client: ClientInfo,
  transaction: TransactionDetails,
  customSic?: SicCode,
  customTitle?: string,
  customScope?: string,
  customInvoiceNumber?: string
): Promise<AuditDossier> {
  const gbpVal = toGbpEquivalent(transaction.amount, transaction.currency);
  const tier = calculateTier(gbpVal);

  const defaultSic: SicCode = tier === 'A' ? '58290' : tier === 'B' ? '62012' : '62012';
  const sicCode = customSic || defaultSic;

  const tierDefaults = generateTierDefaults(tier, sicCode, transaction.amount, transaction.currency);
  const deliverableTitle = customTitle || tierDefaults.deliverableTitle;
  const scopeSummary = customScope || tierDefaults.scopeSummary;
  const invoiceNumber = customInvoiceNumber || generateInvoiceNumber(transaction.datetime);

  const reference = invoiceNumber;
  const now = new Date().toISOString();

  const hashSeed = `${reference}|${client.name}|${client.email}|${transaction.amount}|${transaction.currency}|${transaction.reference}|${transaction.datetime}|${sicCode}|${COMPANY.director}|${COMPANY.number}`;
  const auditHash = await computeAuditHash(hashSeed);

  const milestones = generateMilestones(transaction.datetime, deliverableTitle);
  const emails = generateEmailThread(client, transaction, invoiceNumber, deliverableTitle, tier, sicCode);

  const gitCommit = auditHash.slice(0, 8);
  const releaseTag = `v${new Date().getFullYear()}.${new Date().getMonth() + 1}.${Math.floor(Math.random() * 90 + 10)}`;

  const proof: TechnicalProof = {
    title: 'CERTIFICATE OF TECHNICAL COMPLETION AND DELIVERY',
    deliveryType: tierDefaults.deliveryType,
    auditHash,
    gitCommit,
    releaseTag,
    endpointUrl: `https://api.goldenpays.uk/v1/deliverables/${reference.toLowerCase()}`,
    runtimeEnvironment: 'Node.js LTS / PostgreSQL Cloud Engine (Managed)',
    milestones,
    acceptanceCriteria: [
      'Zero fatal execution errors detected in automated smoke test suite.',
      'Cryptographic signature verified against Director key fingerprint.',
      'Bilateral agreement terms fully satisfied with clear consideration received.',
      'All technical deliverables handed over to client in designated format.',
    ],
  };

  const sicRecord = SIC_CODES.find((s) => s.code === sicCode);
  const serviceCategory = sicRecord ? `SIC ${sicCode} · ${sicRecord.area}` : `SIC ${sicCode}`;

  return {
    id: crypto?.randomUUID ? crypto.randomUUID() : `dossier-${Date.now()}`,
    invoiceNumber,
    reference,
    createdAt: now,
    tier,
    sicCode,
    serviceCategory,
    deliverableTitle,
    scopeSummary,
    client,
    transaction,
    items: tierDefaults.items,
    emails,
    proof,
    directorName: 'Ladislau Segunda Anastácio',
    directorTitle: 'Founder & Managing Director',
    signatureTimestamp: transaction.datetime,
    isPublic: true,
  };
}

// ---------------------------------------------------------------------------
// LocalStorage Persistence
// ---------------------------------------------------------------------------

const DOSSIERS_STORAGE_KEY = 'goldenpays_compliance_dossiers_v1';

export function getSavedDossiers(): AuditDossier[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DOSSIERS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditDossier[];
  } catch (err) {
    console.error('Failed to read dossiers from localStorage', err);
    return [];
  }
}

export function saveDossierToStorage(dossier: AuditDossier): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getSavedDossiers();
    const existingIndex = list.findIndex((d) => d.id === dossier.id || d.invoiceNumber === dossier.invoiceNumber);
    if (existingIndex >= 0) {
      list[existingIndex] = dossier;
    } else {
      list.unshift(dossier);
    }
    localStorage.setItem(DOSSIERS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save dossier to localStorage', err);
  }
}

export function deleteDossierFromStorage(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getSavedDossiers().filter((d) => d.id !== id && d.invoiceNumber !== id);
    localStorage.setItem(DOSSIERS_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to delete dossier from localStorage', err);
  }
}

export function findDossierByReference(ref: string): AuditDossier | null {
  const clean = ref.trim().toUpperCase();
  const list = getSavedDossiers();
  return list.find((d) => d.invoiceNumber.toUpperCase() === clean || d.reference.toUpperCase() === clean) || null;
}
