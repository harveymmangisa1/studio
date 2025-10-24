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

const initialUsers: TeamUser[] = [
  { 
    id: '1', 
    name: 'Alex Morgan',
    email: 'alex@company.com',
    role: 'Admin',
    status: 'Active',
    last_login: '2024-01-15T10:30:00Z',
    created_at: '2024-01-01T09:00:00Z'
  },
  { 
    id: '2', 
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    role: 'Manager',
    status: 'Active',
    last_login: '2024-01-14T16:45:00Z',
    created_at: '2024-01-05T10:30:00Z'
  },
  { 
    id: '3', 
    name: 'Mike Chen',
    email: 'mike@company.com',
    role: 'Accountant',
    status: 'Pending',
    last_login: null,
    created_at: '2024-01-10T14:20:00Z'
  },
  { 
    id: '4', 
    name: 'Emily Davis',
    email: 'emily@company.com',
    role: 'Store Clerk',
    status: 'Inactive',
    last_login: '2024-01-05T09:15:00Z',
    created_at: '2024-01-08T11:00:00Z'
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<TeamUser[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<TeamUser[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, roleFilter, statusFilter, users]);

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role.toLowerCase() === roleFilter.toLowerCase());
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredUsers(filtered);
  };

  const handleAddUser = (user: Omit<TeamUser, 'id' | 'created_at'>) => {
    const newUser: TeamUser = {
      ...user,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    setUsers([newUser, ...users]);
    setIsFormOpen(false);
  };

  const handleEditUser = (user: TeamUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleUpdateUser = (updatedUser: TeamUser) => {
    setUsers(users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
    setIsFormOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { color: 'bg-slate-100 text-slate-700', icon: CheckCircle },
      'Pending': { color: 'bg-slate-100 text-slate-700', icon: Calendar },
      'Inactive': { color: 'bg-slate-100 text-slate-700', icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Active;
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border border-slate-200`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'Admin': { color: 'bg-slate-100 text-slate-700' },
      'Manager': { color: 'bg-slate-100 text-slate-700' },
      'Accountant': { color: 'bg-slate-100 text-slate-700' },
      'Store Clerk': { color: 'bg-slate-100 text-slate-700' },
      'Cashier': { color: 'bg-slate-100 text-slate-700' },
      'Auditor': { color: 'bg-slate-100 text-slate-700' },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig['Store Clerk'];
    
    return (
      <Badge className={`${config.color} border border-slate-200`}>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportToCsv}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

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
            <div className="text-2xl font-bold">{activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers}</div>
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
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="accountant">Accountant</option>
                <option value="store clerk">Store Clerk</option>
                <option value="cashier">Cashier</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
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
                      <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-sm font-medium">
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
            onSave={editingUser ? handleUpdateUser : handleAddUser}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingUser(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
