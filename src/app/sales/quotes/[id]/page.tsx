'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { DocumentHeader } from '@/components/DocumentHeader';

// Mock data since we don't have a quotes table yet
const MOCK_QUOTES = [
  { id: '1', quote_number: 'QT-001', customer_name: 'Prospect Inc.', total_amount: 1500, status: 'Sent', quote_date: '2024-05-20', expiry_date: '2024-06-20', customer_email: 'contact@prospect.inc', customer_address: '123 Prospect Ave, Innovation City', line_items: [{ id: 1, products: { name: 'Ergonomic Chair' }, quantity: 5, unit_price: 250 }], subtotal: 1250, tax: 250 },
  { id: '2', quote_number: 'QT-002', customer_name: 'Lead Ventures', total_amount: 3200, status: 'Accepted', quote_date: '2024-05-18', expiry_date: '2024-06-18', customer_email: 'deals@leadventures.com', customer_address: '456 Venture Rd, Growth Town', line_items: [{ id: 1, products: { name: 'Mechanical Keyboard' }, quantity: 20, unit_price: 100 }], subtotal: 2000, tax: 1200 },
];

interface QuoteDetails {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string;
  customer_address: string;
  total_amount: number;
  status: string;
  quote_date: string;
  expiry_date: string;
  line_items: any[];
  subtotal: number;
  tax: number;
}

export default function QuoteDetailsPage() {
  const { id } = useParams();
  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchQuoteDetails();
    }
  }, [id]);

  const fetchQuoteDetails = async () => {
    setLoading(true);
    // This is mocked. In a real app, you would fetch from supabase
    const foundQuote = MOCK_QUOTES.find(q => q.id === id);
    if (foundQuote) {
      setQuote(foundQuote);
    } else {
      setError('Quotation not found.');
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading quotation details...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!quote) {
    return <div>Quotation not found.</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-4 sm:p-8">
      <div className="flex justify-end gap-2 no-print">
        <Button variant="outline" onClick={() => window.print()}>Download PDF</Button>
        <Button onClick={() => {
          console.log('Sending quote...');
          toast({ title: 'Quotation Sent', description: `Quotation ${quote.quote_number} has been sent to ${quote.customer_name}.` });
        }}>Send Quotation</Button>
      </div>

      <div id="printable-area">
        <DocumentHeader title="QUOTATION" documentId={quote.quote_number} />

        <Card className="mb-8">
          <CardContent className="p-6 grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <h3 className="font-semibold">Prepared For:</h3>
              <div className="text-muted-foreground">
                <p className="font-medium text-slate-700">{quote.customer_name}</p>
                <p>{quote.customer_address}</p>
                <p>{quote.customer_email}</p>
              </div>
            </div>
            <div className="grid gap-2 text-left md:text-right">
              <h3 className="font-semibold">Quotation Details:</h3>
              <div className="text-muted-foreground">
                <p><strong>Quotation Number:</strong> {quote.quote_number}</p>
                <p><strong>Quote Date:</strong> {new Date(quote.quote_date).toLocaleDateString()}</p>
                <p><strong>Expiry Date:</strong> {new Date(quote.expiry_date).toLocaleDateString()}</p>
                 <Badge variant={quote.status === 'Accepted' ? 'default' : 'outline'} className="mt-2 w-fit ml-auto">
                    {quote.status}
                  </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
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
                {quote.line_items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.products.name}</p>
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

        <div className="flex justify-end">
          <div className="w-full max-w-xs space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${quote.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${quote.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${quote.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
