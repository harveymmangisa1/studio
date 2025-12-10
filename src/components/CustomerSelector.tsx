'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTenant } from '@/lib/tenant';

interface Customer {
  id: string;
  name: string;
}

interface CustomerSelectorProps {
  onSelectCustomer: (customerId: string) => void;
}

export function CustomerSelector({ onSelectCustomer }: CustomerSelectorProps) {
  const { tenant } = useTenant();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant) return;
    const fetchCustomers = async () => {
      try {
        const { data, error } = await supabase.from('customers').select('id, name').eq('tenant_id', tenant.id);
        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [tenant]);

  return (
    <Select onValueChange={onSelectCustomer}>
      <SelectTrigger>
        <SelectValue placeholder="Select a customer" />
      </SelectTrigger>
      <SelectContent>
        {customers.map(customer => (
          <SelectItem key={customer.id} value={customer.id}>
            {customer.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
