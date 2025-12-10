'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useTenant } from '@/lib/tenant';

interface AgingInvoice {
  customer_name: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  days_overdue: number;
}

export default function ARAgingReportPage() {
  const { tenant } = useTenant();
  const [agingData, setAgingData] = useState<Record<string, AgingInvoice[]>>({
    '0-30': [],
    '31-60': [],
    '61-90': [],
    '90+': [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) return;
    const fetchAgingReport = async () => {
      try {
        const { data, error } = await supabase
          .from('sales_invoices')
          .select('customer_name, invoice_number, invoice_date, due_date, total_amount')
          .eq('payment_status', 'Unpaid')
          .eq('tenant_id', tenant.id);

        if (error) throw error;

        const today = new Date();
        const agingBuckets: Record<string, AgingInvoice[]> = {
          '0-30': [],
          '31-60': [],
          '61-90': [],
          '90+': [],
        };

        for (const invoice of data) {
          const dueDate = new Date(invoice.due_date);
          const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));

          const agingInvoice = { ...invoice, days_overdue: daysOverdue > 0 ? daysOverdue : 0 };

          if (daysOverdue <= 30) {
            agingBuckets['0-30'].push(agingInvoice);
          } else if (daysOverdue <= 60) {
            agingBuckets['31-60'].push(agingInvoice);
          } else if (daysOverdue <= 90) {
            agingBuckets['61-90'].push(agingInvoice);
          } else {
            agingBuckets['90+'].push(agingInvoice);
          }
        }

        setAgingData(agingBuckets);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgingReport();
  }, [tenant]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Accounts Receivable Aging Report</CardTitle>
          <CardDescription>A summary of unpaid invoices by age.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.entries(agingData).map(([bucket, invoices]) => (
            <div key={bucket}>
              <h3 className="text-lg font-semibold mb-2">{bucket} Days</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(invoice => (
                    <TableRow key={invoice.invoice_number}>
                      <TableCell>{invoice.customer_name}</TableCell>
                      <TableCell>{invoice.invoice_number}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.days_overdue}</TableCell>
                      <TableCell className="text-right">${invoice.total_amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
