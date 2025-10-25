
'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/tenant';
import { PageHeader } from '@/components/shared/PageHeader';
import { PayrollTable } from '@/components/hr/PayrollTable';

const PayrollPage = () => {
  const { tenant } = useTenant();
  const [payrolls, setPayrolls] = useState([]);

  useEffect(() => {
    if (!tenant) return;
    const fetchPayrolls = async () => {
      try {
        const response = await fetch('/api/hr/payroll', {
          headers: {
            'x-tenant-id': tenant.id,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch payrolls');
        }
        const data = await response.json();
        setPayrolls(data);
      } catch (error) {
        console.error('Error fetching payrolls:', error);
      }
    };

    fetchPayrolls();
  }, [tenant]);

  return (
    <div>
      <PageHeader title="Payroll" description="Process payroll and manage employee salaries." />
      <div className="mt-8">
        <PayrollTable payrolls={payrolls} />
      </div>
    </div>
  );
};

export default PayrollPage;
