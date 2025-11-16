"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface Row { code: string; rate: number; taxable: number; tax: number; }

export default function TaxReportPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [period, setPeriod] = useState<string>(new Date().toISOString().slice(0,7)); // YYYY-MM
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Get all tax codes
        const { data: codes, error: cErr } = await supabase.from('tax_codes').select('id, name, rate');
        if (cErr) throw cErr;

        // Pull tax liability credits in period from journal_entries where account is Tax Payable
        const periodStart = `${period}-01`;
        const periodEnd = `${period}-31`;
        const { data: taxAccount } = await supabase.from('accounts').select('id').eq('account_name', 'Tax Payable').single();
        const taxAccountId = (taxAccount as any)?.id;

        const { data: journal } = await supabase
          .from('journal_entries')
          .select('credit, debit, memo')
          .gte('journal_batches.date', periodStart)
          .lte('journal_batches.date', periodEnd)
          .eq('account_id', taxAccountId);

        // Sum tax by code name found in memo if present; otherwise aggregate total
        const map = new Map<string, Row>();
        (codes || []).forEach((c: any) => map.set(c.name, { code: c.name, rate: Number(c.rate || 0), taxable: 0, tax: 0 }));

        (journal || []).forEach((j: any) => {
          const amt = Number(j.credit || 0) - Number(j.debit || 0);
          // Attempt to parse tax code from memo like "Invoice tax ... (CODE)"; fallback to 'Total'
          const memo: string = j.memo || '';
          const match = memo.match(/\(([^)]+)\)$/);
          const code = match?.[1] || 'Total';
          if (!map.has(code)) map.set(code, { code, rate: 0, taxable: 0, tax: 0 });
          const row = map.get(code)!;
          row.tax += amt;
          if (row.rate > 0) row.taxable += amt / row.rate; // approximate taxable base if rate is known
        });

        setRows(Array.from(map.values()));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Tax Report</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && !error && (
            <>
              <div className="mb-4">
                <label className="text-sm text-muted-foreground mr-2">Period (YYYY-MM)</label>
                <input className="border rounded px-2 py-1" value={period} onChange={(e) => setPeriod(e.target.value)} />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax Code</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">Taxable</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map(r => (
                    <TableRow key={r.code}>
                      <TableCell>{r.code}</TableCell>
                      <TableCell className="text-right">{(r.rate * 100).toFixed(2)}%</TableCell>
                      <TableCell className="text-right">${r.taxable.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${r.tax.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
