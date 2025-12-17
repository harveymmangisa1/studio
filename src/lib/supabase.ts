
import { createClient } from '@supabase/supabase-js';

// Do not initialize at import time to avoid build-time failures
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: any;

export const getSupabase = (tenantId?: string) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or anon key is not configured in environment');
  }
  // Always return a new client to ensure no state leaks between requests,
  // especially in a serverless environment.
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // The tenantId should be used in each query explicitly, e.g., .eq('tenant_id', tenantId)
  // We no longer set a session variable in the database.
  
  return supabase;
};

// This is a singleton for client-side usage where a single tenant is active.
export const supabase = getSupabase();
