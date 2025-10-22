'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, MoreHorizontal, Eye, FileText, CheckCircle, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { createDoubleEntryTransaction } from '../../lib/ledger';
import { PageHeader } from '@/components/shared';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  total_amount: number;
  payment_status: string;
  invoice_date: string;
}

interface Quote {
  id: string;
  quote_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  quote_date: string;
  expiry_date: string;
}

export default function SalesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const { data: invoiceData, error: invoiceError } = await supabase.from('sales_invoices').select('*');
      if (invoiceError) throw invoiceError;
      setInvoices(invoiceData || []);
      
      // For now, let's use mock data for quotes as the table doesn't exist yet
      setQuotes([
        { id: '1', quote_number: 'QT-001', customer_name: 'Prospect Inc.', total_amount: 1500, status: 'Sent', quote_date: '2024-05-20', expiry_date: '2024-06-20' },
        { id: '2', quote_number: 'QT-002', customer_name: 'Lead Ventures', total_amount: 3200, status: 'Accepted', quote_date: '2024-05-18', expiry_date: '2024-06-18' },
        { id: '3', quote_number: 'QT-003', customer_name: 'Future Systems', total_amount: 800, status: 'Draft', quote_date: '2024-05-22', expiry_date: '2024-06-22' },
      ]);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
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

      fetchSalesData();
    } catch (error: any) {
      setError(error.message);
    }
  };
  
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "outline" | "destructive" | "default"; icon?: React.ElementType }> = {
      'Paid': { variant: 'default' as any, icon: CheckCircle },
      'Unpaid': { variant: 'destructive', icon: Clock },
      'Sent': { variant: 'outline', icon: FileText },
      'Accepted': { variant: 'default' as any },
      'Draft': { variant: 'secondary' as any },
    };
    const config = statusConfig[status] || { variant: 'outline' };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any}>
        {Icon && <Icon className="mr-1 h-3 w-3" />}
        {status}
      </Badge>
    );
  };


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Sales & Quotations"
        description="Manage your sales cycle from quotation to invoice."
      >
        <Link href="/sales/quotes/new">
          <Button variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </Link>
        <Link href="/sales/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </PageHeader>
      
      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="quotations">Quotations</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices">
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
                        {getStatusBadge(invoice.payment_status)}
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
        </TabsContent>
        <TabsContent value="quotations">
          <Card>
            <CardHeader>
              <CardTitle>All Quotations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.map(quote => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium">{quote.quote_number}</TableCell>
                      <TableCell>{quote.customer_name}</TableCell>
                      <TableCell>{new Date(quote.quote_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(quote.expiry_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {getStatusBadge(quote.status)}
                      </TableCell>
                      <TableCell className="text-right">${quote.total_amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                               <Link href={`/sales/quotes/${quote.id}`}>
                                 <Eye className="mr-2 h-4 w-4" />
                                 <span>View Details</span>
                               </Link>
                            </DropdownMenuItem>
                            {quote.status !== 'Accepted' && (
                              <DropdownMenuItem>
                                <span>Convert to Invoice</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
