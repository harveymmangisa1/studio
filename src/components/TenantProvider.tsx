
'use client';

import { Tenant, TenantContext } from '@/lib/tenant';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthProvider';

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const authContext = useAuth();
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


  const getTenantData = async (userId: string) => {
    if (!userId) {
      setTenantLoading(false);
      return;
    }

    try {
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

      if (tenantLinkError) {
        console.warn("Supabase API Error:", tenantLinkError.message);
        throw tenantLinkError;
      }

      if (!tenantLink || !tenantLink.tenants) {
        console.warn(`No tenant found for user ID: ${userId}. Check RLS policies.`);
        throw new Error("Tenant not found or access denied for this user.");
      }

      const tenantInfo: any = tenantLink.tenants;
      
      const { tenant_settings, company_name, ...restOfTenant } = tenantInfo;
      const settings = Array.isArray(tenant_settings) ? tenant_settings[0] : tenant_settings;
      
      const fullTenant: Tenant = {
        ...restOfTenant,
        name: company_name,
        address: settings?.business_address,
        email: settings?.business_email,
        phone: settings?.business_phone,
        logo_url: settings?.logo_url,
        settings: settings?.settings || {},
      };
      setTenant(fullTenant);

    } catch (error: any) {
      console.error('Error in getTenantData:', error);
      setTenant(null); // Set to null on error
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
    if (!authContext) return;
    const { session, loading: authLoading } = authContext;
    if (!authLoading && session) {
      getTenantData(session.user.id);
    } else if (!authLoading && !session) {
      setTenantLoading(false);
    }
  }, [authContext]);

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
        tax_id: taxId,
        settings: restOfSettings
      })
      .eq('tenant_id', tenant.id);

    if (!tenantError && !settingsError) {
      if(authContext?.session?.user.id) {
        await getTenantData(authContext.session.user.id);
      }
    } else {
      console.error('Error updating settings:', tenantError, settingsError);
    }
  };

  if (!authContext || authContext.loading || tenantLoading) {
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
