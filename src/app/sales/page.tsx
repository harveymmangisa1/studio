'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { createDoubleEntryTransaction } from '../../lib/ledger';
import { useTenant } from '@/lib/tenant';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  payment_status: string;
  invoice_date: string;
}

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales_invoices')
        .select('*');
      if (error) throw error;
      setInvoices(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkAsPaid = async (invoiceId: string, totalAmount: number) => {
    try {
      const { error } = await supabase
        .from('sales_invoices')
        .update({ payment_status: 'Paid', payment_date: new Date().toISOString() })
        .eq('id', invoiceId);

      if (error) throw error;

      // Create ledger entries for payment
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id, account_name')
        .in('account_name', ['Accounts Receivable', 'Cash']);

      if (accountsError) throw accountsError;

      const accountsReceivableAccountId = accounts.find(a => a.account_name === 'Accounts Receivable')?.id;
      const cashAccountId = accounts.find(a => a.account_name === 'Cash')?.id;

      if (!accountsReceivableAccountId || !cashAccountId) {
        throw new Error('Could not find required accounts for transaction.');
      }

      await createDoubleEntryTransaction([
        { accountId: cashAccountId, debit: totalAmount, credit: 0 },
        { accountId: accountsReceivableAccountId, debit: 0, credit: totalAmount },
      ]);

      fetchInvoices();
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Sales Invoices</h1>
          <p className="text-muted-foreground">Manage your sales and customer invoices.</p>
        </div>
        <Link href="/sales/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.customer_name}</TableCell>
                  <TableCell>{new Date(invoice.invoice_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.payment_status === 'Paid' ? 'outline' : 'destructive'}>
                      {invoice.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${invoice.total_amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invoice.payment_status !== 'Paid' && (
                          <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id, invoice.total_amount)}>
                            <span>Mark as Paid</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                           <Link href={`/sales/${invoice.id}`}>
                             <Eye className="mr-2 h-4 w-4" />
                             <span>View Details</span>
                           </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}