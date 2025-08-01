import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const invoices = [
  { id: 'INV-001', customer: 'John Doe', date: '2023-10-26', amount: 129.98, status: 'Paid' },
  { id: 'INV-002', customer: 'Jane Smith', date: '2023-10-25', amount: 249.99, status: 'Paid' },
  { id: 'INV-003', customer: 'Acme Inc.', date: '2023-10-24', amount: 599.95, status: 'Pending' },
  { id: 'INV-004', customer: 'Peter Jones', date: '2023-10-23', amount: 45.00, status: 'Paid' },
  { id: 'INV-005', customer: 'Stark Industries', date: '2023-10-22', amount: 12.99, status: 'Overdue' },
];

export default function SalesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Sales Invoices</h1>
          <p className="text-muted-foreground">Create and manage customer invoices.</p>
        </div>
        <Link href="/sales/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>A list of your most recent sales invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.customer}</TableCell>
                  <TableCell className="hidden sm:table-cell">{invoice.date}</TableCell>
                  <TableCell>
                    <Badge variant={
                      invoice.status === 'Paid' ? 'default' : 
                      invoice.status === 'Pending' ? 'secondary' : 'destructive'
                    }>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">${invoice.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
