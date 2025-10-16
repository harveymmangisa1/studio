'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

interface InvoiceDetails {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  total_amount: number;
  payment_status: string;
  invoice_date: string;
  due_date: string;
  line_items: any[];
  subtotal: number;
  tax: number;
}

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  const fetchInvoiceDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales_invoices')
        .select('*, customers:customers(*), sales_invoice_line_items:sales_line_items(*, products:products(*))')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const subtotal = (data.sales_invoice_line_items || []).reduce((acc: any, item: any) => acc + item.quantity * item.unit_price, 0);
        const tax = data.total_amount - subtotal;

        setInvoice({
          id: data.id,
          invoice_number: data.invoice_number,
          customer_name: data.customers.name,
          customer_email: data.customers.email,
          customer_address: data.customers.address,
          total_amount: data.total_amount,
          payment_status: data.payment_status,
          invoice_date: data.invoice_date,
          due_date: data.due_date,
          line_items: data.sales_invoice_line_items,
          subtotal,
          tax,
        });
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading invoice details...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!invoice) {
    return <div>Invoice not found.</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-4 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Invoice {invoice.invoice_number}</h1>
          <p className="text-muted-foreground">Issued on {new Date(invoice.invoice_date).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={invoice.payment_status === 'Paid' ? 'success' : 'destructive'}>
            {invoice.payment_status}
          </Badge>
          <Button variant="outline" onClick={() => window.print()}>Print</Button>
          <Button onClick={() => {
            console.log('Sending invoice...');
            toast({ title: 'Invoice Sent', description: `Invoice ${invoice.invoice_number} has been sent to ${invoice.customer_name}.` });
          }}>Send</Button>
        </div>
      </div>

      {/* Invoice Details */}
      <Card>
        <CardContent className="p-6 grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <h3 className="font-semibold">Billed To:</h3>
            <div className="text-muted-foreground">
              <p className="font-medium text-slate-700">{invoice.customer_name}</p>
              <p>{invoice.customer_address}</p>
              <p>{invoice.customer_email}</p>
            </div>
          </div>
          <div className="grid gap-2 text-left md:text-right">
            <h3 className="font-semibold">Invoice Details:</h3>
            <div className="text-muted-foreground">
              <p><strong>Invoice Number:</strong> {invoice.invoice_number}</p>
              <p><strong>Invoice Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
              <p><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.line_items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.products.name}</p>
                    <p className="text-sm text-muted-foreground">{item.products.description}</p>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-full max-w-xs space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>${invoice.tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${invoice.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
