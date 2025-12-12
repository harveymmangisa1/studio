
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  PlusCircle, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Download,
  Shield,
  Eye,
  Copy,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  UserPlus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { UserForm, TeamUser } from './UserForm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { toCsv } from '@/lib/utils';
import { PageHeader } from '@/components/shared';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/AppLayout';

const Select = dynamic(() => import('@/components/ui/select').then(mod => mod.Select), { ssr: false });
const SelectContent = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectContent), { ssr: false });
const SelectItem = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectItem), { ssr: false });
const SelectTrigger = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectTrigger), { ssr: false });
const SelectValue = dynamic(() => import('@/components/ui/select').then(mod => mod.SelectValue), { ssr: false });


export default function UsersPage() {
  const [users, setUsers] = useState<TeamUser[]>([]);
  const { toast } = useToast();
  const [filteredUsers, setFilteredUsers] = useState<TeamUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Adjust table/columns as per your schema
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, status, last_login, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mapped: TeamUser[] = (data || []).map((u: any) => ({
        id: u.id,
        name: u.name || u.email || 'User',
        email: u.email,
        role: u.role || 'Member',
        status: u.status || 'Active',
        last_login: u.last_login || null,
        created_at: u.created_at || new Date().toISOString(),
      }));
      setUsers(mapped);
    } catch (e) {
      console.error('Failed to load users', e);
      toast({ title: 'Failed to load users', description: (e as any).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role.toLowerCase() === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status.toLowerCase() === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const handleSaveUser = async (user: TeamUser) => {
    try {
      setLoading(true);
      if (editingUser) {
        const { error } = await supabase
          .from('users')
          .update({ name: user.name, email: user.email, role: user.role, status: user.status })
          .eq('id', user.id);
        if (error) throw error;
      } else {
        const toInsert = { name: user.name, email: user.email, role: user.role, status: user.status };
        const { error } = await supabase
          .from('users')
          .insert(toInsert);
        if (error) throw error;
      }
      toast({ title: editingUser ? 'User updated' : 'User created' });
      await fetchUsers(); // Re-fetch all users
    } catch (e: any) {
      console.error('Failed to save user', e);
      toast({ title: 'Failed to save user', description: e.message || String(e), variant: 'destructive' });
    } finally {
      setIsFormOpen(false);
      setEditingUser(null);
      setLoading(false);
    }
  };

  const handleEditUser = (user: TeamUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      await fetchUsers(); // Re-fetch all users
      toast({ title: 'User deleted' });
    } catch (e: any) {
      console.error('Failed to delete user', e);
      toast({ title: 'Failed to delete user', description: e.message || String(e), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Calendar },
      'Inactive': { color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Active;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'Admin': { color: 'bg-purple-100 text-purple-800' },
      'Manager': { color: 'bg-blue-100 text-blue-800' },
      'Accountant': { color: 'bg-green-100 text-green-800' },
      'Store Clerk': { color: 'bg-orange-100 text-orange-800' },
      'Cashier': { color: 'bg-teal-100 text-teal-800' },
      'Auditor': { color: 'bg-gray-100 text-gray-800' },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={`${config.color} border-0`}>
        {role}
      </Badge>
    );
  };

  const exportToCsv = () => {
    const csvData = filteredUsers.map(user => ({
      'Name': user.name,
      'Email': user.email,
      'Role': user.role,
      'Status': user.status,
      'Last Login': user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never',
      'Created': new Date(user.created_at).toLocaleDateString(),
    }));
    
    const csv = toCsv(csvData, ['Name', 'Email', 'Role', 'Status', 'Last Login', 'Created']);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team_users.csv';
    a.click();
  };

  const activeUsers = users.filter(user => user.status === 'Active').length;
  const pendingUsers = users.filter(user => user.status === 'Pending').length;
  const totalUsers = users.length;

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <PageHeader
          title="Team Management"
          description="Manage user accounts, roles, and permissions"
        >
          <Button variant="outline" onClick={exportToCsv}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => { setEditingUser(null); setIsFormOpen(true); }}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </PageHeader>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Accountant">Accountant</SelectItem>
                      <SelectItem value="Store Clerk">Store Clerk</SelectItem>
                      <SelectItem value="Cashier">Cashier</SelectItem>
                      <SelectItem value="Auditor">Auditor</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* User Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Edit User' : 'Invite New User'}
              </DialogTitle>
            </DialogHeader>
            <UserForm
              user={editingUser}
              onSave={handleSaveUser}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingUser(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
