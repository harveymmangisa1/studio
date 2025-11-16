"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Row {
  account_id: string;
  account_name: string;
  account_code: string;
  account_type: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function TrialBalancePage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTB = async () => {
      try {
        const { data: accounts, error: accErr } = await supabase
          .from('accounts')
          .select('id, account_name, account_code, account_type');
        if (accErr) throw accErr;

        const { data: journals, error: jErr } = await supabase
          .from('journal_entries')
          .select('account_id, debit, credit');
        if (jErr) throw jErr;

        const byAccount = new Map<string, Row>();
        (accounts || []).forEach((a: any) => {
          byAccount.set(a.id, {
            account_id: a.id,
            account_name: a.account_name,
            account_code: a.account_code,
            account_type: a.account_type,
            debit: 0,
            credit: 0,
            balance: 0,
          });
        });

        (journals || []).forEach((j: any) => {
          const r = byAccount.get(j.account_id);
          if (!r) return;
          r.debit += Number(j.debit || 0);
          r.credit += Number(j.credit || 0);
        });

        // Compute balance by account type normal balance convention
        const result: Row[] = [];
        byAccount.forEach((r) => {
          let bal = 0;
          if (['Asset', 'Expense'].includes(r.account_type)) {
            bal = r.debit - r.credit;
          } else {
            bal = r.credit - r.debit;
          }
          result.push({ ...r, balance: bal });
        });

        setRows(result.sort((a, b) => a.account_code.localeCompare(b.account_code)));
      } catch (e: any) {
        setError(e.message || 'Failed to load trial balance');
      } finally {
        setLoading(false);
      }
    };
    fetchTB();
  }, []);

  const totals = rows.reduce((acc, r) => {
    acc.debit += r.debit;
    acc.credit += r.credit;
    return acc;
  }, { debit: 0, credit: 0 });

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.account_id}>
                    <TableCell>{r.account_code}</TableCell>
                    <TableCell>{r.account_name}</TableCell>
                    <TableCell className="text-right">${r.debit.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${r.credit.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell className="font-medium">Total</TableCell>
                  <TableCell className="text-right font-medium">${totals.debit.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-medium">${totals.credit.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
