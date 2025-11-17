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

  if (tenantId) {
    // Fire and forget tenant switch for subsequent requests
    // @ts-ignore
    supabaseInstance.rpc('set_current_tenant', { tenant_id_input: tenantId });
  }

  return supabaseInstance;
};

export const setSupabaseTenant = (tenantId: string) => {
  if (supabaseInstance) {
    // @ts-ignore
    supabaseInstance.rpc('set_current_tenant', { tenant_id_input: tenantId });
  }
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
