'use client';

import { InvoiceForm } from '@/components/InvoiceForm';
import { PageHeader } from '@/components/shared';

export default function NewInvoicePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="New Invoice"
        description="Create a new sales invoice for a customer."
      />
      <InvoiceForm />
    </div>
  );
}