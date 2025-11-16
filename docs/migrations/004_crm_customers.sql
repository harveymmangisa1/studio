-- CRM: Lightweight Customer Relationship Management additions for Phase 1 MVP
-- Per-tenant isolation with composite primary keys (tenant_id, id)
-- Basic CRM tables: customers, customer_contacts, customer_notes, customer_interactions

BEGIN;

-- 1) Customers table
CREATE TABLE IF NOT EXISTS customers (
  tenant_id UUID NOT NULL,
  id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  credit_terms TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  PRIMARY KEY (tenant_id, id)
);

-- Unique per-tenant email for quick lookup (optional, can be removed if not desired)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_tenant_email ON customers (tenant_id, email);

-- 2) Customer contacts (additional contact methods)
CREATE TABLE IF NOT EXISTS customer_contacts (
  tenant_id UUID NOT NULL,
  id UUID NOT NULL,
  customer_id UUID NOT NULL,
  contact_type TEXT,
  value TEXT,
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id, customer_id) REFERENCES customers(tenant_id, id) ON DELETE CASCADE
);

-- 3) Customer notes (unstructured interactions)
CREATE TABLE IF NOT EXISTS customer_notes (
  tenant_id UUID NOT NULL,
  id UUID NOT NULL,
  customer_id UUID NOT NULL,
  note TEXT,
  author_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id, customer_id) REFERENCES customers(tenant_id, id) ON DELETE CASCADE
);

-- 4) Customer interactions (structured interactions)
CREATE TABLE IF NOT EXISTS customer_interactions (
  tenant_id UUID NOT NULL,
  id UUID NOT NULL,
  customer_id UUID NOT NULL,
  type TEXT,
  detail TEXT,
  interaction_date TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ,
  PRIMARY KEY (tenant_id, id),
  FOREIGN KEY (tenant_id, customer_id) REFERENCES customers(tenant_id, id) ON DELETE CASCADE
);

-- 5) Enable RLS and policies (illustrative – adapt to app context)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;

-- Policies: use a consistent setting like app.tenant_id; implement per your session setup
CREATE POLICY IF NOT EXISTS tenant_isolation_customers ON customers
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS tenant_isolation_customer_contacts ON customer_contacts
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS tenant_isolation_customer_notes ON customer_notes
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

CREATE POLICY IF NOT EXISTS tenant_isolation_customer_interactions ON customer_interactions
  USING (tenant_id = current_setting('app.tenant_id')::uuid);

COMMIT;
