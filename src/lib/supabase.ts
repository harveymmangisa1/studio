import { createClient } from '@supabase/supabase-js';

// Do not initialize at import time to avoid build-time failures
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: any;

export const getSupabase = (tenantId?: string) => {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase URL or anon key is not configured in environment');
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  
  // The tenantId is now used in each query explicitly, e.g., .eq('tenant_id', tenantId)
  // We no longer set a session variable in the database.
  
  return supabaseInstance;
};

export const setSupabaseTenant = (tenantId: string) => {
  // This function is now a no-op as we are not setting the tenant context via RPC.
  // It's kept for now to avoid breaking imports, but can be removed in a future refactor.
};

export const supabase: any = new Proxy({}, {
  get(_target, prop) {
    const client = getSupabase();
    // @ts-ignore
    const value = client[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  }
});
