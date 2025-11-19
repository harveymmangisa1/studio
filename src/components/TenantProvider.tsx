
'use client';

import { Tenant, TenantContext } from '@/lib/tenant';
import { setSupabaseTenant, supabase } from '@/lib/supabase';
import { useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthProvider';

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [theme, setTheme] = useState('light');
  const [tenantLoading, setTenantLoading] = useState(true);

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

  const getTenantData = async () => {
    if (!session) {
      setTenantLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/tenant');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch tenant data');
      }
      const tenantInfo = await response.json();
      
      if (tenantInfo) {
          const { tenant_settings, company_name, ...restOfTenant } = tenantInfo;
          const settings = Array.isArray(tenant_settings) ? tenant_settings[0] : tenant_settings;
          
          const fullTenant = {
            ...restOfTenant,
            name: company_name,
            address: settings?.business_address,
            email: settings?.business_email,
            phone: settings?.business_phone,
            logo_url: settings?.logo_url,
            settings: settings?.settings || {},
          };
          setTenant(fullTenant as Tenant);
      } else {
        throw new Error("Tenant data is empty");
      }
    } catch (error: any) {
      console.error('Error in getTenantData:', error);
      // Keep your fallback logic here, it is good
      setTenant({ id: 'a8d6f397-8e3a-4b8d-9b3d-2e6b7d3b3e5c', name: 'Default Tenant' } as Tenant);
    } finally {
      setTenantLoading(false);
    }
  };


  useEffect(() => {
    if (tenant?.settings) {
      const root = document.documentElement;
      if (tenant.settings.primaryColor) {
        root.style.setProperty('--primary', tenant.settings.primaryColor);
      }
      if (tenant.settings.accentColor) {
        root.style.setProperty('--accent', tenant.settings.accentColor);
      }
    }
  }, [tenant]);

  useEffect(() => {
    // Only fetch tenant data when the auth state is confirmed and a session exists
    if (!authLoading && session) {
      getTenantData();
    } else if (!authLoading && !session) {
      // If there's no session, we don't need to load tenant data
      setTenantLoading(false);
    }
  }, [authLoading, session]);

  const updateTenantSettings = async (newSettings: any) => {
    if (!tenant) return;

    const { 
      companyName,
      industry,
      email,
      phone,
      address,
      city,
      country,
      taxId,
      ...restOfSettings 
    } = newSettings;

    // 1. Update tenants table
    const { error: tenantError } = await supabase
      .from('tenants')
      .update({ company_name: companyName, industry })
      .eq('id', tenant.id);

    // 2. Update tenant_settings table
    const { error: settingsError } = await supabase
      .from('tenant_settings')
      .update({
        business_email: email,
        business_phone: phone,
        business_address: `${address}, ${city}, ${country}`,
        settings: restOfSettings
      })
      .eq('tenant_id', tenant.id);

    if (!tenantError && !settingsError) {
      await getTenantData(); // Refresh data
    } else {
      console.error('Error updating settings:', tenantError, settingsError);
    }
  };

  if (tenantLoading || authLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div>Loading application...</div>
        </div>
    );
  }

  return (
    <TenantContext.Provider value={{ tenant, setTenant, updateTenantSettings, theme, setTheme }}>
      {children}
    </TenantContext.Provider>
  );
}
