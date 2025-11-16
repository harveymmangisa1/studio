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
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    let tenantInfo = null;

    if (parts.length > 2 && parts[0] !== 'www') {
      const subdomain = parts[0];
      const { data, error } = await supabase
        .from('tenants')
        .select('*, tenant_settings(*)')
        .eq('subdomain', subdomain)
        .single();
      if (data) {
        tenantInfo = data;
      }
    }
    
    if (!tenantInfo) {
      // Fallback to a default tenant if subdomain is not found or for localhost
      const { data, error } = await supabase
        .from('tenants')
        .select('*, tenant_settings(*)')
        .eq('id', 'a8d6f397-8e3a-4b8d-9b3d-2e6b7d3b3e5c') // Dummy Tenant ID
        .single();
      tenantInfo = data;
    }
    
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
