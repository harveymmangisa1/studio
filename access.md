# StockPilot Authentication & Role-Based Access Control (RBAC) Prompt
## Production-Grade Authentication, Authorization, and Permission Management

## Project Overview
This prompt provides a complete, production-grade authentication and authorization system for StockPilot. It implements:
- **Multi-layer authentication** with protected routes
- **Role-Based Access Control (RBAC)** with granular permissions
- **Email-based user invitations** with permission pre-assignment
- **Data isolation** at application and database levels
- **Permission enforcement** on every page, component, and API endpoint
- **Graceful degradation** to prevent crashes when users access restricted resources

---

## Core Architecture Overview

### Layers of Authorization

```
1. AUTHENTICATION LAYER
   └─ Verify user identity (login, session, token validity)

2. TENANT VALIDATION LAYER
   └─ Verify user belongs to requested tenant
   └─ Prevent cross-tenant access

3. PERMISSION LAYER
   └─ Verify user has permission for specific action
   └─ Two types: FEATURE ACCESS (pages) + ACTION PERMISSIONS (create/edit/delete)

4. DATA LAYER
   └─ Query filtering by tenant_id + user permissions
   └─ RLS policies ensure database-level isolation
```

### Permission Types

**1. Feature Permissions** (Can access this section?)
- `view:inventory` → Can see inventory pages
- `view:sales` → Can see sales pages
- `view:accounts` → Can see accounting pages
- `view:expenses` → Can see expense pages
- `view:reports` → Can see reporting pages

**2. Action Permissions** (Can do this action?)
- `create:products` → Create new products
- `edit:products` → Edit products
- `delete:products` → Delete products
- `create:invoices` → Create sales invoices
- `view:ledger` → View general ledger
- `create:journal_entries` → Record journal entries

**3. Data Scope Permissions** (Can access this data?)
- `edit:own_invoices_only` → Can only edit invoices they created
- `view:all_customers` → Can view all customers (vs. only assigned)
- `edit:all_expenses` → Can edit any expense (vs. only own)

---

## Phase 1: Authentication System

### 1.1 Authentication Flow Architecture

**Signup Flow (First User = Admin):**
```
1. User visits /signup
2. Fills form: Email, Password, Confirm Password
3. Backend validates (strong password, valid email)
4. Creates user record in Supabase Auth
5. Creates in custom users table with role = 'OWNER_ADMIN'
6. User automatically logged in
7. Redirected to /onboarding (business setup wizard)
8. After onboarding completes, redirected to /dashboard
```

**Login Flow:**
```
1. User visits /login
2. Fills: Email, Password
3. Supabase Auth validates credentials
4. Returns JWT token + user metadata
5. Token stored in secure httpOnly cookie + state
6. User object with role/permissions loaded into Context
7. User redirected to dashboard or their last page
```

**Session Management:**
```
1. JWT token stored in httpOnly cookie (not vulnerable to XSS)
2. Token includes:
   - user_id
   - email
   - tenant_id
   - role
   - expires_at
3. Refresh token for automatic session renewal
4. Session expires after 30 days or manual logout
5. On page refresh: Token validated, user re-hydrated from Context
```

### 1.2 Protected Routes Architecture

**Implementation: Middleware + Client-Side Guards**

```typescript
// middleware.ts (runs on EVERY request)
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  // Get session token
  const { data: { session } } = await supabase.auth.getSession()
  
  // Redirect unauthenticated users to /login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Verify tenant_id from URL matches user's tenant
  const tenantFromUrl = request.nextUrl.pathname.split('/')[2]
  const userTenant = session.user.user_metadata?.tenant_id
  
  if (tenantFromUrl && tenantFromUrl !== userTenant) {
    return NextResponse.redirect(new URL('/403', request.url))
  }
  
  return res
}

export const config = {
  matcher: [
    // Protect all app routes
    '/app/:path*',
    '/dashboard/:path*',
    '/inventory/:path*',
    '/sales/:path*',
    '/accounts/:path*',
    '/expenses/:path*',
    '/admin/:path*',
    '/settings/:path*',
  ]
}
```

**Client-Side Route Protection:**

```typescript
// src/components/ProtectedRoute.tsx
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Loading from '@/components/Loading'

interface ProtectedRouteProps {
  requiredPermission: string
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function ProtectedRoute({
  requiredPermission,
  fallback,
  children
}: ProtectedRouteProps) {
  const { user, permissions, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) return <Loading />

  if (!user) return null

  // Check if user has permission
  if (!permissions.includes(requiredPermission)) {
    return fallback || <UnauthorizedPage permission={requiredPermission} />
  }

  return <>{children}</>
}
```

**Usage in Pages:**

```typescript
// src/app/dashboard/inventory/page.tsx
import { ProtectedRoute } from '@/components/ProtectedRoute'
import InventoryDashboard from '@/components/InventoryDashboard'

export default function InventoryPage() {
  return (
    <ProtectedRoute requiredPermission="view:inventory">
      <InventoryDashboard />
    </ProtectedRoute>
  )
}
```

### 1.3 Auth Context & State Management

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AuthUser {
  id: string
  email: string
  tenant_id: string
  role: 'OWNER_ADMIN' | 'ACCOUNTANT' | 'SALES_EXEC' | 'WAREHOUSE_SUPERVISOR' | 'VIEWER'
  name: string
  avatar_url?: string
}

interface AuthContextType {
  user: AuthUser | null
  permissions: string[]
  isLoading: boolean
  isAdmin: boolean
  hasPermission: (permission: string) => boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  switchTenant: (tenantId: string) => Promise<void>
  updateUser: (user: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [permissions, setPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth on app load
  useEffect(() => {
    async function initializeAuth() {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          // Load user data from custom users table
          const { data: userData, error } = await supabase
            .from('users')
            .select('id, email, tenant_id, role, name, avatar_url')
            .eq('id', session.user.id)
            .single()

          if (userData) {
            setUser(userData as AuthUser)
            
            // Load permissions for this role
            const userPermissions = await loadPermissionsForRole(
              userData.role,
              userData.tenant_id
            )
            setPermissions(userPermissions)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setPermissions([])
          router.push('/login')
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [router])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission)
  }

  const updateUser = (updates: Partial<AuthUser>) => {
    setUser(current => current ? { ...current, ...updates } : null)
  }

  const value: AuthContextType = {
    user,
    permissions,
    isLoading,
    isAdmin: user?.role === 'OWNER_ADMIN',
    hasPermission,
    login,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

async function loadPermissionsForRole(
  role: string,
  tenantId: string
): Promise<string[]> {
  const { data: roleData } = await supabase
    .from('roles')
    .select('permissions')
    .eq('tenant_id', tenantId)
    .eq('name', role)
    .single()

  return roleData?.permissions || []
}
```

### 1.4 Secure Login Page

```typescript
// src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">StockPilot Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don't have an account? <a href="/signup" className="text-primary hover:underline">Sign up</a>
        </p>
      </div>
    </div>
  )
}
```

---

## Phase 2: Role-Based Access Control (RBAC)

### 2.1 Database Schema for Roles & Permissions

```sql
-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'OWNER_ADMIN', 'ACCOUNTANT', 'SALES_EXEC', etc.
  description TEXT,
  permissions TEXT[] NOT NULL DEFAULT '{}', -- Array of permission strings
  is_system_role BOOLEAN DEFAULT false, -- Can't be deleted if true
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(tenant_id, name)
);

-- User roles assignment
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT now(),
  UNIQUE(tenant_id, user_id, role_id)
);

-- Audit log for permission changes
CREATE TABLE permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'role_assigned', 'role_removed', 'permission_changed'
  target_user_id UUID,
  role_id UUID,
  old_permissions TEXT[],
  new_permissions TEXT[],
  ip_address TEXT,
  timestamp TIMESTAMP DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_user_roles_tenant ON user_roles(tenant_id);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_roles_tenant ON roles(tenant_id);
```

### 2.2 Default Roles & Permissions

```typescript
// src/lib/permissions-config.ts

export const DEFAULT_ROLES = {
  OWNER_ADMIN: {
    name: 'Owner/Admin',
    description: 'Full access to all features and settings',
    permissions: [
      // Inventory
      'view:inventory', 'create:products', 'edit:products', 'delete:products',
      'view:stock', 'adjust:stock', 'view:stock_history',
      // Sales
      'view:sales', 'create:invoices', 'edit:invoices', 'delete:invoices',
      'view:customers', 'create:customers', 'edit:customers',
      // Accounts & Finance
      'view:accounts', 'create:journal_entries', 'edit:journal_entries',
      'view:ledger', 'view:financial_reports', 'generate:financial_statements',
      // Expenses
      'view:expenses', 'create:expenses', 'edit:expenses', 'delete:expenses',
      // Admin
      'manage:users', 'manage:roles', 'view:audit_log', 'edit:settings',
      'edit:branding', 'edit:accounting_config'
    ]
  },

  ACCOUNTANT: {
    name: 'Accountant',
    description: 'Access to all financial records and reporting',
    permissions: [
      'view:accounts', 'create:journal_entries', 'edit:journal_entries',
      'view:ledger', 'view:financial_reports', 'generate:financial_statements',
      'view:inventory', // Read-only for context
      'view:sales', 'view:customers', // Read-only
      'view:expenses', 'create:expenses', 'edit:expenses',
      'view:audit_log' // For compliance
    ]
  },

  SALES_EXEC: {
    name: 'Sales Executive',
    description: 'Access to sales, customers, and related reports',
    permissions: [
      'view:sales', 'create:invoices', 'edit:own_invoices_only', // Can't edit others
      'view:customers', 'create:customers', 'edit:customers',
      'view:inventory', // Read-only for stock levels and pricing
      'view:sales_reports' // Limited reporting
    ]
  },

  WAREHOUSE_SUPERVISOR: {
    name: 'Warehouse Supervisor',
    description: 'Access to inventory and stock management',
    permissions: [
      'view:inventory', 'create:products', 'edit:products', // Can create/edit products
      'view:stock', 'adjust:stock', 'view:stock_history',
      'view:sales', // Read-only, to see orders
      'view:inventory_reports' // Specialized reports
    ]
  },

  VIEWER: {
    name: 'Viewer',
    description: 'Read-only access to dashboards and reports',
    permissions: [
      'view:inventory', 'view:sales', 'view:expenses',
      'view:reports' // Read-only
    ]
  }
}

// Map roles to page access
export const ROLE_PAGE_ACCESS: Record<string, string[]> = {
  OWNER_ADMIN: [
    '/dashboard', '/inventory', '/sales', '/accounts', '/expenses',
    '/reports', '/admin', '/settings'
  ],
  ACCOUNTANT: ['/dashboard', '/accounts', '/reports'],
  SALES_EXEC: ['/dashboard', '/sales', '/inventory'],
  WAREHOUSE_SUPERVISOR: ['/dashboard', '/inventory'],
  VIEWER: ['/dashboard', '/reports']
}
```

### 2.3 Permission Checking Utilities

```typescript
// src/lib/permission-helpers.ts
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook to check if user has specific permission
 */
export function useCanAccess(requiredPermission: string | string[]): boolean {
  const { permissions } = useAuth()
  
  if (Array.isArray(requiredPermission)) {
    return requiredPermission.some(p => permissions.includes(p))
  }
  
  return permissions.includes(requiredPermission)
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  const { isAdmin } = useAuth()
  return isAdmin
}

/**
 * Guard for API routes - middleware pattern
 */
export async function checkPermission(
  request: Request,
  requiredPermission: string | string[]
): Promise<{ allowed: boolean; error?: string }> {
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return { allowed: false, error: 'Not authenticated' }
    }

    const userPermissions = await getUserPermissions(user.id, user.tenant_id)
    
    if (Array.isArray(requiredPermission)) {
      const hasAny = requiredPermission.some(p => userPermissions.includes(p))
      if (!hasAny) {
        return { allowed: false, error: 'Insufficient permissions' }
      }
    } else {
      if (!userPermissions.includes(requiredPermission)) {
        return { allowed: false, error: 'Insufficient permissions' }
      }
    }

    return { allowed: true }
  } catch (error) {
    return { allowed: false, error: 'Authorization check failed' }
  }
}

/**
 * Conditional rendering component
 */
export function Can({
  permission,
  fallback,
  children
}: {
  permission: string | string[]
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const canAccess = useCanAccess(permission)
  return canAccess ? <>{children}</> : fallback || null
}

// Usage:
// <Can permission="create:invoices">
//   <CreateInvoiceButton />
// </Can>
```

---

## Phase 3: Email Invitations & User Onboarding

### 3.1 User Invitation System

```typescript
// src/lib/invitations.ts
import { supabase } from '@/lib/supabase'
import { sendInvitationEmail } from '@/lib/email'

export interface InvitationPayload {
  email: string
  role: string
  invited_by_user_id: string
  tenant_id: string
}

/**
 * Create invitation token and send email
 */
export async function inviteUser(payload: InvitationPayload) {
  // Generate unique invitation token
  const invitationToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  // Store invitation in database
  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      token: invitationToken,
      email: payload.email,
      role: payload.role,
      tenant_id: payload.tenant_id,
      invited_by: payload.invited_by_user_id,
      expires_at: expiresAt,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error

  // Get tenant and inviter details for email
  const { data: tenant } = await supabase
    .from('tenants')
    .select('company_name')
    .eq('id', payload.tenant_id)
    .single()

  const { data: inviter } = await supabase
    .from('users')
    .select('name, email')
    .eq('id', payload.invited_by_user_id)
    .single()

  // Send invitation email
  await sendInvitationEmail({
    to: payload.email,
    invitationToken,
    companyName: tenant?.company_name || 'StockPilot',
    inviterName: inviter?.name || inviter?.email,
    role: payload.role
  })

  return invitation
}

/**
 * Validate invitation token
 */
export async function validateInvitation(token: string) {
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (error || !invitation) {
    throw new Error('Invalid or expired invitation')
  }

  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation has expired')
  }

  return invitation
}

/**
 * Accept invitation and create user
 */
export async function acceptInvitation(
  token: string,
  email: string,
  password: string,
  name: string
) {
  // Validate invitation exists and matches email
  const invitation = await validateInvitation(token)
  
  if (invitation.email !== email) {
    throw new Error('Email does not match invitation')
  }

  // Create Supabase Auth user
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        tenant_id: invitation.tenant_id,
        role: invitation.role
      }
    }
  })

  if (authError) throw authError

  // Create user record in custom table
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authUser.user?.id,
      email,
      name,
      tenant_id: invitation.tenant_id,
      role: invitation.role
    })

  if (userError) throw userError

  // Assign role
  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('tenant_id', invitation.tenant_id)
    .eq('name', invitation.role)
    .single()

  if (role) {
    await supabase
      .from('user_roles')
      .insert({
        tenant_id: invitation.tenant_id,
        user_id: authUser.user?.id,
        role_id: role.id,
        assigned_by: invitation.invited_by
      })
  }

  // Mark invitation as accepted
  await supabase
    .from('invitations')
    .update({ status: 'accepted', accepted_at: new Date() })
    .eq('token', token)

  // Log audit event
  await supabase
    .from('permission_audit_log')
    .insert({
      tenant_id: invitation.tenant_id,
      user_id: invitation.invited_by,
      action: 'user_invited_accepted',
      target_user_id: authUser.user?.id,
      timestamp: new Date()
    })

  return authUser.user
}
```

### 3.2 Invitation Email Template

```typescript
// src/lib/email.ts
export async function sendInvitationEmail({
  to,
  invitationToken,
  companyName,
  inviterName,
  role
}: {
  to: string
  invitationToken: string
  companyName: string
  inviterName: string
  role: string
}) {
  const acceptLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation?token=${invitationToken}`

  const htmlContent = `
    <h2>You're invited to join ${companyName}!</h2>
    <p>${inviterName} has invited you to join their StockPilot workspace as a <strong>${role}</strong>.</p>
    
    <p><a href="${acceptLink}" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
      Accept Invitation
    </a></p>
    
    <p>Or copy this link: ${acceptLink}</p>
    
    <p>This invitation will expire in 7 days.</p>
    
    <hr>
    <p>If you didn't expect this, you can safely ignore this email.</p>
  `

  // Send via your email provider (SendGrid, Resend, etc.)
  await sendEmail({
    to,
    subject: `You're invited to ${companyName} on StockPilot`,
    html: htmlContent
  })
}
```

### 3.3 Acceptance Page

```typescript
// src/app/accept-invitation/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { validateInvitation, acceptInvitation } from '@/lib/invitations'

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [invitation, setInvitation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    validateInvitation(token)
      .then(inv => {
        setInvitation(inv)
        setFormData(f => ({ ...f, email: inv.email }))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsSubmitting(true)
    try {
      await acceptInvitation(
        token!,
        formData.email,
        formData.password,
        formData.name
      )
      // Redirect to login
      window.location.href = '/login?message=account-created'
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!invitation) return <div className="text-red-600">{error}</div>

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-2">Complete Your Registration</h1>
        <p className="text-gray-600 mb-6">
          You've been invited to join as <strong>{invitation.role}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
          </div>

          {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Complete Registration'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

---

## Phase 4: API Route Protection & Data Filtering

### 4.1 Protected API Routes Pattern

```typescript
// src/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { checkPermission } from '@/lib/permission-helpers'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/products - List products
 * Permission: view:inventory
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    const { allowed, error } = await checkPermission(request, 'view:inventory')
    if (!allowed) {
      return NextResponse.json({ error }, { status: 403 })
    }

    // Query with tenant isolation
    const { data, error: dbError } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', user.tenant_id)
      .order('created_at', { ascending: false })

    if (dbError) throw dbError

    return NextResponse.json(data)
  } catch (error) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products - Create product
 * Permission: create:products
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    const { allowed, error } = await checkPermission(request, 'create:products')
    if (!allowed) {
      return NextResponse.json({ error }, { status: 403 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.sku || body.cost_price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create product with tenant_id
    const { data, error: dbError } = await supabase
      .from('products')
      .insert({
        tenant_id: user.tenant_id,
        name: body.name,
        sku: body.sku,
        category: body.category,
        cost_price: body.cost_price,
        selling_price: body.selling_price,
        stock_quantity: body.stock_quantity || 0,
        reorder_point: body.reorder_point || 10,
        created_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      // Handle unique constraint violation
      if (dbError.code === '23505') {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        )
      }
      throw dbError
    }

    // Log to audit trail
    await supabase
      .from('audit_log')
      .insert({
        tenant_id: user.tenant_id,
        user_id: user.id,
        action: 'created',
        table_name: 'products',
        record_id: data.id,
        new_values: data,
        timestamp: new Date()
      })

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 4.2 Protected Update/Delete Routes

```typescript
// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { checkPermission } from '@/lib/permission-helpers'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { supabase } from '@/lib/supabase'

/**
 * PUT /api/products/[id] - Update product
 * Permission: edit:products
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    const { allowed } = await checkPermission(request, 'edit:products')
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify product belongs to user's tenant
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const body = await request.json()

    // Update product
    const { data: updated, error: dbError } = await supabase
      .from('products')
      .update({
        name: body.name || product.name,
        category: body.category || product.category,
        selling_price: body.selling_price || product.selling_price,
        reorder_point: body.reorder_point || product.reorder_point,
        updated_at: new Date()
      })
      .eq('id', params.id)
      .eq('tenant_id', user.tenant_id)
      .select()
      .single()

    if (dbError) throw dbError

    // Log audit trail with before/after
    await supabase
      .from('audit_log')
      .insert({
        tenant_id: user.tenant_id,
        user_id: user.id,
        action: 'updated',
        table_name: 'products',
        record_id: params.id,
        old_values: product,
        new_values: updated,
        timestamp: new Date()
      })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id] - Delete product
 * Permission: delete:products
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    const { allowed } = await checkPermission(request, 'delete:products')
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify product belongs to user's tenant
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if product has related invoices (prevent cascading deletion)
    const { count: invoiceCount } = await supabase
      .from('sales_line_items')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', params.id)

    if ((invoiceCount || 0) > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing sales records' },
        { status: 400 }
      )
    }

    // Soft delete (archive)
    const { error: dbError } = await supabase
      .from('products')
      .update({ is_archived: true })
      .eq('id', params.id)

    if (dbError) throw dbError

    // Log audit
    await supabase
      .from('audit_log')
      .insert({
        tenant_id: user.tenant_id,
        user_id: user.id,
        action: 'deleted',
        table_name: 'products',
        record_id: params.id,
        old_values: product,
        timestamp: new Date()
      })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 4.3 Special Case: Sales Executive (Edit Own Only)

```typescript
// src/app/api/invoices/[id]/route.ts - Partial example
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the invoice
    const { data: invoice } = await supabase
      .from('sales_invoices')
      .select('*')
      .eq('id', params.id)
      .eq('tenant_id', user.tenant_id)
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Check permissions with ownership check
    const userPermissions = await getUserPermissions(user.id, user.tenant_id)
    
    const canEditAll = userPermissions.includes('edit:invoices')
    const canEditOwn = userPermissions.includes('edit:own_invoices_only')
    const isOwner = invoice.created_by === user.id

    if (!canEditAll && !(canEditOwn && isOwner)) {
      return NextResponse.json(
        { error: 'You can only edit your own invoices' },
        { status: 403 }
      )
    }

    // Continue with update...
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Phase 5: Component-Level Permission Enforcement

### 5.1 Conditional UI Rendering

```typescript
// src/components/ProductActions.tsx
import { Can, useCanAccess } from '@/lib/permission-helpers'

export function ProductActions({ product }: { product: Product }) {
  const canEdit = useCanAccess('edit:products')
  const canDelete = useCanAccess('delete:products')

  return (
    <div className="flex gap-2">
      {/* Only show edit button if user has permission */}
      <Can permission="edit:products">
        <button onClick={() => editProduct(product.id)}>
          Edit
        </button>
      </Can>

      {/* Only show delete button if user has permission */}
      <Can permission="delete:products" fallback={<span className="text-gray-400">Delete</span>}>
        <button
          onClick={() => deleteProduct(product.id)}
          className="text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      </Can>
    </div>
  )
}
```

### 5.2 Full Page Permission Guards

```typescript
// src/components/FinancialReports.tsx
import { ProtectedRoute } from '@/components/ProtectedRoute'

export function FinancialReportsPage() {
  return (
    <ProtectedRoute
      requiredPermission="view:financial_reports"
      fallback={
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to view financial reports.
            Contact your administrator.
          </p>
        </div>
      }
    >
      <FinancialReportsContent />
    </ProtectedRoute>
  )
}
```

### 5.3 Sidebar Navigation - Dynamic Menu

```typescript
// src/components/Sidebar.tsx
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

const MENU_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'dashboard',
    requiredPermission: 'view:dashboard' // Optional
  },
  {
    label: 'Inventory',
    href: '/inventory',
    icon: 'boxes',
    requiredPermission: 'view:inventory'
  },
  {
    label: 'Sales',
    href: '/sales',
    icon: 'shopping-cart',
    requiredPermission: 'view:sales'
  },
  {
    label: 'Accounts',
    href: '/accounts',
    icon: 'book',
    requiredPermission: 'view:accounts'
  },
  {
    label: 'Expenses',
    href: '/expenses',
    icon: 'receipt',
    requiredPermission: 'view:expenses'
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: 'chart-bar',
    requiredPermission: 'view:reports'
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: 'settings',
    requiredPermission: 'manage:users'
  }
]

export function Sidebar() {
  const { permissions } = useAuth()

  // Filter menu items based on permissions
  const visibleItems = MENU_ITEMS.filter(item => 
    !item.requiredPermission || permissions.includes(item.requiredPermission)
  )

  return (
    <nav className="w-64 bg-white shadow">
      <ul className="space-y-2 p-4">
        {visibleItems.map(item => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block px-4 py-2 rounded hover:bg-gray-100"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

---

## Phase 6: Error Handling & Graceful Degradation

### 6.1 Authorization Error Pages

```typescript
// src/app/403/page.tsx - Forbidden
export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">403</h1>
        <p className="text-2xl font-semibold text-gray-700 mt-4">
          Access Denied
        </p>
        <p className="text-gray-600 mt-2">
          You don't have permission to access this resource.
        </p>
        <div className="mt-6 space-x-4">
          <a href="/dashboard" className="text-primary hover:underline">
            Go to Dashboard
          </a>
          <a href="/settings" className="text-primary hover:underline">
            Contact Admin
          </a>
        </div>
      </div>
    </div>
  )
}

// src/app/401/page.tsx - Unauthorized
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">401</h1>
        <p className="text-2xl font-semibold text-gray-700 mt-4">
          Not Authenticated
        </p>
        <p className="text-gray-600 mt-2">
          Please log in to access this page.
        </p>
        <div className="mt-6">
          <a href="/login" className="text-primary hover:underline">
            Go to Login
          </a>
        </div>
      </div>
    </div>
  )
}
```

### 6.2 API Error Responses

```typescript
// Standard error response format
interface ErrorResponse {
  error: string
  code: string
  message: string
  statusCode: number
}

// Error handling utility
export function createErrorResponse(
  statusCode: number,
  code: string,
  message: string
) {
  return NextResponse.json(
    {
      error: message,
      code,
      message
    },
    { status: statusCode }
  )
}

// Error mapping
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED'
}
```

### 6.3 Try-Catch Wrapper for API Routes

```typescript
// src/lib/api-handler.ts
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error: any) {
      console.error('API error:', error)

      if (error.code === '23505') {
        // Duplicate key
        return createErrorResponse(
          400,
          ERROR_CODES.VALIDATION_ERROR,
          'Record already exists'
        )
      }

      if (error.message.includes('not found')) {
        return createErrorResponse(
          404,
          ERROR_CODES.NOT_FOUND,
          'Resource not found'
        )
      }

      return createErrorResponse(
        500,
        ERROR_CODES.INTERNAL_ERROR,
        'Internal server error'
      )
    }
  }
}

// Usage:
// export const GET = withErrorHandling(async (req) => { ... })
```

---

## Phase 7: Database Row-Level Security (RLS)

### 7.1 RLS Policies for Multi-Tenant Isolation

```sql
-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Products: Users can only see products in their tenant
CREATE POLICY "Users see own tenant products"
ON products FOR SELECT
USING (
  tenant_id = (
    SELECT tenant_id FROM users
    WHERE id = auth.uid()
  )
);

-- Products: Users can insert if they have permission (checked at app level)
CREATE POLICY "Users can create products in own tenant"
ON products FOR INSERT
WITH CHECK (
  tenant_id = (
    SELECT tenant_id FROM users
    WHERE id = auth.uid()
  )
);

-- Sales Invoices: Can only see own tenant's invoices
CREATE POLICY "Users see own tenant invoices"
ON sales_invoices FOR SELECT
USING (
  tenant_id = (
    SELECT tenant_id FROM users
    WHERE id = auth.uid()
  )
);

-- Audit Log: Users can only see logs for their tenant
CREATE POLICY "Users see own tenant audit logs"
ON audit_log FOR SELECT
USING (
  tenant_id = (
    SELECT tenant_id FROM users
    WHERE id = auth.uid()
  )
);

-- Users: Can only see users in their tenant
CREATE POLICY "Users see own tenant users"
ON users FOR SELECT
USING (
  tenant_id = (
    SELECT tenant_id FROM users
    WHERE id = auth.uid()
  )
);
```

### 7.2 Verify RLS is Working

```typescript
// Test that RLS prevents cross-tenant access
async function testRLS() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
  
  // If user A tries to access user B's tenant's products,
  // this query should return empty or throw permission error
  
  console.log('RLS test:', error ? 'Protected' : 'Data:', data)
}
```

---

## Phase 8: Implementation Checklist & Best Practices

### 8.1 Development Checklist

- **Authentication**
  - [ ] Supabase Auth configured with JWT
  - [ ] Login/Signup pages created
  - [ ] AuthContext provider wrapping entire app
  - [ ] Protected middleware on all secure routes
  - [ ] Session persistence on refresh
  - [ ] Logout functionality working

- **Authorization**
  - [ ] Roles and permissions defined in code
  - [ ] Permission database tables created
  - [ ] Default roles seeded to database
  - [ ] Permission checking utilities created
  - [ ] ProtectedRoute component working
  - [ ] useCanAccess hook working

- **User Management**
  - [ ] Invitation system implemented
  - [ ] Email templates created
  - [ ] Acceptance page working
  - [ ] User role assignment working
  - [ ] Admin can manage users and roles

- **API Protection**
  - [ ] All API routes check permissions
  - [ ] All queries filtered by tenant_id
  - [ ] Audit logging on all changes
  - [ ] Error responses consistent
  - [ ] Rate limiting implemented

- **RLS Policies**
  - [ ] RLS enabled on all tables
  - [ ] Tenant isolation policies created
  - [ ] Cross-tenant access impossible
  - [ ] RLS policies tested

- **Testing**
  - [ ] Test each role can only access permitted pages
  - [ ] Test API prevents unauthorized actions
  - [ ] Test cross-tenant access blocked
  - [ ] Test permission changes take effect immediately
  - [ ] Test audit log captures all changes

### 8.2 Security Best Practices

```typescript
// DO: Always check permissions
if (!permissions.includes('create:invoices')) {
  return <Unauthorized />
}

// DON'T: Trust frontend-only checks
// (Always verify on backend/API)

// DO: Tenant isolation at every layer
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('tenant_id', user.tenant_id)

// DON'T: Query without tenant filter
// const { data } = await supabase.from('products').select('*')

// DO: Use httpOnly cookies for tokens
response.cookies.set('token', jwt, { httpOnly: true })

// DON'T: Store tokens in localStorage
// localStorage.setItem('token', jwt) // Vulnerable to XSS

// DO: Hash passwords before storing
const hashedPassword = await bcrypt.hash(password, 10)

// DON'T: Store plain passwords
// db.insert({ password: plainText })

// DO: Log all admin actions
await auditLog.insert({
  user_id: user.id,
  action: 'role_assigned',
  timestamp: new Date()
})

// DON'T: Silently perform admin actions
```

### 8.3 Performance Considerations

```typescript
// Cache user permissions in Context
// Don't refetch on every component

// Use indexes for tenant_id queries
CREATE INDEX idx_products_tenant ON products(tenant_id);

// Paginate large datasets
const { data, count } = await supabase
  .from('products')
  .select('*', { count: 'exact' })
  .eq('tenant_id', user.tenant_id)
  .range(0, 49)

// Batch permission checks in API routes
const [canCreate, canEdit, canDelete] = await Promise.all([
  checkPermission(req, 'create:products'),
  checkPermission(req, 'edit:products'),
  checkPermission(req, 'delete:products')
])
```

---

## Phase 9: Site Crash Prevention

### 9.1 Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
'use client'

import { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Try again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
```

### 9.2 Safe API Calls

```typescript
// src/lib/safe-api-call.ts
export async function safeApiCall<T>(
  url: string,
  options?: RequestInit
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(url, options)

    if (!response.ok) {
      const error = await response.json()
      return { error: error.message || 'Request failed' }
    }

    const data = await response.json()
    return { data: data as T }
  } catch (error: any) {
    console.error('API call error:', error)
    return { error: error.message || 'Network error' }
  }
}

// Usage:
const { data, error } = await safeApiCall<Product[]>('/api/products')
if (error) {
  toast.error(error)
  return <ErrorUI />
}
```

### 9.3 Fallback UI for Missing Data

```typescript
// src/components/DataTable.tsx
export function DataTable({ data, columns, loading }: DataTableProps) {
  if (loading) return <SkeletonLoader />
  
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return (
    <table className="w-full">
      {/* render table */}
    </table>
  )
}
```

---

## Success Metrics for Production Readiness

- ✅ Authentication works end-to-end (signup → login → protected pages)
- ✅ No user can access data from other tenants
- ✅ No user can bypass their role permissions
- ✅ All API endpoints reject unauthorized requests
- ✅ Audit trail captures all sensitive actions
- ✅ Site never crashes due to permission errors (graceful fallbacks)
- ✅ RLS policies prevent database-level cross-tenant access
- ✅ New users can be invited and onboarded without admin access
- ✅ Admin can manage all users, roles, and permissions
- ✅ Each role only sees relevant menu items and pages
- ✅ Load time < 2 seconds for authenticated pages
- ✅ Zero permission bypass vulnerabilities in security audit

---

## Testing Scenarios

### Test Case 1: Role Isolation
```
1. Create Account A with Owner/Admin role
2. Create Account B user with Sales Executive role
3. User B visits /accounts endpoint
   Expected: 403 Forbidden (doesn't have view:accounts)
4. User B visits /sales endpoint
   Expected: 200 OK (has view:sales)
```

### Test Case 2: Data Isolation
```
1. Admin A creates Product X in Tenant A
2. Admin B tries to query Product X via API
   Expected: 404 Not Found (RLS filters out cross-tenant data)
3. Admin B cannot see Product X in UI
   Expected: Product X never appears in any list
```

### Test Case 3: Permission Enforcement
```
1. Sales Exec creates Invoice
2. Try to delete Invoice (doesn't have delete:invoices)
   Expected: 403 Forbidden
3. Admin deletes same Invoice
   Expected: 200 OK + Audit log entry
```

### Test Case 4: Invitation Flow
```
1. Admin sends invite to new-user@example.com as Accountant
2. New user clicks link, creates account
3. New user logs in
   Expected: Only has accountant permissions
4. New user tries to create product
   Expected: 403 Forbidden
```

---

## Out of Scope (Post-MVP)

- OAuth/SSO integration (Google, Microsoft)
- Advanced 2FA (TOTP, SMS)
- IP whitelisting
- API keys for integrations
- Advanced audit reporting
- Compliance exports (GDPR, SOC2)
- Rate limiting per user/tenant
- Advanced permission templates