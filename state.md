Enterprise-Grade Stock Management & Accounts System
Project Context
StockPaEasy is a multi-tenant SaaS platform built with Next.js 15, TypeScript, Supabase backend, Tailwind CSS, and shadcn/ui components. It combines essential inventory management with enterprise-grade financial accounting to serve small to medium-sized enterprises. Each tenant operates in complete data isolation with customizable settings and independent user management.

MVP Feature Priority Tiers
Tier 1: Core Functionality (MUST HAVE - Launch Ready)
1.1 Inventory & Stock Management

Real-time Stock Tracking: Display current stock levels with automated low-stock alerts and configurable reorder points
SKU Management: Create products with SKU, category, name, cost price, selling price, and stock quantity
Stock Movements & Audit Trail: Track all stock changes (additions, sales, adjustments) with reason, timestamp, and user attribution
Stock Valuation: Support FIFO and Weighted Average methods for COGS calculations
Stock Adjustment: Manual add/remove stock for damaged, lost, or reconciliation purposes with full audit trail
Product Categorization: Organize products by category with filtering capabilities
Product Listing: Search, filter, sort, and archive products with visual stock status indicators, Product Details Page, CSV Export
Inventory Value Calculation: Real-time total inventory value (quantity × cost price)
Multi-Warehouse Foundation: Database structure ready for future multi-warehouse expansion

1.2 Financial Accounting (Double-Entry System)

Chart of Accounts: Create and manage accounts with account hierarchies (Assets, Liabilities, Equity, Revenue, Expenses)
General Ledger: Record and display all transactions with debit/credit entries
Double-Entry Validation: Ensure all transactions balance (debits = credits)
Transaction Recording: Automatically create ledger entries for sales, purchases, and adjustments
Account Types: Support for asset, liability, equity, revenue, and expense accounts
Ledger Reconciliation: View accounts with running balances and transaction history
Audit Trail: Complete transaction history with who created/modified entries and when

1.3 Sales Management & Invoicing

Sales Invoice Creation: Form to select products, quantities, customer name, date, and payment method
Invoice Line Items: Add/remove multiple products to single invoice with dynamic calculations
Auto-Calculate: Subtotal, tax (configurable rate), and total amount with automatic ledger entry creation
Invoice Numbering: Auto-generated sequential invoice numbers
Invoice List: Display all sales with customer, total, date, and payment status
Invoice View/Print: Professional invoice layout with business details and print-ready formatting, Invoice Details Page, Send Invoice Functionality
Payment Status Tracking: Mark invoices as paid/unpaid with payment date tracking
Stock Deduction: Automatically reduce stock on invoice creation
Accounts Receivable: Track unpaid invoices and customer payment history
Invoice Export: Export to PDF for archiving and sharing

1.4 Accounts Receivable Management

Customer Management: Store customer names, contact details, and credit terms
Payment Tracking: Record payment dates and methods against invoices
Aging Report: View outstanding invoices aged 0-30, 30-60, 60-90 days overdue
Customer Invoice History: Display all invoices for each customer with payment status
Automatic Ledger Updates: AR account automatically updated when payments received

1.5 Expense Tracking & Accounts Payable

Add Expense: Form with category, amount, date, description, and supplier
Expense Categories: Predefined categories (Rent, Utilities, Supplies, Labor, Equipment, Other)
Expense List: View all expenses with filtering by category and date range
Expense Summary: Total expenses by month and category
Supplier Management: Track supplier details and expense history per supplier
Automatic Ledger Entries: Expenses automatically post to appropriate expense accounts
Accounts Payable Tracking: Track unpaid vendor invoices and payment schedules

1.6 Financial Reporting (Core Reports)

Dashboard - Key Metrics:

Total Sales (today, this month, all-time)
Gross Profit/Loss (sales revenue - COGS)
Net Profit/Loss (after expenses)
Total Inventory Value
Outstanding Receivables
Low Stock Alerts (products below reorder point)
Recent transactions feed


Profit & Loss Statement: Revenue, COGS, gross profit, expenses, net profit for selected period (daily, monthly, yearly)
Balance Sheet: Assets (inventory, cash), liabilities (payables), equity at point in time
Sales Report: Total sales by product, category, customer, and date range
Inventory Report: Current stock levels, inventory value, stock turnover rate
Expense Report: Total expenses by category and time period
Cash Flow Summary: Cash in (sales), cash out (expenses), net cash position
Accounts Receivable Aging Report: Aged breakdown of outstanding customer invoices
Accounts Payable Report: Outstanding supplier payments due

1.7 Dashboard & Analytics

Sales Chart: Line chart showing sales trend (last 7 days, 30 days, custom range)
Expense Breakdown: Pie chart of expenses by category
Inventory Status: Visual indicators (green/yellow/red) for stock levels
Quick Stats: Cards showing KPIs (total products, total inventory value, P&L) with functional links
Alerts Panel: Low stock warnings, overdue receivables, upcoming payables with functional links
Recent Activity: Last 10 transactions (sales, expenses, stock adjustments)
Date Range Selection: Ability to view metrics for custom periods

1.8 User Management & Roles

Authentication: Email/password login via Supabase Auth with session management
Multi-Tenant Isolation: Each user belongs to a tenant; complete data separation
Tenant Organization: Company/organization profiles with branding, settings, and metadata
User Roles:

Owner/Admin: Full system access, user management, all reports, tenant settings
Accountant: Financial records, journal entries, all reports, reconciliation
Sales Executive: Create sales invoices, customer management, sales reports
Warehouse Supervisor: Inventory management, stock adjustments, stock reports
Viewer: Read-only access to dashboards and reports


Role-Based Access Control: Users see only features and data relevant to their role and tenant
User Management: Admins can invite users, assign roles, deactivate users within their tenant
User Profile: Display logged-in user info with logout functionality
Password Reset: Self-service password reset via email
Tenant Switching: If user belongs to multiple tenants, ability to switch between them
Audit Trail: Track all user actions by tenant for compliance

1.9 Data Management & Compliance

Complete Audit Trail: All transactions logged with user, timestamp, action, before/after values, tenant attribution
Change History: Track modifications to products, invoices, and accounts per tenant
Data Validation: Real-time input validation (no duplicate SKUs, negative prices, insufficient stock)
Referential Integrity: Prevent deletion of products with transaction history
Segregation of Duties: Role-based permissions prevent unauthorized actions
Data Backup: Automatic Supabase backups with point-in-time recovery per tenant
Business Logic Validation: Prevent overselling, invalid entries, unbalanced transactions
Tenant Data Isolation: Row-level security ensures users can only access their tenant's data
Data Retention: Configurable data retention policies per tenant

1.10 Multi-Tenant Architecture

Tenant Provisioning: Automated onboarding process for new organizations
Unique Tenant Identifiers: UUID-based tenant IDs for data isolation
Shared Infrastructure: Efficient resource sharing while maintaining complete data separation
Tenant Settings: Customizable configuration per tenant (currency, tax rate, fiscal year, timezone)
Company Branding: Logo, company name, and customizable invoice headers per tenant
Tenant Quotas: Configurable limits on users, products, and monthly transactions per plan
Multi-Database Approach: Each tenant's data isolated at database level with RLS policies


Tier 2: Usability & Financial Features (SHOULD HAVE - Immediate Post-Launch)

Purchase Orders: Create POs with goods receipt matching against supplier invoices
Multi-Currency Support: Support for multiple currencies with exchange rates
Bank Reconciliation: Import bank statements and match against recorded transactions
Tax Compliance: Generate tax reports (VAT/GST) ready for filing
Budget Management: Create and monitor budgets against actual expenses
Bulk Import: CSV import for products and opening balances
Batch Invoice Printing: Print multiple invoices at once
Email Invoice Delivery: Send invoices to customers automatically
Mobile-Responsive Design: Full functionality on tablets and phones
Dark/Light Mode: User preference for display theme
Advanced Filtering: Filter and search across all modules
Data Export: Export reports to Excel, PDF, CSV formats
Approval Workflows: High-value transactions require approval
Multi-User Collaboration: Real-time updates across users

Tier 3: Advanced Features (NICE TO HAVE - Future Releases)

Multi-Warehouse Support: Track inventory across multiple locations with transfers
Barcode Scanning: Integration for barcode-based stock management
AI-Powered Reorder Suggestions: Based on sales velocity and historical patterns
Advanced Forecasting: Demand forecasting and seasonal analysis
Cost Accounting: Detailed costing by product, project, or department
Manufacturing Module: BOM (Bill of Materials) and production tracking
CRM Integration: Link sales to customer relationship management
Payment Gateway Integration: Accept online payments
Supplier Performance Analytics: Track on-time delivery, quality ratings
Scheduled Reports: Automatic report generation and email delivery
Custom Report Builder: Users can create tailored reports
API Integrations: Connect to e-commerce platforms, payment processors
Mobile Native App: iOS and Android applications
Advanced Security: 2FA, IP whitelisting, SSO integration


Technical Implementation Requirements
Database Schema (Supabase - Multi-Tenant)
Tenant & Auth Tables:
tenants (id UUID PRIMARY KEY, company_name, industry, subdomain, timezone, currency, 
         fiscal_year_end, created_at, subscription_status, subscription_tier, 
         max_users, max_products, max_transactions_per_month, updated_at)

tenant_users (id UUID, tenant_id UUID, user_id UUID, role, invited_by, 
              invited_at, accepted_at, is_active, updated_at)
  → UNIQUE(tenant_id, user_id)

users (id UUID PRIMARY KEY, email, password_hash, created_at, updated_at)

tenant_settings (id UUID, tenant_id UUID UNIQUE, logo_url, invoice_header_text, 
                 default_tax_rate, default_currency, business_address, 
                 business_phone, business_email, created_at, updated_at)
Core Business Tables (all include tenant_id for isolation):
products (id UUID, tenant_id UUID, sku, name, category, cost_price, selling_price, 
          stock_quantity, reorder_point, warehouse_id, is_archived, created_at, 
          updated_at)
  → COMPOSITE PRIMARY KEY(tenant_id, id)
  → UNIQUE(tenant_id, sku)

sales_invoices (id UUID, tenant_id UUID, invoice_number, customer_id UUID, 
                customer_name, subtotal, tax_rate, tax_amount, total_amount, 
                payment_status, payment_date, payment_method, invoice_date, 
                due_date, created_by UUID, created_at, updated_at)
  → COMPOSITE PRIMARY KEY(tenant_id, id)
  → UNIQUE(tenant_id, invoice_number)

sales_line_items (id UUID, tenant_id UUID, invoice_id UUID, product_id UUID, 
                  quantity, unit_price, total_price, created_at)
  → COMPOSITE PRIMARY KEY(tenant_id, id)

stock_movements (id UUID, tenant_id UUID, product_id UUID, movement_type, 
                 quantity, reason, reference_document, warehouse_from, 
                 warehouse_to, created_by UUID, created_at)
  → COMPOSITE PRIMARY KEY(tenant_id, id)

customers (id UUID, tenant_id UUID, name, email, phone, address, city, 
           credit_terms, created_at, updated_at)
  → COMPOSITE PRIMARY KEY(tenant_id, id)

expenses (id UUID, tenant_id UUID, category, amount, description, supplier_id UUID, 
          expense_date, created_by UUID, created_at, updated_at)
  → COMPOSITE PRIMARY KEY(tenant_id, id)

suppliers (id UUID, tenant_id UUID, name, email, phone, payment_terms, address, 
           created_at, updated_at)
  → COMPOSITE PRIMARY KEY(tenant_id, id)

accounts (id UUID, tenant_id UUID, account_code, account_name, account_type, 
          parent_account_id UUID, balance, created_at, updated_at)
  → COMPOSITE PRIMARY KEY(tenant_id, id)
  → UNIQUE(tenant_id, account_code)

ledger_entries (id UUID, tenant_id UUID, account_id UUID, debit_amount, 
                credit_amount, transaction_date, reference_type, reference_id UUID, 
                description, created_by UUID, created_at)
  → COMPOSITE PRIMARY KEY(tenant_id, id)

audit_log (id UUID, tenant_id UUID, user_id UUID, action, table_name, record_id UUID, 
           old_values JSONB, new_values JSONB, timestamp, ip_address)
  → COMPOSITE PRIMARY KEY(tenant_id, id)
  → INDEX(tenant_id, user_id, timestamp)
Row-Level Security (RLS) Policies:

All tables protected with RLS enabled
Users can only access data where tenant_id matches their authenticated tenant
Admin users can manage user roles and settings for their tenant only
Queries automatically filtered by current user's tenant context

Frontend Architecture
Pages (src/app):

/dashboard - Main dashboard with KPIs, charts, alerts
/inventory/products - Product CRUD, Product Details Page
/inventory/stock - Stock levels, adjustments, movements log
/sales/invoices - Invoice list, view, print, Invoice Details Page
/sales/create - New invoice form
/customers - Customer management
/expenses - Expense tracking
/accounts - Chart of accounts, general ledger
/reports/sales - Sales reports
/reports/profit-loss - P&L statement
/reports/balance-sheet - Balance sheet
/reports/cash-flow - Cash flow report
/reports/ar-aging - AR aging report
/reports/ap-summary - AP summary
/auth/login - Login page
/settings - Tax rate, reorder points, company info

Components (src/components):

ProductForm - Create/edit products
InvoiceForm - Create sales invoices
InvoiceLineItems - Dynamic line items with calculations
CustomerSelector - Select or create customer
DashboardCards - KPI metric cards
SalesChart - Sales trend visualization
ExpenseChart - Expense breakdown pie chart
StockAlerts - Low stock warning component
DataTable - Reusable table with sorting, filtering, pagination
FinancialStatements - P&L, Balance Sheet display
AuditLog - Transaction history viewer
Sidebar - Role-based navigation
Header - User profile, logout

Utilities (src/lib):

supabase.ts - Supabase client with tenant context
tenant.ts - Tenant ID extraction, tenant context provider
calculations.ts - P&L, balance sheet, tax calculations
ledger.ts - Double-entry accounting logic
formatting.ts - Currency, date formatting per tenant settings
validators.ts - Zod schemas for all forms
hooks.ts - Custom React hooks (useInvoices, useProducts, etc.) with tenant filtering
permissions.ts - Role-based access control and tenant isolation
rls.ts - Row-level security helpers for Supabase queries

State Management

React Query/TanStack Query for server state and data fetching
React Context for auth state and user preferences
React Hook Form for form state management
Zod for runtime validation

UI/UX Standards

shadcn/ui components exclusively for consistency
Tailwind CSS for styling with custom theme
Color Coding: Green (adequate/paid), Yellow (low/pending), Red (critical/overdue)
Loading States: Skeleton loaders on all data-fetching operations
Toast Notifications: Success, error, and warning messages
Responsive Design: Mobile-first, works on all devices
Accessibility: WCAG 2.1 Level AA compliance


MVP Definition of Done
A feature is launch-ready when:

✅ All Tier 1 features fully functional and tested (including Product Details, Invoice Details, Print/Send Invoice, CSV Export, Dashboard Links)
✅ Double-entry accounting validates correctly (debits = credits)
✅ Financial reports reconcile with underlying transactions
✅ Stock deductions accurate and match sales invoices
✅ Audit trail complete for all transactions
✅ UI responsive on desktop, tablet, and mobile
✅ All form validations prevent data corruption
✅ Real-time data updates from Supabase
✅ No console errors or warnings
✅ Page load times < 2 seconds
✅ Users can complete full workflows: product creation → invoice creation → financial reporting
✅ Role-based access control functioning properly
✅ Data persists correctly in Supabase
✅ Authentication and session management working
✅ Multi-tenancy setup with subdomain identification and RLS policies


Multi-Tenant SaaS Architecture
Tenant Data Isolation Strategy
1. Database-Level Isolation (Primary)

Every table includes tenant_id as part of composite primary key
Row-Level Security (RLS) enforced in Supabase: users can only query rows where tenant_id = current_tenant_id, set via the `set_current_tenant` database function which reads the `X-Tenant-Id` header.
No application-level trust; database enforces isolation
Prevents SQL injection attacks from exposing other tenants' data

2. Application-Level Context

Tenant ID extracted from authenticated user token or URL subdomain
All queries automatically filtered by tenant ID
React Context provides tenant information to all components
Middleware validates tenant access before rendering pages

3. Authentication Flow
User logs in → Supabase Auth returns user ID + custom claims with tenant_id
→ App stores tenant_id in Context/local state
→ All subsequent queries include tenant_id filter
→ RLS policies validate user belongs to that tenant
Tenant Identification Methods
Option 1: URL Subdomain (Recommended for SaaS)

acme.stockpaeasy.com → Extract "acme" as tenant identifier
User logs in with email password (not tenant-specific)
System looks up user's tenants and uses primary/requested tenant
Cleaner UX, easier branding per tenant

Option 2: URL Path

stockpaeasy.com/tenant/acme → Extract "acme" from path
Works with single domain, easier to deploy initially
Less elegant UX but simpler infrastructure

Option 3: Hybrid

Support both subdomain and path-based routing
Allow users to switch tenants via dashboard
Store last-used tenant in local state

Tenant Onboarding Flow (MVP)

Signup Page: New organization enters company name, email, password
Tenant Creation: System auto-creates tenant record with UUID
First User: Email user becomes Owner/Admin automatically
Initial Setup: User configures tenant settings (currency, tax rate, company details)
Invitation: Owner can invite additional users by email
Role Assignment: Owner assigns roles to invited users

Subscription & Quotas
Subscription Tiers (Post-MVP SaaS):

Free Tier: 1 user, 50 products, 50 invoices/month
Starter: 3 users, 500 products, 500 invoices/month
Pro: 10 users, 5,000 products, unlimited invoices
Enterprise: Unlimited users and transactions (custom pricing)

Quota Enforcement (MVP):

Check active user count before allowing new invitations
Check monthly transaction count on invoice creation
Display quota usage in tenant settings
Show upgrade prompts when nearing limits

Backup & Data Recovery

Automated Backups: Supabase handles automatic backups per tenant
Point-in-Time Recovery: Ability to restore tenant data to specific timestamp
Data Export: Users can export their complete data in standard formats
Account Deletion: Complete data removal when tenant account cancelled (with retention period)

Performance Considerations

Indexes: Create indexes on (tenant_id, common_filters) for query performance
Partitioning: Consider table partitioning by tenant_id for multi-billion row tables
Caching: Cache tenant settings at app level to reduce database queries
Query Optimization: Use prepared statements and connection pooling
Monitoring: Track per-tenant resource usage to detect abuse

Security Best Practices

No Cross-Tenant Queries: Queries must always include tenant_id filter
RLS Validation: Database-level RLS as defense-in-depth layer
Audit Logging: Every action logged with tenant_id and user_id
API Rate Limiting: Per-tenant rate limits to prevent abuse
Data Encryption: Encrypt sensitive fields (passwords, payment info) at application level
Access Logs: Track user login/logout per tenant for compliance

Multi-Tenant Considerations in MVP
In Scope:

Complete tenant data isolation in database schema
Tenant context middleware and routing
Role-based access control per tenant
Tenant-specific settings and customization
Multi-user support within tenant
Audit logging with tenant attribution
Tenant invitation system

Out of Scope (Post-MVP):

Subscription payment processing (Stripe integration)
Usage metering and quota enforcement UI
White-label branding options
Custom domain mapping
SSO (Single Sign-On) integration
Advanced tenant analytics dashboard


Development Workflow
Phase 1: Foundation & Accounting (Week 1-2)

Finalize Supabase schema with double-entry accounting structure
Build authentication system with role-based access
Create chart of accounts and ledger infrastructure
Build reusable components (forms, tables, cards)
Implement base layout and navigation

Phase 2: Inventory & Sales (Week 3)

Product CRUD with stock tracking
Sales invoice creation with automatic ledger entries
Stock movement tracking and audit trail
Inventory reporting

Phase 3: Financial Management (Week 4)

Accounts receivable and customer management
Expense tracking with ledger integration
Financial statement generation (P&L, Balance Sheet, Cash Flow)
AR aging and AP summary reports

Phase 4: Dashboard & Testing (Week 5)

Dashboard with KPI cards and charts
Alert system for low stock and overdue receivables
Activity feed and audit log viewer
User acceptance testing and bug fixes

Phase 5: Polish & Launch (Week 6)

Performance optimization
Security audit
Data validation hardening
Documentation and user guides
Production deployment


Success Criteria for MVP Launch

All Tier 1 features working without critical bugs
Financial records accurate to the cent
User can complete full workflow in < 3 minutes
Role-based access control enforced correctly
System handles 1,000+ products and 10,000+ transactions
Mobile interface confirmed working
Audit trail captures all changes
2 beta users successfully operate independently
Documentation ready for onboarding


Enterprise Features Prioritized in MVP
The following enterprise-grade features are prioritized in this MVP over typical basic systems:

Double-Entry Accounting - Full GAAP compliance from day one
Complete Audit Trail - Every transaction logged and traceable
Accounts Receivable - Professional customer invoice tracking
Accounts Payable - Supplier invoice and payment management
Financial Statements - P&L, Balance Sheet, Cash Flow generated automatically
Role-Based Access Control - Segregation of duties enforced
Real-Time Reconciliation - Inventory and financial data always in sync
Stock Valuation - FIFO/Weighted Average support for accurate COGS
Compliance Ready - Tax reporting and data backup built-in
Professional Reporting - Aging reports, cash flow analysis, expense breakdowns