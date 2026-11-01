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
