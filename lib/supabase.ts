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
  email_confidence: 'high' | 'medium' | 'manual' | null;
  google_maps_url: string | null;
  places_checked_at: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_email_score: number | null;
  hunter_checked_at: string | null;
  email_source_url: string | null;
  enrichment_checked_at: string | null;
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
  segment: string | null;
  pain_point: string | null;
  pitch: string | null;
  offering: 'licence' | 'sprint' | 'integration' | 'cloud' | null;
  priority: 1 | 2 | 3;
  incorporated_within_days: number | null;
  pain_topic: string | null;
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

export interface Campaign {
  id: string;
  name: string;
  send_mode: 'manual' | 'automatic';
  daily_limit: number;
  from_name: string;
  is_active: boolean;
  created_at: string;
}

export interface CampaignStep {
  id: string;
  campaign_id: string;
  step_number: number;
  delay_days: number;
  subject: string;
  body: string;
}

export interface CampaignEnrollment {
  id: string;
  campaign_id: string;
  lead_id: string;
  current_step: number;
  next_due_on: string;
  status: 'active' | 'completed' | 'stopped';
  stopped_reason: string | null;
  unsubscribe_token: string;
  custom_steps: { step: number; subject: string; body: string }[] | null;
  created_at: string;
}

export interface Suppression {
  id: string;
  email: string | null;
  company_number: string | null;
  reason: 'unsubscribed' | 'excluded' | 'bounced' | 'complaint' | 'manual';
  created_at: string;
}

export type ActivityChannel = 'email' | 'call' | 'linkedin' | 'letter' | 'note';
export type ActivityOutcome =
  | 'sent' | 'no-answer' | 'voicemail' | 'interested' | 'not-interested' | 'do-not-contact'
  | 'connected' | 'messaged' | 'printed' | 'posted' | 'note';

export interface LeadActivity {
  id: string;
  lead_id: string;
  channel: ActivityChannel;
  outcome: ActivityOutcome | null;
  notes: string | null;
  created_at: string;
}

export interface LeadBrief {
  id: string;
  lead_id: string;
  fit_score: number;
  summary: string;
  pains: { pain: string; evidence: string; source: string }[];
  recommended_offering: 'licence' | 'sprint' | 'integration' | 'cloud' | 'none' | null;
  red_flags: string[];
  emails: { step: number; subject: string; body: string }[];
  letter: string | null;
  linkedin_note: string | null;
  call_opener: string | null;
  status: 'draft' | 'approved' | 'rejected';
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  created_at: string;
  updated_at: string;
}

export interface ContentPost {
  id: string;
  pillar: string;
  format: 'post' | 'carousel' | 'poll' | 'article';
  segment: string | null;
  title: string;
  hook: string | null;
  body: string;
  hashtags: string[];
  cta: string | null;
  image_idea: string | null;
  status: 'draft' | 'approved' | 'posted' | 'archived';
  scheduled_for: string | null;
  posted_at: string | null;
  model: string | null;
  created_at: string;
}
