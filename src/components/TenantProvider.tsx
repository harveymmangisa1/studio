'use client';

import { Tenant, TenantContext } from '@/lib/tenant';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  // With JWT claim-based RLS, no per-request RPC is needed

  useEffect(() => {
    const getTenant = async () => {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length > 2 && parts[0] !== 'www') {
        const subdomain = parts[0];
        const { data: tenant, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('subdomain', subdomain)
          .single();

        if (tenant) {
          setTenant(tenant);
        } else {
          // Fallback to a default tenant if subdomain is not found
          const dummyTenant = { id: 'a8d6f397-8e3a-4b8d-9b3d-2e6b7d3b3e5c', name: 'Default Tenant' };
          setTenant(dummyTenant);
        }
      } else {
        // Fallback for localhost or when no subdomain is present
        const dummyTenant = { id: 'a8d6f397-8e3a-4b8d-9b3d-2e6b7d3b3e5c', name: 'Default Tenant' };
        setTenant(dummyTenant);
      }
    };

    getTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}
