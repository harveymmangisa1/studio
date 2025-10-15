import { createContext, useContext, useState } from 'react';

export interface Tenant {
  id: string;
  name: string;
  // Add other tenant properties as needed
}

export const TenantContext = createContext<{
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
}>({ tenant: null, setTenant: () => {} });

export function useTenant() {
  return useContext(TenantContext);
}
