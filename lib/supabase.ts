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
