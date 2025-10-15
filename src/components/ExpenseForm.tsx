'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { createDoubleEntryTransaction } from '@/lib/ledger';

const expenseSchema = z.object({
  id: z.string().optional(),
  expense_date: z.string().min(1, 'Expense date is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
});

export type Expense = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSuccess: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const form = useForm<Expense>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_date: new Date().toISOString().split('T')[0],
      category: '',
      description: '',
      amount: 0,
    },
  });

  async function onSubmit(data: Expense) {
    try {
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .insert(data)
        .select('id')
        .single();

      if (expenseError) throw expenseError;

      // Create ledger entries
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('id, account_name')
        .in('account_name', [data.category, 'Cash']); // Assuming expense category matches account name

      if (accountsError) throw accountsError;

      const expenseAccountId = accounts.find(a => a.account_name === data.category)?.id;
      const cashAccountId = accounts.find(a => a.account_name === 'Cash')?.id;

      if (!expenseAccountId || !cashAccountId) {
        throw new Error('Could not find required accounts for transaction.');
      }

      await createDoubleEntryTransaction([
        { accountId: expenseAccountId, debit: data.amount, credit: 0 },
        { accountId: cashAccountId, debit: 0, credit: data.amount },
      ]);

      onSuccess();
    } catch (error: any) {
      alert(`Error creating expense: ${error.message}`);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="expense_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Supplies">Supplies</SelectItem>
                  <SelectItem value="Labor">Labor</SelectItem>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Office rent for May" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="100.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Save Expense
        </Button>
      </form>
    </Form>
  );
}
