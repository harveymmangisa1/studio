
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

  const getTenantData = async () => {
    try {
      const response = await fetch('/api/tenant');
      if (!response.ok) {
        throw new Error('Failed to fetch tenant data');
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
      }
    } catch (error) {
      console.error("Error in getTenantData:", error);
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
    getTenantData();
  }, []);

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

  return (
    <TenantContext.Provider value={{ tenant, setTenant, updateTenantSettings, theme, setTheme }}>
      {children}
    </TenantContext.Provider>
  );
}
