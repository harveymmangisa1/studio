'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User,
  Mail,
  Shield,
  UserPlus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('@/components/ui/select').then(mod => mod.Select), { ssr: false });
const SelectContent = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectContent), { ssr: false });
const SelectItem = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectItem), { ssr: false });
const SelectTrigger = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectTrigger), { ssr: false });
const SelectValue = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectValue), { ssr: false });

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Accountant' | 'Store Clerk' | 'Cashier' | 'Auditor';
  status: 'Active' | 'Pending' | 'Inactive';
  last_login: string | null;
  created_at: string;
}

interface UserFormProps {
  user?: TeamUser | null;
  onSave: (user: TeamUser) => void;
  onCancel: () => void;
}

export function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Store Clerk' as const,
    status: 'Pending' as const,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData: TeamUser = {
        id: user?.id || Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        last_login: user?.last_login || null,
        created_at: user?.created_at || new Date().toISOString(),
      };

      onSave(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'Admin', label: 'Admin', description: 'Full system access' },
    { value: 'Manager', label: 'Manager', description: 'Management and reporting' },
    { value: 'Accountant', label: 'Accountant', description: 'Financial management' },
    { value: 'Store Clerk', label: 'Store Clerk', description: 'Inventory management' },
    { value: 'Cashier', label: 'Cashier', description: 'Sales and transactions' },
    { value: 'Auditor', label: 'Auditor', description: 'Read-only access' },
  ];

  const statusOptions = [
    { value: 'Active', label: 'Active', description: 'User can log in and use the system' },
    { value: 'Pending', label: 'Pending', description: 'Invitation sent, awaiting acceptance' },
    { value: 'Inactive', label: 'Inactive', description: 'User account disabled' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@company.com"
                className="pl-10"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role and Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Access & Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-sm text-muted-foreground">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    <div>
                      <div className="font-medium">{status.label}</div>
                      <div className="text-sm text-muted-foreground">{status.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {formData.role === 'Admin' && (
              <div className="text-sm text-muted-foreground">
                <strong>Admin:</strong> Full access to all features, user management, system settings, and reports.
              </div>
            )}
            {formData.role === 'Manager' && (
              <div className="text-sm text-muted-foreground">
                <strong>Manager:</strong> Access to inventory, sales, customers, reports, and team management (except user roles).
              </div>
            )}
            {formData.role === 'Accountant' && (
              <div className="text-sm text-muted-foreground">
                <strong>Accountant:</strong> Access to financial reports, accounting, expenses, and audit logs.
              </div>
            )}
            {formData.role === 'Store Clerk' && (
              <div className="text-sm text-muted-foreground">
                <strong>Store Clerk:</strong> Access to inventory management, product management, and basic sales.
              </div>
            )}
            {formData.role === 'Cashier' && (
              <div className="text-sm text-muted-foreground">
                <strong>Cashier:</strong> Access to sales transactions, customer management, and basic inventory viewing.
              </div>
            )}
            {formData.role === 'Auditor' && (
              <div className="text-sm text-muted-foreground">
                <strong>Auditor:</strong> Read-only access to all reports, audit logs, and financial data.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.name || !formData.email}>
          {loading ? 'Saving...' : user ? 'Update User' : 'Invite User'}
        </Button>
      </div>
    </form>
  );
}
