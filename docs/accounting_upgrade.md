# Accounting Upgrade Plan (QuickBooks-like)

This update introduces:
- Journal batches (journal_batches) and journal entries (journal_entries)
- Posting helpers in src/lib/ledger.ts (postARInvoice, postARPayment, postCOGS, reverseJournalBatch)
- Trial Balance page: /accounts/trial-balance
- Calculations updated to read from journal_entries
- AP scaffolding tables (bills, bill_line_items, bill_payments) and tax_codes

## Apply database migrations
Run the SQL file against your Supabase/Postgres database:

- File: docs/migrations/001_accounting_core.sql

This creates the necessary tables and columns.

## Configure accounts
Ensure the following accounts exist:
- Accounts Receivable (Asset)
- Cash (Asset) and/or Bank (Asset)
- Sales Revenue (Revenue)
- Tax Payable (Liability)
- Inventory (Asset)
- Cost of Goods Sold (Expense)

## Usage in code
- Use ledger helpers to post documents:
```
await postARInvoice({ date: '2025-01-15', invoiceId: 'INV-1001', amount: 250, taxAmount: 37.5 });
await postCOGS({ date: '2025-01-15', referenceId: 'INV-1001', cogsAmount: 110 });
await postARPayment({ date: '2025-01-20', receiptId: 'RCPT-2001', amount: 250, cashAccountName: 'Bank' });
```

## Reports
- Trial Balance: navigate to /accounts/trial-balance
- Profit & Loss and Balance Sheet use journal_entries via src/lib/calculations.ts

## Next steps
- AP (Bills) UI and posting helpers
- Bank reconciliation and statements
- Tax codes usage and reports
- Period closing and reversing entries UI
