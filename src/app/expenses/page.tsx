
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExpenseForm, Expense } from '@/components/ExpenseForm';
import ExpensesChart from '@/components/dashboard/ExpensesChart';
import { PageHeader } from '@/components/shared';
import AppLayout from '@/components/AppLayout';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('expenses').select('*');
      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    fetchExpenses();
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
          title="Expenses"
          description="Track and manage your business expenses."
        >
          <Button onClick={() => { setShowForm(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </PageHeader>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>

        <Card>
          <CardHeader>
            <CardTitle>Expense Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpensesChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
