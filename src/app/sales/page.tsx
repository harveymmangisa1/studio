
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
import { postARInvoice, postCOGS, postARPayment } from '../../lib/ledger';
import { PageHeader } from '@/components/shared';
import AppLayout from '@/components/AppLayout';
import { useTenant } from '@/lib/tenant';

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
  const { tenant } = useTenant();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesData = async () => {
    if (!tenant) return;
    try {
      setLoading(true);
      const { data: invoiceData, error: invoiceError } = await supabase.from('sales_invoices').select('*').eq('tenant_id', tenant.id);
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
    if (tenant) {
      fetchSalesData();
    }
  }, [tenant]);

  const handleMarkAsPaid = async (invoiceId: string, totalAmount: number) => {
    if (!tenant) return;
    try {
      const { error } = await supabase
        .from('sales_invoices')
        .update({ payment_status: 'Paid', payment_date: new Date().toISOString() })
        .eq('id', invoiceId)
        .eq('tenant_id', tenant.id);

      if (error) throw error;

      await postARPayment({ date: new Date().toISOString().slice(0,10), receiptId: `PMT-${invoiceId}`, amount: totalAmount, cashAccountName: 'Cash' });

      fetchSalesData();
    } catch (error: any) {
      setError(error.message);
    }
  };
  
  const handlePostInvoice = async (invoice: Invoice) => {
    if (!tenant) return;
    try {
      // Fetch line items for COGS calculation
      const { data: inv, error } = await supabase
        .from('sales_invoices')
        .select('id, invoice_number, invoice_date, total_amount, tax_amount, sales_invoice_line_items(quantity, unit_cost)')
        .eq('id', invoice.id)
        .eq('tenant_id', tenant.id)
        .single();
      if (error) throw error;

      const taxAmount = inv.tax_amount ?? Math.max(0, inv.total_amount - (inv.sales_invoice_line_items?.reduce((s: number, li: any)=> s + (li.quantity * li.unit_cost), 0) || 0));
      const cogs = (inv.sales_invoice_line_items || []).reduce((s: number, li: any) => s + (Number(li.quantity) * Number(li.unit_cost || 0)), 0);
      const date = inv.invoice_date || new Date().toISOString().slice(0,10);

      await postARInvoice({ date, invoiceId: inv.invoice_number, amount: inv.total_amount - taxAmount, taxAmount });
      if (cogs > 0) {
        await postCOGS({ date, referenceId: inv.invoice_number, cogsAmount: cogs });
      }

      await supabase.from('sales_invoices').update({ posting_status: 'Posted', posted_at: new Date().toISOString() }).eq('id', invoice.id);
      await fetchSalesData();
    } catch (e: any) {
      setError(e.message);
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
    <AppLayout>
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
                      <TableHead>Posting</TableHead>
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
                        <TableCell>
                          <Badge variant={(invoice as any).posting_status === 'Posted' ? 'default' : 'outline'}>
                            {(invoice as any).posting_status || 'Draft'}
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
                              {(invoice as any).posting_status !== 'Posted' && (
                                <DropdownMenuItem onClick={() => handlePostInvoice(invoice)}>
                                  <span>Post Invoice</span>
                                </DropdownMenuItem>
                              )}
                              {invoice.payment_status !== 'Paid' && (
                                <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice.id, invoice.total_amount)}>
                                  <span>Receive Payment</span>
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
    </AppLayout>
  );
}
