-- Add posting status to sales_invoices for explicit posting flow
alter table sales_invoices
  add column if not exists posting_status text not null default 'Draft',
  add column if not exists posted_at timestamptz;

-- Optional: payment_status to support Receive Payment UX if missing
alter table sales_invoices
  add column if not exists payment_status text default 'Unpaid';
