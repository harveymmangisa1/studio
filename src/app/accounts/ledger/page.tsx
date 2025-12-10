'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useTenant } from '@/lib/tenant';

interface LedgerEntry {
  id: string;
  transaction_date: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  account_id: string;
  account_name: string; // Assuming we can join to get account name
  account_code: string; // Assuming we can join to get account code
  reference_type?: string;
  reference_id?: string;
}

export default function GeneralLedgerPage() {
  const { tenant } = useTenant();
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant) return;
    const fetchLedgerEntries = async () => {
      try {
        const { data, error } = await supabase
          .from('ledger_entries')
          .select(`
            id,
            transaction_date,
            description,
            debit_amount,
            credit_amount,
            account_id,
            accounts (account_name, account_code),
            reference_type,
            reference_id
          `)
          .eq('tenant_id', tenant.id)
          .order('transaction_date', { ascending: true }); // Order by ascending for running balance

        if (error) {
          throw error;
        }

        // Transform the data to flatten the account name and code
        const transformedData = data.map((entry: any) => ({
          ...entry,
          account_name: entry.accounts.account_name,
          account_code: entry.accounts.account_code,
        }));

        setEntries(transformedData || []);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLedgerEntries();
  }, [tenant]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>General Ledger</CardTitle>
          <CardDescription>A complete record of all financial transactions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.transaction_date).toLocaleDateString()}</TableCell>
                  <TableCell>{entry.account_name}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell className="text-right">{entry.debit_amount?.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{entry.credit_amount?.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
