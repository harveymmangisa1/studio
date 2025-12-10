import { createContext, useContext } from 'react';

export interface Tenant {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  primary_color?: string;
  settings?: Record<string, any>;
}

export const TenantContext = createContext<{
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  updateTenantSettings: (settings: any) => Promise<void>;
  theme: string;
  setTheme: (theme: string) => void;
}>({
  tenant: null,
  setTenant: (/* tenant */) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('TenantContext.setTenant called outside of Provider');
    }
  },
  updateTenantSettings: async (/* settings */) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('TenantContext.updateTenantSettings called outside of Provider');
    }
  },
  theme: 'light',
  setTheme: (/* theme */) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('TenantContext.setTheme called outside of Provider');
    }
  },
});

export function useTenant() {
  return useContext(TenantContext);
}
