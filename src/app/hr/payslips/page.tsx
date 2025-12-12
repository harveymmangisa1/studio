'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/components/AppLayout';

interface PayslipRow {
  id: string;
  employee_id: string;
  employee_name: string;
  period: string; // e.g., 'Jan 2025'
  gross: number;
  deductions: number;
  net: number;
  status: string; // Issued/Pending
  issued_at: string | null;
}

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<PayslipRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PayslipRow | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('payslips')
          .select('id, employee_id, period, gross, deductions, net, status, issued_at, employees(name)')
          .order('issued_at', { ascending: false });
        if (error) throw error;
        const mapped: PayslipRow[] = (data || []).map((r: any) => ({
          id: r.id,
          employee_id: r.employee_id,
          employee_name: r.employees?.name || 'Employee',
          period: r.period,
          gross: Number(r.gross || 0),
          deductions: Number(r.deductions || 0),
          net: Number(r.net || 0),
          status: r.status || 'Issued',
          issued_at: r.issued_at,
        }));
        setPayslips(mapped);
      } catch (e) {
        console.error('Failed to load payslips', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payslips;
    return payslips.filter(p =>
      p.employee_name.toLowerCase().includes(q) ||
      p.period.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
    );
  }, [search, payslips]);

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <PageHeader title="Payslip History" description="Review employees' payslips by period and status." />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-center">
            <Input placeholder="Search by employee, period, or status" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Payslips ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Deductions</TableHead>
                <TableHead className="text-right">Net</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issued On</TableHead>
                <TableHead className="w-[110px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.employee_name}</TableCell>
                  <TableCell>{p.period}</TableCell>
                  <TableCell className="text-right">{p.gross.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{p.deductions.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">{p.net.toLocaleString()}</TableCell>
                  <TableCell>{p.status}</TableCell>
                  <TableCell>{p.issued_at ? new Date(p.issued_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(p)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => window.print()}>
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">No payslips found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Payslip Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-gray-500">Employee</div>
                  <div className="font-medium">{selected.employee_name}</div>
                </div>
                <div>
                  <div className="text-gray-500">Period</div>
                  <div className="font-medium">{selected.period}</div>
                </div>
                <div>
                  <div className="text-gray-500">Gross</div>
                  <div className="font-medium">{selected.gross.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Deductions</div>
                  <div className="font-medium">{selected.deductions.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Net</div>
                  <div className="font-medium">{selected.net.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Status</div>
                  <div className="font-medium">{selected.status}</div>
                </div>
                <div>
                  <div className="text-gray-500">Issued On</div>
                  <div className="font-medium">{selected.issued_at ? new Date(selected.issued_at).toLocaleDateString() : '-'}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AppLayout>
  );
}
