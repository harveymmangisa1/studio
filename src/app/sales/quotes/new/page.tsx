'use client';

import { QuoteForm } from '@/components/QuoteForm';
import { PageHeader } from '@/components/shared';

export default function NewQuotePage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="New Quotation"
        description="Create a new sales quotation for a potential customer."
      />
      <QuoteForm />
    </div>
  );
}
