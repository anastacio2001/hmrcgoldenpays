import { SicCode } from '../data/site';

export type ClientType = 'individual' | 'corporate';

export type PaymentMethodType = 'stripe' | 'bank_taptap';

export type CurrencyType = 'GBP' | 'EUR' | 'USD';

export type ServiceTier = 'A' | 'B' | 'C';

export interface ClientInfo {
  type: ClientType;
  name: string;
  companyName?: string;
  email: string;
  country: string;
  billingAddress: string;
  vatTaxId?: string;
  companyNumber?: string;
}

export interface TransactionDetails {
  method: PaymentMethodType;
  reference: string;
  datetime: string;
  currency: CurrencyType;
  amount: number;
}

export interface InvoiceItem {
  id: string;
  description: string;
  sicCode: SicCode;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
}

export interface EmailRecord {
  id: string;
  step: 1 | 2 | 3 | 4;
  title: string;
  from: string;
  to: string;
  date: string;
  subject: string;
  messageId: string;
  deliveredTo?: string;
  body: string;
}

export interface DeliveryMilestone {
  id: string;
  title: string;
  timestamp: string;
  status: 'completed';
  verificationDetail: string;
}

export interface TechnicalProof {
  title: string;
  deliveryType: string;
  auditHash: string;
  gitCommit: string;
  releaseTag: string;
  endpointUrl: string;
  runtimeEnvironment: string;
  milestones: DeliveryMilestone[];
  acceptanceCriteria: string[];
}

export interface AuditDossier {
  id: string;
  invoiceNumber: string; // GPY-YYYYMM-XXXX
  reference: string;     // Reference code matching invoice or deliverable
  createdAt: string;
  tier: ServiceTier;
  sicCode: SicCode;
  serviceCategory: string;
  deliverableTitle: string;
  scopeSummary: string;
  client: ClientInfo;
  transaction: TransactionDetails;
  items: InvoiceItem[];
  emails: EmailRecord[];
  proof: TechnicalProof;
  directorName: string;
  directorTitle: string;
  signatureTimestamp: string;
  isPublic: boolean;
}
