-- Initial schema for the application

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
    settings JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the products table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    parent_account_id UUID,
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
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
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

-- RLS Policies

create or replace function set_current_tenant(tenant_id_input UUID)
returns void as $$
begin
  perform set_config('app.current_tenant_id', tenant_id_input::TEXT, FALSE);
end;
$$ language plpgsql SECURITY DEFINER;

CREATE POLICY "Enable read access for user's tenant" ON tenants
FOR SELECT USING (id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable read access for user's tenant" ON tenant_users
FOR SELECT USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable read access for user's tenant" ON tenant_settings
FOR SELECT USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON products
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON sales_invoices
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON sales_line_items
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON stock_movements
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON customers
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON expenses
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON suppliers
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON accounts
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON ledger_entries
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON audit_log
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));


-- HR Module Schema

-- Create the departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    parent_department_id UUID REFERENCES departments(id),
    manager_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, name)
);

-- Create the employees table
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID UNIQUE NOT NULL, -- Link to the users table in your auth schema
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255),
    department_id UUID REFERENCES departments(id),
    manager_id UUID REFERENCES employees(id),
    date_of_birth DATE,
    gender VARCHAR(50),
    contact_email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(50),
    hire_date DATE,
    termination_date DATE,
    employment_status VARCHAR(50), -- e.g., 'Active', 'On Leave', 'Terminated'
    contract_url VARCHAR(255),
    id_document_url VARCHAR(255),
    resume_url VARCHAR(255),
    certificates_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the attendance table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    status VARCHAR(50), -- e.g., 'Present', 'Absent', 'Late'
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, employee_id, date)
);

-- Create the leave table
CREATE TABLE leave (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'Pending', 'Approved', 'Rejected'
    reason TEXT,
    approved_by UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the performance_reviews table
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_date DATE NOT NULL,
    rating DECIMAL(3, 2),
    comments TEXT,
    goals TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the payroll table
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    gross_salary DECIMAL(10, 2) NOT NULL,
    deductions DECIMAL(10, 2) DEFAULT 0,
    net_salary DECIMAL(10, 2) NOT NULL,
    payment_date DATE,
    status VARCHAR(50), -- e.g., 'Pending', 'Paid'
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row-Level Security (RLS) for all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Enable access for user's tenant" ON departments
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON employees
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON attendance
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON leave
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON performance_reviews
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));

CREATE POLICY "Enable access for user's tenant" ON payroll
FOR ALL USING (tenant_id = (SELECT current_setting('app.current_tenant_id')::UUID));
