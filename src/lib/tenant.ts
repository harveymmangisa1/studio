import { createContext, useContext } from 'react';

export interface Tenant {
  id: string;
  name: string;
  address?: string;
  email?: string;
  phone?: string;
  logo_url?: string;
  primary_color?: string;
}

export const TenantContext = createContext<{
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
}>({ tenant: null, setTenant: () => {} });

export function useTenant() {
  return useContext(TenantContext);
}
