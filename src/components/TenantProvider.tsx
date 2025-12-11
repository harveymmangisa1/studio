
'use client';

import { Tenant, TenantContext } from '@/lib/tenant';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [theme, setTheme] = useState('light');
  const [tenantLoading, setTenantLoading] = useState(true);

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading Auth Context...</div>
      </div>
    );
  }
  
  const { session, loading: authLoading } = auth;

  // Initialize theme
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Fetch tenant for logged-in user
  const getTenantData = async () => {
    if (!session) {
      setTenantLoading(false);
      return;
    }

    const userId = session.user.id;

    try {
      // Fetch the tenant linked to this user
      const { data: tenantLink, error: tenantLinkError } = await supabase
        .from('tenant_users')
        .select(`
          tenant_id,
          role,
          tenants!tenant_users_tenant_id_fkey (
            *,
            tenant_settings (*)
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (tenantLinkError) throw tenantLinkError;

      if (!tenantLink?.tenants) {
        throw new Error('No tenant found for this user or access denied.');
      }

      const t = tenantLink.tenants;
      const settings = Array.isArray(t.tenant_settings) ? t.tenant_settings[0] : t.tenant_settings;

      const fullTenant: Tenant = {
        ...t,
        name: t.company_name,
        address: settings?.business_address,
        email: settings?.business_email,
        phone: settings?.business_phone,
        logo_url: settings?.logo_url,
        settings: settings?.settings || {},
      };

      setTenant(fullTenant);
    } catch (err) {
      console.error('Error in getTenantData:', err);
      // fallback default tenant
      setTenant({ id: 'a8d6f397-8e3a-4b8d-9b3d-2e6b7d3b3e5c', name: 'Default Tenant', settings: {} } as Tenant);
    } finally {
      setTenantLoading(false);
    }
  };

  // Apply tenant theme colors
  useEffect(() => {
    if (tenant?.settings) {
      const root = document.documentElement;
      if (tenant.settings.primaryColor) root.style.setProperty('--primary', tenant.settings.primaryColor);
      if (tenant.settings.accentColor) root.style.setProperty('--accent', tenant.settings.accentColor);
    }
  }, [tenant]);

  // Fetch tenant after auth is ready
  useEffect(() => {
    if (!authLoading && session) getTenantData();
    else if (!authLoading && !session) setTenantLoading(false);
  }, [authLoading, session]);

  const updateTenantSettings = async (newSettings: any) => {
    if (!tenant) return;

    const { companyName, industry, email, phone, address, city, country, taxId, ...rest } = newSettings;

    const { error: tenantError } = await supabase
      .from('tenants')
      .update({ company_name: companyName, industry })
      .eq('id', tenant.id);

    const { error: settingsError } = await supabase
      .from('tenant_settings')
      .update({
        business_email: email,
        business_phone: phone,
        business_address: `${address}, ${city}, ${country}`,
        settings: rest,
      })
      .eq('tenant_id', tenant.id);

    if (!tenantError && !settingsError) await getTenantData();
    else console.error('Error updating tenant settings:', tenantError, settingsError);
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
