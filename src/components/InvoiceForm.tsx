'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CustomerSelector } from './CustomerSelector';
import { InvoiceLineItems } from './InvoiceLineItems';
import { useState, useEffect } from 'react';
import { recordSale } from '../lib/ledger';

const invoiceSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  line_items: z.array(z.object({
    product_id: z.string().min(1, 'Product is required'),
    quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
    unit_price: z.coerce.number(),
  })).min(1, 'At least one line item is required'),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export function InvoiceForm() {
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
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

  async function onSubmit(data: InvoiceFormData) {
    try {
      // Create the invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('sales_invoices')
        .insert({
          customer_id: data.customer_id,
          invoice_date: data.invoice_date,
          due_date: data.due_date,
          subtotal: subtotal,
          tax_amount: tax,
          total_amount: total,
          payment_status: 'Unpaid',
        })
        .select('id')
        .single();

      if (invoiceError) throw invoiceError;

      // Create the line items
      const lineItemsData = data.line_items.map(item => ({
        invoice_id: invoiceData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }));

      const { error: lineItemsError } = await supabase.from('sales_line_items').insert(lineItemsData);

      if (lineItemsError) throw lineItemsError;

      // Deduct stock from inventory
      for (const item of data.line_items) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single();

        if (productError) throw productError;

        const newQuantity = product.stock_quantity - item.quantity;

        const { error: updateError } = await supabase
          .from('products')
          .update({ stock_quantity: newQuantity })
          .eq('id', item.product_id);

        if (updateError) throw updateError;

        // Log the stock movement
        const { error: movementError } = await supabase.from('stock_movements').insert({
          product_id: item.product_id,
          quantity: -item.quantity,
          movement_type: 'sale',
          reference_document: `Invoice #${invoiceData.id}`,
        });

        if (movementError) throw movementError;
      }
      // Create ledger entries
      const cogs = data.line_items.reduce(async (accPromise, item) => {
        const acc = await accPromise;
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('cost_price')
          .eq('id', item.product_id)
          .single();
        if (productError) throw productError;
        return acc + (product.cost_price * item.quantity);
      }, Promise.resolve(0));

      await recordSale(invoiceData.id, data.customer_id, total, await cogs);

      alert('Invoice created successfully!');
      form.reset();

    } catch (error: any) {
      alert(`Error creating invoice: ${error.message}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
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
                name="invoice_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
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

        <Button type="submit">Create Invoice</Button>
      </form>
    </Form>
  );
}
