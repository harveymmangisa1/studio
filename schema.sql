-- Create the tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    industry VARCHAR(255),
    timezone VARCHAR(255) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    fiscal_year_end VARCHAR(5),
    created_at TIMESTAMPTZ DEFAULT now(),
    subscription_status VARCHAR(50),
    subscription_tier VARCHAR(50),
    max_users INT,
    max_products INT,
    max_transactions_per_month INT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the tenant_users table
CREATE TABLE tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL,
    invited_by UUID,
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

-- Create the users table (assuming you are using Supabase Auth, this might be managed by Supabase)
-- This is a simplified representation.
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the tenant_settings table
CREATE TABLE tenant_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    logo_url VARCHAR(255),
    invoice_header_text TEXT,
    default_tax_rate DECIMAL(5, 4),
    default_currency VARCHAR(3),
    business_address VARCHAR(255),
    business_phone VARCHAR(50),
    business_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the products table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT current_tenant_id() REFERENCES tenants(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    cost_price DECIMAL(10, 2),
    selling_price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    reorder_point INT,
    warehouse_id UUID,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (tenant_id, id),
    UNIQUE (tenant_id, sku)
);

-- Create the sales_invoices table
CREATE TABLE sales_invoices (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT current_tenant_id() REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    customer_id UUID,
    customer_name VARCHAR(255),
    subtotal DECIMAL(10, 2),
    tax_rate DECIMAL(5, 4),
    tax_amount DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    payment_status VARCHAR(50),
    payment_date DATE,
    payment_method VARCHAR(50),
    invoice_date DATE,
    due_date DATE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (tenant_id, id),
    UNIQUE (tenant_id, invoice_number)
);

-- Create the sales_line_items table
CREATE TABLE sales_line_items (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT current_tenant_id() REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INT,
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (tenant_id, id)
);

-- Create the stock_movements table
CREATE TABLE stock_movements (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT current_tenant_id() REFERENCES tenants(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    movement_type VARCHAR(50),
    quantity INT,
    reason VARCHAR(255),
    reference_document VARCHAR(255),
    warehouse_from UUID,
    warehouse_to UUID,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (tenant_id, id)
);

-- Create the customers table
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT current_tenant_id() REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address VARCHAR(255),
    city VARCHAR(100),
    credit_terms VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (tenant_id, id)
);

-- Create the expenses table
CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT current_tenant_id() REFERENCES tenants(id) ON DELETE CASCADE,
    category VARCHAR(100),
    amount DECIMAL(10, 2),
    description TEXT,
    supplier_id UUID,
    expense_date DATE,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (tenant_id, id)
);

-- Create the suppliers table
CREATE TABLE suppliers (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT current_tenant_id() REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    payment_terms VARCHAR(50),
    address VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (tenant_id, id)
);

-- Create the accounts table
CREATE TABLE accounts (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT current_tenant_id() REFERENCES tenants(id) ON DELETE CASCADE,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    parent_account_id UUID REFERENCES accounts(id),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    balance DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (tenant_id, id),
    UNIQUE (tenant_id, account_code)
);

-- Create the ledger_entries table
CREATE TABLE ledger_entries (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT current_tenant_id() REFERENCES tenants(id) ON DELETE CASCADE,
    account_id UUID NOT NULL,
    debit_amount DECIMAL(12, 2),
    credit_amount DECIMAL(12, 2),
    transaction_date DATE,
    reference_type VARCHAR(50),
    reference_id UUID,
    description TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (tenant_id, id)
);

-- Create the audit_log table
CREATE TABLE audit_log (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT current_tenant_id() REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID,
    action VARCHAR(255),
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMPTZ DEFAULT now(),
    ip_address VARCHAR(50),
    PRIMARY KEY (tenant_id, id)
);

-- Add foreign key constraints
ALTER TABLE tenant_users ADD CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id);
-- Assuming users table is managed by Supabase Auth, so user_id might not have a direct FK constraint in the same way
-- ALTER TABLE tenant_users ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE tenant_settings ADD CONSTRAINT fk_tenant_settings FOREIGN KEY (tenant_id) REFERENCES tenants(id);

ALTER TABLE sales_invoices ADD CONSTRAINT fk_customer FOREIGN KEY (tenant_id, customer_id) REFERENCES customers(tenant_id, id);

ALTER TABLE sales_line_items ADD CONSTRAINT fk_invoice FOREIGN KEY (tenant_id, invoice_id) REFERENCES sales_invoices(tenant_id, id);
ALTER TABLE sales_line_items ADD CONSTRAINT fk_product FOREIGN KEY (tenant_id, product_id) REFERENCES products(tenant_id, id);

ALTER TABLE stock_movements ADD CONSTRAINT fk_product_stock FOREIGN KEY (tenant_id, product_id) REFERENCES products(tenant_id, id);

ALTER TABLE expenses ADD CONSTRAINT fk_supplier FOREIGN KEY (tenant_id, supplier_id) REFERENCES suppliers(tenant_id, id);

ALTER TABLE accounts ADD CONSTRAINT fk_parent_account FOREIGN KEY (tenant_id, parent_account_id) REFERENCES accounts(tenant_id, id);

ALTER TABLE ledger_entries ADD CONSTRAINT fk_account FOREIGN KEY (tenant_id, account_id) REFERENCES accounts(tenant_id, id);

-- Enable Row-Level Security (RLS) for all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- JWT-based tenant helper and RLS Policies

create or replace function current_tenant_id()
returns uuid
language sql
stable
as $$
  select (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid;
$$;

CREATE POLICY "Enable read access for user's tenant" ON tenants
FOR SELECT USING (id = current_tenant_id());

CREATE POLICY "Enable read access for user's tenant" ON tenant_users
FOR SELECT USING (tenant_id = current_tenant_id());

CREATE POLICY "Enable read access for user's tenant" ON tenant_settings
FOR SELECT USING (tenant_id = current_tenant_id());

CREATE POLICY "Enable access for user's tenant" ON products
FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "Enable access for user's tenant" ON sales_invoices
FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "Enable access for user's tenant" ON sales_line_items
FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "Enable access for user's tenant" ON stock_movements
FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "Enable access for user's tenant" ON customers
FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "Enable access for user's tenant" ON expenses
FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "Enable access for user's tenant" ON suppliers
FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "Enable access for user's tenant" ON accounts
FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "Enable access for user's tenant" ON ledger_entries
FOR ALL USING (tenant_id = current_tenant_id());

CREATE POLICY "Enable access for user's tenant" ON audit_log
FOR ALL USING (tenant_id = current_tenant_id());
