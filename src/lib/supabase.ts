import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let supabaseInstance: any;

export const getSupabase = (tenantId?: string) => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  if (tenantId) {
    supabaseInstance.rpc('set_current_tenant', { tenant_id_input: tenantId });
  }

  return supabaseInstance;
};

export const setSupabaseTenant = (tenantId: string) => {
  if (supabaseInstance) {
    supabaseInstance.rpc('set_current_tenant', { tenant_id_input: tenantId });
  }
};

export const supabase = getSupabase();
