
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

    const userId = session.user.id;

    try {
      // Resolve current tenant for logged-in user from tenant_users table
      const { data: tenantLink, error: tenantLinkError } = await supabase
        .from('tenant_users')
        .select('tenant_id, role, tenants!inner(*, tenant_settings!tenant_id(*))')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (tenantLinkError) {
        throw tenantLinkError;
      }

      if (!tenantLink?.tenant_id || !tenantLink.tenants) {
        throw new Error('No tenant assigned to the current user');
      }

      const tenantInfo: any = tenantLink.tenants;
      const settings = Array.isArray(tenantInfo.tenant_settings)
        ? tenantInfo.tenant_settings[0]
        : tenantInfo.tenant_settings;

      const fullTenant = {
        ...tenantInfo,
        name: tenantInfo.company_name,
        address: settings?.business_address,
        email: settings?.business_email,
        phone: settings?.business_phone,
        logo_url: settings?.logo_url,
        settings: settings?.settings || {},
      } as Tenant;

      setTenant(fullTenant);
      setSupabaseTenant(tenantLink.tenant_id);

      try {
        document.cookie = `tenant_id=${tenantLink.tenant_id}; path=/; SameSite=Lax`;
      } catch (cookieError) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Unable to persist tenant cookie:', cookieError);
        }
      }
    } catch (error: any) {
      console.error('Error in getTenantData:', error);
      setTenant(null);
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
