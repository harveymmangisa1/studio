'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  sku: z.string().min(1, 'SKU is required'),
  cost: z.coerce.number().min(0, 'Cost price must be non-negative'),
  price: z.coerce.number().min(0, 'Selling price must be non-negative'),
  quantity: z.coerce.number().int().min(0, 'Stock quantity must be non-negative'),
});

export type Product = z.infer<typeof productSchema>;

interface ProductFormProps {
  product: Product | null;
  onSuccess: (product: Product) => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const form = useForm<Product>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      name: '',
      category: '',
      sku: '',
      cost: 0,
      price: 0,
      quantity: 0,
    },
  });

  function onSubmit(data: Product) {
    onSuccess(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Wireless Mouse" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="Electronics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input placeholder="WM-001" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="15.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="29.99" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormControl>
                <Input type="number" placeholder="150" {...field} />
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <Button type="submit" className="w-full">
          {product ? 'Save Changes' : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
}
