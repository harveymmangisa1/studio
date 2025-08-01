'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const invoiceSchema = z.object({
  customer: z.string().min(1, 'Customer is required'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.coerce.number().min(1),
    price: z.coerce.number().min(0),
  })).min(1, 'At least one item is required'),
  tax: z.coerce.number().min(0).optional(),
  discount: z.coerce.number().min(0).optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const products = [
  { id: '1', name: 'Wireless Mouse', price: 29.99 },
  { id: '2', name: 'Mechanical Keyboard', price: 99.99 },
  { id: '3', name: 'Ergonomic Chair', price: 249.99 },
  { id: '4', name: 'Desk Lamp', price: 45.00 },
  { id: '5', name: 'Coffee Mug', price: 12.99 },
  { id: '6', name: 'Laptop Stand', price: 59.99 },
];

export default function CreateInvoicePage() {
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      items: [{ productId: '', quantity: 1, price: 0 }],
      tax: 10,
      discount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchItems = form.watch('items');
  const watchTax = form.watch('tax') || 0;
  const watchDiscount = form.watch('discount') || 0;

  const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const totalTax = subtotal * (watchTax / 100);
  const total = subtotal + totalTax - watchDiscount;
  
  function onSubmit(data: InvoiceFormValues) {
    console.log(data);
    // In a real app, you'd submit this to your backend and show a toast
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Create New Invoice</h1>
        <p className="text-muted-foreground">Fill out the form below to generate a new invoice.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoiceDate"
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Add products to the invoice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  <div className="md:col-span-6">
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product</FormLabel>
                          <Select onValueChange={(value) => {
                              field.onChange(value);
                              const product = products.find(p => p.id === value);
                              if (product) {
                                form.setValue(`items.${index}.price`, product.price);
                              }
                          }} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qty</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.price`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input type="number" readOnly {...field} className="bg-muted" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-end">
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
              ))}
               <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => append({ productId: '', quantity: 1, price: 0 })}
              >
                Add Item
              </Button>
            </CardContent>
            <CardFooter className="flex justify-end">
                <div className="w-full max-w-sm space-y-4">
                    <Separator/>
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span>Discount</span>
                        <FormField control={form.control} name="discount" render={({field}) => <Input type="number" {...field} className="w-24 text-right"/>}/>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Tax (%)</span>
                         <FormField control={form.control} name="tax" render={({field}) => <Input type="number" {...field} className="w-24 text-right"/>}/>
                    </div>
                     <Separator/>
                     <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </CardFooter>
          </Card>
          
          <div className="flex justify-end">
            <Button type="submit" size="lg">Create Invoice</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
