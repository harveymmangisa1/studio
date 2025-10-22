'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CustomerSelector } from './CustomerSelector';
import { InvoiceLineItems } from './InvoiceLineItems'; // Can reuse for quotes
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const quoteSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  quote_date: z.string().min(1, 'Quote date is required'),
  expiry_date: z.string().min(1, 'Expiry date is required'),
  line_items: z.array(z.object({
    product_id: z.string().min(1, 'Product is required'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    unit_price: z.coerce.number(),
  })).min(1, 'At least one line item is required'),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

export function QuoteForm() {
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      quote_date: new Date().toISOString().split('T')[0],
      expiry_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      line_items: [],
    },
  });

  const lineItems = form.watch('line_items');

  useEffect(() => {
    const newSubtotal = lineItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
    const newTax = newSubtotal * 0.075; // 7.5% tax rate
    const newTotal = newSubtotal + newTax;
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  }, [lineItems]);

  async function onSubmit(data: QuoteFormData) {
    try {
      // In a real app, you'd save this to a `quotes` table.
      // For now, we'll just show a success message.
      console.log('Quote data:', { ...data, total_amount: total });
      
      toast({
        title: "Quotation Created!",
        description: "The quotation has been saved as a draft.",
      });

      form.reset();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating quotation",
        description: error.message,
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Quotation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <FormControl>
                      <CustomerSelector onSelectCustomer={(customerId) => field.onChange(customerId)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quote_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quote Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            {/* We can reuse the InvoiceLineItems component here */}
            <InvoiceLineItems control={form.control} />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <div className="w-full md:w-1/3 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (7.5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="outline">Save as Draft</Button>
            <Button type="submit">Create & Send Quotation</Button>
        </div>
      </form>
    </Form>
  );
}
