'use client';

import { Tenant, TenantContext } from '@/lib/tenant';
import { setSupabaseTenant, supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);


  useEffect(() => {
    if (tenant) {
      setSupabaseTenant(tenant.id);
    }
  }, [tenant]);

  useEffect(() => {
    const getTenant = async () => {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      let tenantData = null;

      if (parts.length > 2 && parts[0] !== 'www') {
        const subdomain = parts[0];
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('subdomain', subdomain)
          .single();
        tenantData = data;
      }
      
      if (!tenantData) {
        // Fallback to a default tenant if subdomain is not found or for localhost
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', 'a8d6f397-8e3a-4b8d-9b3d-2e6b7d3b3e5c') // Dummy Tenant ID
          .single();
        tenantData = data;
      }
      
      setTenant(tenantData);
    };

    getTenant();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, setTenant, theme, setTheme }}>
      {children}
    </TenantContext.Provider>
  );
}
