-- Accounting core schema: journal batches and entries, account enhancements, AP scaffolding (tables only)

-- 1) Journal batches
create table if not exists journal_batches (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  description text,
  source_type text not null,
  source_id text,
  posted_by text,
  created_at timestamptz not null default now()
);

-- 2) Journal entries
create table if not exists journal_entries (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references journal_batches(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete restrict,
  debit numeric(14,2) not null default 0,
  credit numeric(14,2) not null default 0,
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists idx_journal_entries_batch on journal_entries(batch_id);
create index if not exists idx_journal_entries_account on journal_entries(account_id);

-- 3) Accounts: add normal_balance if missing
alter table accounts
  add column if not exists normal_balance text check (normal_balance in ('Debit','Credit'));

-- 4) Tax codes (for VAT/Sales Tax)
create table if not exists tax_codes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  rate numeric(6,4) not null,
  liability_account_id uuid not null references accounts(id) on delete restrict,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 5) AP scaffolding (bills)
create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid,
  bill_number text,
  date date not null,
  due_date date,
  subtotal numeric(14,2) not null default 0,
  tax numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  status text not null default 'Draft',
  created_at timestamptz not null default now()
);

create table if not exists bill_line_items (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references bills(id) on delete cascade,
  account_id uuid references accounts(id) on delete restrict,
  product_id uuid,
  description text,
  quantity numeric(14,4) not null default 1,
  unit_cost numeric(14,4) not null default 0,
  tax_code_id uuid references tax_codes(id) on delete set null,
  line_total numeric(14,2) generated always as (coalesce(quantity,0)*coalesce(unit_cost,0)) stored
);

create table if not exists bill_payments (
  id uuid primary key default gen_random_uuid(),
  bill_id uuid not null references bills(id) on delete cascade,
  date date not null,
  amount numeric(14,2) not null,
  method text,
  reference text,
  created_at timestamptz not null default now()
);
