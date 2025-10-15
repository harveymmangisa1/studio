'use client';

import { InvoiceForm } from '@/components/InvoiceForm';

export default function NewInvoicePage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">New Invoice</h1>
        <p className="text-muted-foreground">Create a new sales invoice for a customer.</p>
      </div>
      <InvoiceForm />
    </div>
  );
}