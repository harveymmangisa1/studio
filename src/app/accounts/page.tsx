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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { Checkbox } from '@/components/ui/checkbox';
import { MoreHorizontal } from 'lucide-react';

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

  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data, error } = await supabase.from('accounts').select('*, parent_account_id');
        if (error) {
          throw error;
        }
        setAccounts(data || []);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

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
        if (!validRange) {
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
    setAddFormErrors({});

    const newAccountData = {
      account_code: newAccountCode,
      account_name: newAccountName,
      account_type: newAccountType,
      parent_account_id: newParentAccountId === '' ? null : newParentAccountId,
      description: newDescription,
      is_active: newIsActive,
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
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setAccounts([...accounts, data[0]]);
        // Reset form
        setNewAccountCode('');
        setNewAccountName('');
        setNewAccountType('');
        setNewParentAccountId(undefined);
        setNewDescription('');
        setNewIsActive(true);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccount(account);
    setIsEditDialogOpen(true);
    setEditFormErrors({}); // Clear previous errors
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

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
          // account_code and account_type are not editable as per spec
        })
        .eq('id', editingAccount.id)
        .select();

      if (error) {
        throw error;
      }

      if (data) {
        setAccounts(accounts.map(acc => (acc.id === data[0].id ? data[0] : acc)));
        setIsEditDialogOpen(false);
        setEditingAccount(null);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

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

  const parentAccounts = accounts.filter(acc => acc.account_type === newAccountType);

  return (
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
                <form onSubmit={handleAddAccount}>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="account_code" className="text-right">
                        Account Code
                      </Label>
                    <Input
                      id="account_code"
                      value={newAccountCode}
                      onChange={(e) => setNewAccountCode(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  {addFormErrors.account_code && <p className="col-span-4 text-right text-red-500 text-sm">{addFormErrors.account_code}</p>}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="account_name" className="text-right">
                      Account Name
                    </Label>
                    <Input
                      id="account_name"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                      className="col-span-3"
                      required
                    />
                  </div>
                  {addFormErrors.account_name && <p className="col-span-4 text-right text-red-500 text-sm">{addFormErrors.account_name}</p>}
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="account_type" className="text-right">
                      Account Type
                    </Label>
                    <Select onValueChange={setNewAccountType} value={newAccountType} required>
                      <SelectTrigger className="col-span-3">
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
                  </div>
                  {addFormErrors.account_type && <p className="col-span-4 text-right text-red-500 text-sm">{addFormErrors.account_type}</p>}
                  {newAccountType && parentAccounts.length > 0 && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="parent_account" className="text-right">
                        Parent Account
                      </Label>
                      <Select onValueChange={setNewParentAccountId} value={newParentAccountId} >
                        <SelectTrigger className="col-span-3">
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is_active" className="text-right">
                      Is Active
                    </Label>
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={newIsActive}
                      onChange={(e) => setNewIsActive(e.target.checked)}
                      className="col-span-3 w-4 h-4"
                    />
                  </div>
                </div>
                <Button type="submit">Add Account</Button>
              </form>
            </DialogContent>
          </Dialog>

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
            <form onSubmit={handleUpdateAccount}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_account_code" className="text-right">
                    Account Code
                  </Label>
                  <Input
                    id="edit_account_code"
                    value={editingAccount.account_code}
                    className="col-span-3"
                    disabled
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_account_name" className="text-right">
                    Account Name
                  </Label>
                  <Input
                    id="edit_account_name"
                    value={editingAccount.account_name}
                    onChange={(e) => setEditingAccount({ ...editingAccount, account_name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                {editFormErrors.account_name && <p className="col-span-4 text-right text-red-500 text-sm">{editFormErrors.account_name}</p>}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_account_type" className="text-right">
                    Account Type
                  </Label>
                  <Input
                    id="edit_account_type"
                    value={editingAccount.account_type}
                    className="col-span-3"
                    disabled
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="edit_description"
                    value={editingAccount.description || ''}
                    onChange={(e) => setEditingAccount({ ...editingAccount, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit_is_active" className="text-right">
                    Is Active
                  </Label>
                  <input
                    type="checkbox"
                    id="edit_is_active"
                    checked={editingAccount.is_active}
                    onChange={(e) => setEditingAccount({ ...editingAccount, is_active: e.target.checked })}
                    className="col-span-3 w-4 h-4"
                  />
                </div>
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
