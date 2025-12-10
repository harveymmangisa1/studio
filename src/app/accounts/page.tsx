
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import AccountTreeTable from '@/components/AccountTreeTable';
import { MoreHorizontal } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { useTenant } from '@/lib/tenant';

interface Account {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  parent_account_id?: string;
  description?: string;
  is_active: boolean;
  balance: number;
}

export default function ChartOfAccountsPage() {
  const { tenant } = useTenant();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAccountType, setFilterAccountType] = useState('All');
  const [filterIsActive, setFilterIsActive] = useState<boolean | 'All'>('All');

  // New account form state
  const [newAccountCode, setNewAccountCode] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('');
  const [newParentAccountId, setNewParentAccountId] = useState<string | undefined>(undefined);
  const [newDescription, setNewDescription] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);

  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>({});
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({});
  
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (tenant) {
      fetchAccounts();
    }
  }, [tenant]);

  const fetchAccounts = async () => {
    if (!tenant) return;
    try {
      const { data, error } = await supabase.from('accounts').select('*, parent_account_id').eq('tenant_id', tenant.id);
      if (error) {
        throw error;
      }
      // Initialize balance for all accounts, assuming it comes from DB or needs calculation
      const accountsWithBalance = (data || []).map(acc => ({...acc, balance: acc.balance || 0}));
      setAccounts(accountsWithBalance);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const validateAccount = (account: Partial<Account>, isNew: boolean = true) => {
    const errors: Record<string, string> = {};

    if (!account.account_name || account.account_name.trim() === '') {
      errors.account_name = 'Account Name is required.';
    }

    if (isNew) {
      if (!account.account_code || !/^[1-5]\d{3}$/.test(account.account_code)) {
        errors.account_code = 'Account Code must be a 4-digit number between 1000-5999.';
      }

      if (account.account_code) {
        const codePrefix = parseInt(account.account_code.substring(0, 1));
        let validRange = false;
        switch (account.account_type) {
          case 'Asset': validRange = codePrefix === 1; break;
          case 'Liability': validRange = codePrefix === 2; break;
          case 'Equity': validRange = codePrefix === 3; break;
          case 'Revenue': validRange = codePrefix === 4; break;
          case 'Expense': validRange = codePrefix === 5; break;
        }
        if (!validRange && account.account_type) {
          errors.account_code = `Account Code ${account.account_code} is not in the valid range for ${account.account_type} accounts.`;
        }

        if (accounts.some(acc => acc.account_code === account.account_code)) {
          errors.account_code = 'Account Code must be unique.';
        }
      }
    }

    return errors;
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenant) return;
    setAddFormErrors({});

    const newAccountData = {
      tenant_id: tenant.id,
      account_code: newAccountCode,
      account_name: newAccountName,
      account_type: newAccountType,
      parent_account_id: newParentAccountId === '' ? undefined : newParentAccountId,
      description: newDescription,
      is_active: newIsActive,
      balance: 0,
    };

    const errors = validateAccount(newAccountData);
    if (Object.keys(errors).length > 0) {
      setAddFormErrors(errors);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([
          newAccountData
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setAccounts([...accounts, data]);
        // Reset form
        setNewAccountCode('');
        setNewAccountName('');
        setNewAccountType('');
        setNewParentAccountId(undefined);
        setNewDescription('');
        setNewIsActive(true);
      }
    } catch (error: any) {
      setAddFormErrors({ form: error.message });
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsEditDialogOpen(true);
    setEditFormErrors({}); // Clear previous errors
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !tenant) return;

    setEditFormErrors({});

    const updatedAccountData = {
      account_name: editingAccount.account_name,
      description: editingAccount.description,
      is_active: editingAccount.is_active,
    };

    const errors = validateAccount(updatedAccountData, false); // Not a new account
    if (Object.keys(errors).length > 0) {
      setEditFormErrors(errors);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .update({
          account_name: editingAccount.account_name,
          description: editingAccount.description,
          is_active: editingAccount.is_active,
        })
        .eq('id', editingAccount.id)
        .eq('tenant_id', tenant.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setAccounts(accounts.map(acc => (acc.id === data.id ? data : acc)));
        setIsEditDialogOpen(false);
        setEditingAccount(null);
      }
    } catch (error: any) {
      setEditFormErrors({ form: error.message });
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!tenant) return;
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenant.id);

      if (error) {
        throw error;
      }

      setAccounts(accounts.filter(acc => acc.id !== id));
    } catch (error: any) {
      setError(error.message);
    }
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.account_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.account_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (account.description && account.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = 
      filterAccountType === 'All' || account.account_type === filterAccountType;

    const matchesActive = 
      filterIsActive === 'All' || account.is_active === filterIsActive;

    return matchesSearch && matchesType && matchesActive;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const parentAccounts = accounts.filter(acc => acc.account_type === newAccountType && !acc.parent_account_id);

  return (
    <AppLayout>
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Chart of Accounts</CardTitle>
            <CardDescription>Manage your company's financial accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-4">
              <Input
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
              <Select onValueChange={setFilterAccountType} value={filterAccountType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Asset">Asset</SelectItem>
                  <SelectItem value="Liability">Liability</SelectItem>
                  <SelectItem value="Equity">Equity</SelectItem>
                  <SelectItem value="Revenue">Revenue</SelectItem>
                  <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(value: 'All' | 'true' | 'false') => setFilterIsActive(value === 'All' ? 'All' : value === 'true')} value={String(filterIsActive)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add New Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Account</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddAccount} className="space-y-4">
                      <div>
                        <Label htmlFor="account_code">Account Code</Label>
                        <Input
                          id="account_code"
                          value={newAccountCode}
                          onChange={(e) => setNewAccountCode(e.target.value)}
                          required
                        />
                        {addFormErrors.account_code && <p className="text-red-500 text-sm">{addFormErrors.account_code}</p>}
                      </div>
                      <div>
                        <Label htmlFor="account_name">Account Name</Label>
                        <Input
                          id="account_name"
                          value={newAccountName}
                          onChange={(e) => setNewAccountName(e.target.value)}
                          required
                        />
                        {addFormErrors.account_name && <p className="text-red-500 text-sm">{addFormErrors.account_name}</p>}
                      </div>
                      <div>
                        <Label htmlFor="account_type">Account Type</Label>
                        <Select onValueChange={setNewAccountType} value={newAccountType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an account type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Asset">Asset</SelectItem>
                            <SelectItem value="Liability">Liability</SelectItem>
                            <SelectItem value="Equity">Equity</SelectItem>
                            <SelectItem value="Revenue">Revenue</SelectItem>
                            <SelectItem value="Expense">Expense</SelectItem>
                          </SelectContent>
                        </Select>
                        {addFormErrors.account_type && <p className="text-red-500 text-sm">{addFormErrors.account_type}</p>}
                      </div>
                      {newAccountType && parentAccounts.length > 0 && (
                        <div>
                          <Label htmlFor="parent_account">Parent Account</Label>
                          <Select onValueChange={setNewParentAccountId} value={newParentAccountId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a parent account (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              {parentAccounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id}>
                                  {acc.account_name} ({acc.account_code})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                         <input
                          type="checkbox"
                          id="is_active"
                          checked={newIsActive}
                          onChange={(e) => setNewIsActive(e.target.checked)}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="is_active">Is Active</Label>
                      </div>
                    <Button type="submit">Add Account</Button>
                    {addFormErrors.form && <p className="text-red-500 text-sm">{addFormErrors.form}</p>}
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <AccountTreeTable accounts={filteredAccounts} onEditAccount={handleEditAccount} onDeleteAccount={handleDeleteAccount} />
          </CardContent>
        </Card>

        {/* Edit Account Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
            </DialogHeader>
            {editingAccount && (
              <form onSubmit={handleUpdateAccount} className="space-y-4">
                <div>
                    <Label htmlFor="edit_account_code">Account Code</Label>
                    <Input
                      id="edit_account_code"
                      value={editingAccount.account_code}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_account_name">Account Name</Label>
                    <Input
                      id="edit_account_name"
                      value={editingAccount.account_name}
                      onChange={(e) => setEditingAccount({ ...editingAccount, account_name: e.target.value })}
                      required
                    />
                    {editFormErrors.account_name && <p className="text-red-500 text-sm">{editFormErrors.account_name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="edit_account_type">Account Type</Label>
                    <Input
                      id="edit_account_type"
                      value={editingAccount.account_type}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_description">Description</Label>
                    <Input
                      id="edit_description"
                      value={editingAccount.description || ''}
                      onChange={(e) => setEditingAccount({ ...editingAccount, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit_is_active"
                      checked={editingAccount.is_active}
                      onChange={(e) => setEditingAccount({ ...editingAccount, is_active: e.target.checked })}
                      className="h-4 w-4"
                    />
                     <Label htmlFor="edit_is_active">Is Active</Label>
                  </div>
                <Button type="submit">Save Changes</Button>
                {editFormErrors.form && <p className="text-red-500 text-sm">{editFormErrors.form}</p>}
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
