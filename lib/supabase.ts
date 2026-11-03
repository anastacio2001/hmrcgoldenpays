import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Null until the Supabase project is configured; callers must handle that case.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

export interface VerifiedDeliverable {
  reference: string;
  client_classification: string;
  sic_code: string;
  deliverable_summary: string;
  accepted_on: string;
  approved_by: string;
  fingerprint: string;
}

export type InquiryStatus = 'new' | 'in-progress' | 'resolved';
export type ClientStatus = 'prospect' | 'active' | 'inactive';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed';

export interface Inquiry {
  id: string;
  name: string;
  company: string | null;
  email: string;
  service: string;
  message: string;
  status: InquiryStatus;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  client_id: string | null;
  sic_code: string | null;
  status: ProjectStatus;
  value_gbp: number | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  created_at: string;
}

export interface Deliverable extends VerifiedDeliverable {
  id: number;
  is_public: boolean;
  project_id: string | null;
  created_at: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'cancelled';
export type PaymentKind = 'invoice' | 'deposit' | 'balance' | 'subscription' | 'licence';
export type PaymentMethod = 'stripe' | 'bank-transfer' | 'other';

export interface Payment {
  id: string;
  invoice_number: string;
  client_id: string | null;
  project_id: string | null;
  description: string;
  kind: PaymentKind;
  method: PaymentMethod;
  amount_gbp: number;
  vat_gbp: number;
  status: PaymentStatus;
  issued_on: string;
  due_on: string | null;
  paid_on: string | null;
  stripe_payment_id: string | null;
  notes: string | null;
  created_at: string;
}

export type DocumentCategory = 'contract' | 'invoice' | 'receipt' | 'certificate' | 'company' | 'tax' | 'bank' | 'other';

export interface CompanyDocument {
  id: string;
  title: string;
  category: DocumentCategory;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  document_date: string | null;
  client_id: string | null;
  project_id: string | null;
  notes: string | null;
  created_at: string;
}

export type ExpenseCategory =
  | 'software' | 'hosting' | 'equipment' | 'professional-fees' | 'office'
  | 'travel' | 'marketing' | 'bank-fees' | 'insurance' | 'training' | 'other';

export interface Expense {
  id: string;
  spent_on: string;
  supplier: string;
  description: string | null;
  category: ExpenseCategory;
  amount_gbp: number;
  method: 'card' | 'bank-transfer' | 'direct-debit' | 'cash' | 'other';
  receipt_document_id: string | null;
  project_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface ComplianceDeadline {
  id: string;
  title: string;
  authority: 'companies-house' | 'hmrc' | 'ico' | 'bank' | 'other';
  due_on: string;
  status: 'pending' | 'done';
  completed_on: string | null;
  notes: string | null;
  created_at: string;
}

export type LeadStatus = 'new' | 'qualified' | 'contacted' | 'replied' | 'meeting' | 'proposal' | 'won' | 'lost' | 'excluded';

export interface Lead {
  id: string;
  company_number: string;
  company_name: string;
  company_type: string | null;
  incorporated_on: string | null;
  sic_codes: string[];
  address: string | null;
  locality: string | null;
  postcode: string | null;
  directors: string[];
  website: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  notes: string | null;
  search_id: string | null;
  last_contacted_at: string | null;
  created_at: string;
}

export interface LeadSearch {
  id: string;
  name: string;
  sic_codes: string[];
  location: string | null;
  company_type: 'ltd' | 'plc' | 'llp';
  incorporated_from: string | null;
  incorporated_to: string | null;
  max_results: number;
  is_active: boolean;
  last_run_at: string | null;
  last_found: number | null;
  last_inserted: number | null;
  created_at: string;
}

export interface LeadRun {
  id: string;
  trigger: 'cron' | 'manual';
  started_at: string;
  finished_at: string | null;
  searches: number;
  found: number;
  inserted: number;
  error: string | null;
}
