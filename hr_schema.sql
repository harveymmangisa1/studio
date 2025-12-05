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
    updated_at TIMESTAMPTZ DEFAULT now(),
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

