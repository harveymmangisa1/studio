# StockPaEasy Business Setup & Onboarding Prompt

This prompt defines the **post-authentication setup flow** for new StockPaEasy tenants (businesses), including guided business profile creation, branding configuration, user management with granular role/permission controls, and consistent branding integration across the platform. The goal is to deliver an intuitive, delightful onboarding experience while giving admins complete control over team access and capabilities.

---

## Phase 1: Business Profile Setup (Post-Registration)

### 1.1 Onboarding Flow Architecture
After successful signup/account creation, users enter a **guided setup wizard** (not complex forms):

**Flow Steps:**
1. **Welcome Screen** - Congratulations message with setup overview (2 min, 3 steps)
2. **Business Basics** - Company name, industry, size
3. **Business Details** - Address, phone, email, website, tax ID
4. **Branding Setup** - Logo upload, color scheme, invoice template customization
5. **Initial Users** - Invite team members and assign roles
6. **Confirmation** - Review all settings, complete setup
7. **Dashboard Redirect** - First-time user sees onboarded dashboard

**Progressive Disclosure:**
- Show only essential fields on each step
- Advanced options (tax ID, website) marked as optional
- Tooltips and help text for each field
- Ability to skip and configure later (except business name)

### 1.2 Business Basics Step

**Form Fields:**
```
Company Name (required)
  - Placeholder: "Acme Corporation"
  - Validation: 2-100 characters, no special characters
  - Hint: "Used in invoices and across your dashboard"

Industry (required, dropdown)
  - Options: Retail, Manufacturing, Services, E-commerce, Healthcare, 
             F&B, Hospitality, Other
  - Affects: Default account charts, report templates, expense categories
  - Icon visual for each industry

Business Size (required, radio buttons)
  - Solo (1 person)
  - Small (2-10 people)
  - Medium (11-50 people)
  - Large (50+ people)
  - Purpose: Pre-configure default quotas and features
```

**Visual Design:**
- Single column layout on mobile, centered
- Large, clear icons for industry selection
- Progress bar at top showing "Step 1 of 6"
- "Next" button enabled only when required fields filled
- "Back" button to return to previous step

### 1.3 Business Details Step

**Form Fields:**
```
Business Address (required)
  - Street address, City, State/Province, ZIP/Postal Code, Country
  - Auto-complete address field using Google Places API
  - Stores as: street_address, city, state, postal_code, country

Phone Number (required)
  - Format: International format with country code
  - Validation: Valid phone format

Email Address (required)
  - Should match company domain if possible
  - Used for official correspondence

Website (optional)
  - Validation: Valid URL format
  - Extracted domain displayed in invoice header

Tax ID / Registration Number (optional)
  - Placeholder: "e.g., ABN (Australia), EIN (USA), VAT ID (EU)"
  - Validation: Basic format check
  - Required in some countries (configurable)

Tax Identification Type (optional dropdown)
  - VAT ID, Tax ID, EIN, ABN, GST, Other
  - Dynamically shown based on country selection
```

**Validation:**
- Real-time validation with helpful error messages
- Green checkmarks for valid fields
- "This will appear on your invoices" callout for key fields

### 1.4 Branding Setup Step

This is the most visual step to create excitement about the platform.

**Form Elements:**

**A. Logo Upload**
```
Logo Upload Area (optional but recommended)
  - Drag & drop or click to upload
  - Accepted formats: PNG, JPG, SVG (max 5MB)
  - Preview area showing uploaded logo
  - "Remove logo" option
  - Recommended dimensions: 300x300px (square) or 400x200px (landscape)
  - Auto-optimized for web
```

**B. Color Scheme Selection**
```
Primary Brand Color (required)
  - Color picker with predefined brand colors
  - Default: StockPaEasy blue (#3B82F6)
  - Applied to: Buttons, links, headers, KPI cards
  - Real-time preview showing color in UI components
  - Option to use custom color via hex input

Accent Color (optional)
  - Secondary color for highlights
  - Default: Derived from primary color
  - Applied to: Hover states, borders, secondary buttons

Dark Mode Color (optional)
  - Auto-calculated from primary color
  - Manual override available
```

**C. Invoice Customization**
```
Invoice Header Text (optional)
  - Rich text editor for invoice header/description
  - Character limit: 500
  - Preview: Shows how it appears on invoice

Invoice Footer Text (optional)
  - Terms and conditions, payment instructions, thank you message
  - Rich text editor with basic formatting
  - Preview: Shows how it appears on invoice

Invoice Color Scheme (optional)
  - Use brand colors on invoices: Yes/No toggle
  - Accent placement: Header, Border, Accents
```

**D. Company Branding Preview**
```
Live Preview Panel (right side on desktop, below on mobile)
  - Shows sample invoice header with logo and colors
  - Shows dashboard header with branding
  - Shows button states with brand colors
  - Updates in real-time as user changes settings
  - "View Full Preview" link to dedicated preview page
```

**Storage & Application:**
- All branding settings stored in `tenant_settings` table
- CSS variables created dynamically: `--primary-color`, `--accent-color`, etc.
- Logo URL stored for CDN delivery
- Applied globally through Tailwind CSS custom theme

### 1.5 Initial Users & Roles Step

**Overview:**
"Add your team members and assign their roles"

**Form:**
```
Add Team Member
  - Email input field
  - Role dropdown (see roles section below)
  - Add button
  - Displays list of invited users below

List of Pending Invitations:
  - Email | Role | Remove button
  - Shows "Invitation sent pending acceptance" status
  - Ability to revoke invitations
```

**Predefined Roles** (for MVP):
- **Owner/Admin** - Full access (automatically assigned to signup user)
- **Accountant** - Financial records, reports, reconciliation
- **Sales Executive** - Sales, customers, invoices
- **Warehouse Supervisor** - Inventory, stock management
- **Viewer** - Read-only access to reports

**Invite Flow:**
- Email sent to invite link
- Invite link contains tenant_id and role assignment
- User clicks link, creates account, joins tenant with role
- Email includes company name, role, and onboarding link

### 1.6 Confirmation Step

**Review Screen:**
```
Business Profile Summary (read-only)
  - Company name
  - Industry, size
  - Address
  - Phone, email, website
  - Tax ID
  - Edit button to go back to specific steps

Branding Summary
  - Logo preview
  - Brand colors preview
  - Invoice preview with customization

Team Summary
  - Invited users and their roles
  - Owner (you)
  - Edit link to add more users

"Confirm & Complete Setup" button
  - Creates tenant in database
  - Sets wizard_completed = true
  - Redirects to dashboard
```

**Error Handling:**
- If any validation fails, highlight problematic step
- Show specific error message
- Ability to go back and fix

---

## Phase 2: Admin Panel - Role & Permission Management

### 2.1 Admin Dashboard Overview

**Location:** `/admin/team` or `/settings/team`

**Main Sections:**
1. Team Members List
2. Roles & Permissions Manager
3. User Activity Log
4. Tenant Settings

### 2.2 Team Members Management

**User List Table:**
```
Columns:
  - Name (from user profile)
  - Email
  - Role
  - Status (Active, Inactive, Pending Invitation)
  - Last Login
  - Actions (Edit, Deactivate, Delete)

Filters:
  - By role
  - By status
  - Search by name/email
  - Sort by last login, role, status

Bulk Actions:
  - Select multiple users
  - Bulk change role
  - Bulk deactivate
```

**User Detail Modal:**
```
User Information:
  - Name, email, role
  - Date joined
  - Last login (timestamp)
  - IP address of last login
  - Activity summary (invoices created, products added, etc.)

Quick Actions:
  - Change Role (dropdown with all available roles)
  - Deactivate / Reactivate
  - Reset Password (send reset link)
  - Remove User (confirmation required)

Audit Trail:
  - Last 10 actions by this user
  - Timestamp, action type, resource affected
```

**Add User Flow:**
- "Invite Team Member" button
- Email input + role selector
- Send invitation via email
- Pending invitations list with revoke option

### 2.3 Roles & Permissions Manager

**Current State View:**
```
Role List:
  - All roles (default + custom)
  - Each role card showing:
    - Role name and description
    - Number of users with this role
    - Permissions summary (3-5 key permissions)
    - Edit / Delete buttons
```

**Role Detail Page:**

**A. Role Information**
```
Role Name (required)
  - Text input, non-editable for default roles
  - Predefined roles: Owner, Accountant, Sales Executive, Warehouse Supervisor, Viewer

Role Description (optional)
  - Textarea describing the role's purpose
  - Visible to admin only

Role Type:
  - System Role (built-in, can't delete but can modify permissions)
  - Custom Role (user-created, fully editable/deletable)
```

**B. Permission Matrix**

Display as **hierarchical checklist** or **card grid**:

```
Inventory Management
  ☑ View Products
  ☑ Create Products
  ☑ Edit Products
  ☑ Delete Products
  ☑ View Stock Levels
  ☑ Adjust Stock
  ☑ View Stock History

Sales Management
  ☑ View Invoices
  ☑ Create Invoices
  ☑ Edit Invoices (own only / all)
  ☐ Delete Invoices
  ☑ View Customers
  ☑ Create Customers
  ☑ Edit Customers

Financial Management
  ☐ View General Ledger
  ☐ Create Journal Entries
  ☐ View Financial Reports
  ☐ Generate P&L
  ☐ Generate Balance Sheet

Expense Management
  ☑ View Expenses
  ☑ Create Expenses
  ☐ Edit All Expenses (can edit own)
  ☐ Delete Expenses

User Management
  ☐ View Team Members
  ☐ Invite Users
  ☐ Manage Roles
  ☐ View Audit Logs
  ☐ Deactivate Users

Settings
  ☐ Edit Tenant Settings
  ☐ Edit Branding
  ☐ Configure Accounting
```

**Editing Workflow:**
```
1. Admin clicks "Edit" on role card
2. Permission matrix loads with current state
3. Admin checks/unchecks permissions
4. Real-time updates show affected areas ("Affects: 2 users")
5. "Save Changes" button
6. Confirmation dialog: "This will update permissions for X users"
7. Success toast: "Role updated"
8. Updated users get notification
```

**Preset Permission Templates:**
```
Quick Setup Options:
  - View Only (all read permissions)
  - Full Access (all permissions)
  - Manager (most permissions except user management)
  - Staff (limited permissions)
```

**Permission Grouping:**
- Group by module (Inventory, Sales, Financial, User Management)
- Visual indicators for dangerous permissions (red warning icon for delete actions)
- Hover tooltips explaining what each permission does
- "Preview Capabilities" button showing what this role can do

### 2.4 Create Custom Role

**Flow:**
```
1. "Create New Role" button in roles section
2. Modal opens:
   - Role Name input
   - Role Description (optional)
   - "Select from template" option (View Only, Staff, Manager, Full Access)
   - Start from scratch vs. copy existing role
3. Permission matrix appears
4. Admin selects permissions
5. Preview shows what this role can do
6. "Create Role" button
7. Role added, can now be assigned to users
```

**Validation:**
- Role name must be unique within tenant
- At least one permission must be selected
- Dangerous: At least one user must have full admin permissions

### 2.5 Audit & Activity Log

**Location:** `/admin/audit-log`

**Log Viewer:**
```
Columns:
  - Timestamp (relative: "2 hours ago")
  - User (name, role)
  - Action (Created, Updated, Deleted)
  - Resource (Product, Invoice, User, Role)
  - Details (what changed)
  - IP Address

Filters:
  - By date range
  - By user
  - By action type
  - By resource type
  - Search by details

Sorting:
  - Most recent first (default)
  - By user, action, resource

Export:
  - Export to CSV for compliance
  - Date range selection
```

**Detail View (click on row):**
```
Full Transaction Details:
  - User who performed action + IP
  - Exact timestamp (with timezone)
  - Before/after values (for updates)
  - Full description of change
  - Related records (linked invoice, product, etc.)
```

---

## Phase 3: Consistent Branding Across Site

### 3.1 Branding Implementation Architecture

**Branding Context:**
```typescript
// src/lib/branding.ts
interface BrandingConfig {
  tenantId: string
  logoUrl: string | null
  primaryColor: string      // #3B82F6
  accentColor: string       // #10B981
  companyName: string
  invoiceHeader: string
  invoiceFooter: string
  // ... other settings
}

// React Context (src/contexts/BrandingContext.tsx)
- Loaded once on app initialization
- Available throughout entire app
- Re-fetches when user navigates to settings
```

**Dynamic CSS Variables:**
```css
:root {
  --primary-color: #3B82F6;
  --primary-hover: #2563EB;
  --accent-color: #10B981;
  --accent-hover: #059669;
  --text-primary: #1F2937;
  --text-secondary: #6B7280;
  /* ... other variables */
}
```

**Tailwind Integration:**
```javascript
// tailwind.config.ts
theme: {
  colors: {
    primary: 'var(--primary-color)',
    accent: 'var(--accent-color)',
    // ... rest of palette
  }
}
```

### 3.2 Branding Application Points

**1. Navigation & Header**
- Logo displayed in sidebar/header (left-aligned)
- Company name next to logo
- Primary color used for active nav item background
- Accent color for hover states

**2. Buttons**
- Primary buttons: Brand primary color
- Hover state: Darker shade (Tailwind darken)
- Secondary buttons: Outline with primary color

**3. Dashboard**
- KPI cards: Header background uses primary color
- Charts: Use primary and accent colors
- Progress bars: Primary color

**4. Forms**
- Focus states: Primary color border/glow
- Validation: Green for success, red for error
- Submit buttons: Primary color

**5. Invoices**
- Header: Logo + company name on brand color background
- Accents: Primary color for highlights, totals
- Footer: Accent color for dividers

**6. Reports**
- Chart colors: Primary and accent
- Report headers: Primary color

**7. Notifications**
- Toast backgrounds: Brand colors for success/primary actions
- Error: Standard red (consistent)
- Warning: Standard amber (consistent)

### 3.3 Logo Handling

**Upload & Storage:**
```
1. User uploads logo in branding setup
2. Optimized and resized by frontend (Squoosh library)
3. Uploaded to Supabase storage: /logos/{tenant_id}/{filename}
4. URL stored in tenant_settings.logo_url
5. CDN delivery via Supabase public URL
```

**Display:**
```
Logo Size Standards:
  - Header/Sidebar: 40x40px
  - Invoices: 80x80px or 200x100px (landscape)
  - Login page: 150x150px
  - PDF exports: 150x150px

Fallback:
  - If no logo: Display initials (company name) in circular badge
  - Initials color: Primary color background
```

**Responsive:**
- Desktop: Full logo
- Tablet: Logo with company name
- Mobile: Logo only or initials

### 3.4 Color Accessibility

**Validation Rules:**
- Primary color contrast ratio ≥ 4.5:1 against white
- If user selects inaccessible color, show warning
- Automatically calculate dark/light text color based on primary
- Accent color must be distinguishable from primary

**Implementation:**
```typescript
// src/lib/accessibility.ts
function calculateTextColor(bgColor: string): 'white' | 'black' {
  // Luminance calculation
  const luminance = calculateLuminance(bgColor)
  return luminance > 0.5 ? 'black' : 'white'
}

function validateContrast(color1: string, color2: string): boolean {
  // WCAG contrast ratio calculation
  const ratio = calculateContrastRatio(color1, color2)
  return ratio >= 4.5
}
```

---

## Phase 4: Admin Control & Governance

### 4.1 Admin Capabilities

**What Admins Can Do:**
- ✅ Create, edit, delete custom roles
- ✅ Assign/change user roles
- ✅ Invite new users
- ✅ Deactivate/reactivate users
- ✅ Reset user passwords
- ✅ View complete audit logs
- ✅ Edit tenant settings (company name, branding)
- ✅ View team member activity
- ✅ Export audit logs for compliance

**What Admins Cannot Do:**
- ❌ Delete their own account (must deactivate via super admin)
- ❌ Modify role permissions for Owner role
- ❌ Access other tenant's data
- ❌ Bypass permission checks via URL

### 4.2 Privilege Escalation Prevention

**Rules:**
1. Must always have at least one Owner/Admin with full permissions
2. Cannot remove Owner role from all users
3. Cannot create permission set that bypasses critical functions
4. All admin actions logged in audit trail
5. IP logging for all admin activity

### 4.3 Tenant Settings Panel

**Location:** `/admin/settings`

**Sections:**
```
Company Information
  - Company name (editable)
  - Industry (editable)
  - Company size (informational)
  - Registered date

Branding
  - Logo, colors, invoice customization
  - Link to branding setup wizard
  - Preview button

Accounting Configuration (if applicable)
  - Default tax rate
  - Currency
  - Fiscal year end
  - Accounting method (Cash vs. Accrual)

User Management
  - Link to team members page
  - Active users count / quota
  - Pending invitations count

Subscription (Post-MVP)
  - Current plan
  - Billing period
  - Usage (users, products, invoices)
  - Upgrade link
  - Payment method

Data Management
  - Export all data (CSV, JSON)
  - Backup frequency
  - Data retention policy
```

---

## UX Best Practices Throughout

### 5.1 Onboarding Flow UX

**Design Principles:**
- **Progressive Disclosure**: Only show what's needed at each step
- **Reassurance**: Show progress, clear steps, ability to go back
- **Visual Hierarchy**: Focus user attention on primary action
- **Empty States**: Help text when fields empty, not error messages
- **Validation**: Real-time feedback without blocking
- **Success Celebrations**: Completion animations, encouraging messages

**Specific UX Patterns:**

```
Progress Indicator:
  - Visual progress bar (50% through step 3 of 6)
  - Clear step labels below (clickable to jump back)
  - Current step highlighted

Navigation:
  - "Previous" button always available (except step 1)
  - "Next" button disabled until required fields filled
  - "Skip" option for optional sections (except branding, business name)
  - Keyboard support: Enter to submit, Escape to cancel

Loading States:
  - Show skeleton loaders during logo optimization
  - Spinners during invitation sending
  - Disable buttons during submission

Validation Feedback:
  - Field-level validation (inline)
  - Green checkmark when valid
  - Red error text with specific fix ("Must include country code")
  - Help text that educates, not just errors
```

### 5.2 Admin Panel UX

**Design Principles:**
- **Clarity**: Clear action labels, obvious consequences
- **Safety**: Confirmations for destructive actions
- **Efficiency**: Bulk actions, quick filters, search
- **Transparency**: Show affected users before confirming
- **Visibility**: Users can see what permissions they have

**Specific Patterns:**

```
Role Editing:
  - Live preview: "This role will have X permissions"
  - Show impact: "This will affect 2 active users"
  - Confirmation modal with change summary
  - Changelog: "Role updated 2 hours ago"

User Management:
  - Inline quick actions (Change Role, Deactivate)
  - Batch operations with checkboxes
  - Search-as-you-type for large teams
  - User profiles with activity summary on hover

Audit Log:
  - Color-coded action types
  - Relative timestamps ("2 hours ago")
  - Expandable details without page navigation
  - One-click export to CSV
```

### 5.3 Branding Preview UX

```
Real-Time Preview:
  - Split screen: Editor left, preview right (on desktop)
  - Preview updates instantly as user changes color/logo
  - Shows: Invoice header, dashboard button, logo placement

Preview Areas:
  - Invoice with business header
  - Dashboard KPI card with colors
  - Button states (default, hover, active)
  - Navigation sidebar with logo

Mobile Preview:
  - Stack editor over preview
  - Toggle between editor/preview views
  - Mobile-specific preview (mobile nav, mobile buttons)
```

### 5.4 Permission Management UX

```
Permission Display:
  - Group by module (Inventory, Sales, Financial, etc.)
  - Icons indicating danger level (⚠️ for delete permissions)
  - Hover tooltips explaining each permission

Learning Curve:
  - "About this role" link to documentation
  - Permission template suggestions
  - "Preview capabilities" showing what role can do in practice

Conflict Prevention:
  - Warning if removing admin permissions from all users
  - Suggestion: "Keep at least one admin role"
  - Highlight dependencies ("Product deletion affects invoices")
```

---

## Technical Implementation Details

### 6.1 Onboarding State Management

```typescript
// src/contexts/OnboardingContext.tsx
interface OnboardingState {
  step: 1 | 2 | 3 | 4 | 5 | 6
  businessBasics: BusinessBasics
  businessDetails: BusinessDetails
  branding: BrandingConfig
  initialUsers: InvitedUser[]
  isCompleted: boolean
  lastSavedStep: number
}

// Auto-save to localStorage after each step
// Resume from last step if user refreshes
```

### 6.2 Branding Application

```typescript
// src/lib/branding.ts
export async function loadTenantBranding(tenantId: string) {
  const settings = await supabase
    .from('tenant_settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .single()
  
  // Apply to CSS variables
  applyBrandingVariables(settings)
  
  return settings
}

function applyBrandingVariables(branding: TenantSettings) {
  document.documentElement.style.setProperty(
    '--primary-color',
    branding.primary_color
  )
  // ... apply other variables
}
```

### 6.3 Permission Checking

```typescript
// src/lib/permissions.ts
export function can(user: User, action: Permission): boolean {
  return user.role_permissions.includes(action)
}

export function requirePermission(action: Permission) {
  return (req: NextRequest) => {
    const user = getAuthenticatedUser(req)
    if (!can(user, action)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }
}

// Usage in API routes
export async function POST(req: NextRequest) {
  if (!requirePermission('create:invoices')(req)) return

  // ... handle request
}
```

---

## Success Metrics for MVP

- ✅ 95%+ onboarding completion rate
- ✅ Average setup time: < 5 minutes
- ✅ Admin can add user and change roles in < 1 minute
- ✅ Branding consistently applied across all pages
- ✅ Zero permission bypass vulnerabilities
- ✅ Audit log captures 100% of admin actions
- ✅ Mobile onboarding works as smoothly as desktop
- ✅ Custom role creation without technical knowledge

---

## Out of Scope (Post-MVP)

- Advanced SSO/SAML integration
- LDAP directory sync
- Custom permission builder UI (admins write rules)
- Multi-language admin interface
- Advanced branding (custom CSS injection)
- Role templates marketplace
- Approval workflows for admin actions
- Department/team hierarchies