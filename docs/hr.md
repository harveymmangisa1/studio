Build an Advanced HR + Payroll + Staff Management module for our system using Next.js (App Router + TypeScript) with Tailwind CSS, shadcn/ui, and a PostgreSQL database via Prisma ORM.
The module should include full HR, Payroll, and Employee Management capabilities, inspired by leading HR platforms like BambooHR, Zoho People, and Gusto, while maintaining QuickBooks-style payroll and accounting compatibility.
Structure the app for future AI integration (predictive analytics, chat-based insights, automation).

🧩 Core Requirements
1. Architecture

Use Next.js App Router (TypeScript) with a modular structure:

/app/hr
  /employees
  /payroll
  /attendance
  /performance
  /reports
/lib
/api
/components/hr
/hooks
/context


Use Prisma for ORM and schema definitions


Use Zustand or Context API for state management

Secure with role-based access: Admin, HR Manager, Employee

2. Core HR Management

Employee lifecycle (hire → onboard → promote → offboard)

Digital employee records (personal info, documents, certifications, emergency contacts)

Department and team structure (hierarchies, roles, supervisors)

Attendance & leave management (vacation, sick, custom types)

Shift scheduling and time tracking

Employee self-service dashboard

Automated document generation (offer letters, contracts)

3. Payroll Management

Configurable salary structures (base pay, allowances, deductions, benefits)

Automated payroll with approval workflow

Tax and statutory deduction handling

Payslip generation (PDF + secure download)

Expense and reimbursement management

Exportable payroll reports (CSV, PDF, QuickBooks-style formats)

Optional API hooks for future banking/payment integration

4. Performance & Growth

Goal setting and OKR tracking

KPI metrics and review cycles

Peer feedback and appraisal management

Career history (promotions, achievements)

5. Analytics & Reporting

Dashboards for HR, attendance, payroll, and performance

Metrics: headcount, turnover, overtime, payroll costs, top performers

Exportable reports (CSV, PDF)

AI-ready analytics endpoints for future use:

e.g., “Predict next month’s payroll cost”

“Which employees have high attrition risk?”

“Show top-performing departments this quarter”

6. AI & Automation (Future-Ready Layer)

Create a /api/ai folder with placeholders for:


Natural language HR queries

Automated insights (leave trends, salary optimization)

Add modular utilities for future ML model hooks

7. UI & Experience

Elegant, minimalist UI using Tailwind CSS + shadcn/ui

Reusable components:

EmployeeCard

PayrollTable

LeaveCalendar

KPIChart

DashboardStats

Use React Hook Form + Zod for validation

Include dark mode toggle

8. Security & Compliance

Enforce role-based access (RBAC)

GDPR-compliant data handling and encryption

Maintain detailed audit logs of HR actions

Configurable approval workflows and e-signatures

⚙️ Tech Stack Summary

Framework: Next.js 15 (App Router, TypeScript)

Database: PostgreSQL

ORM: Prisma



UI: Tailwind CSS + shadcn/ui

Validation: Zod + React Hook Form

State Management: Zustand / Context API

AI Layer: LangChain / OpenAI SDK (placeholder endpoints)

Reports: jsPDF or pdfmake

🚀 Instructions for Cursor

Generate the folder structure and core routes based on /app/hr layout.

Implement Prisma schema models for Employee, Department, Attendance, Leave, Payroll, Expense, and PerformanceReview.

Scaffold dashboard pages and reusable UI components.

Create example API routes under /app/api/hr/... for CRUD operations.

Include placeholder AI endpoints under /app/api/ai/....

