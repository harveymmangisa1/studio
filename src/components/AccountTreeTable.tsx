import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface AccountTreeTableProps {
  accounts: Account[];
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
}

const AccountTreeTable: React.FC<AccountTreeTableProps> = ({ accounts, onEditAccount, onDeleteAccount }) => {
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const buildAccountTree = (
    allAccounts: Account[],
    parentId: string | null = null,
    level: number = 0
  ) => {
    return allAccounts
      .filter(account => (parentId === null ? !account.parent_account_id : account.parent_account_id === parentId))
      .sort((a, b) => a.account_code.localeCompare(b.account_code))
      .map(account => (
        <React.Fragment key={account.id}>
          <TableRow>
            <TableCell style={{ paddingLeft: `${level * 20 + 16}px` }}>
              <div className="flex items-center">
                {allAccounts.some(acc => acc.parent_account_id === account.id) && (
                  <ChevronRight
                    className={`w-4 h-4 mr-2 cursor-pointer transition-transform ${
                      expandedAccounts.has(account.id) ? 'rotate-90' : ''
                    }`}
                    onClick={() => toggleExpand(account.id)}
                  />
                )}
                {account.account_code}
              </div>
            </TableCell>
            <TableCell>{account.account_name}</TableCell>
            <TableCell>{account.account_type}</TableCell>
            <TableCell>{account.description}</TableCell>
            <TableCell>{account.is_active ? 'Yes' : 'No'}</TableCell>
            <TableCell className="text-right">{account.balance.toFixed(2)}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onEditAccount(account)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDeleteAccount(account.id)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          {expandedAccounts.has(account.id) &&
            buildAccountTree(allAccounts, account.id, level + 1)}
        </React.Fragment>
      ));
  };

  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.account_type]) {
      acc[account.account_type] = [];
    }
    acc[account.account_type].push(account);
    return acc;
  }, {} as Record<string, Account[]>);

  const accountTypesOrder = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead>Account Code</TableHead>
          <TableHead>Account Name</TableHead>
          <TableHead>Account Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Active</TableHead>
          <TableHead className="text-right">Balance</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accountTypesOrder.map(type => {
          const accountsOfType = groupedAccounts[type];
          if (!accountsOfType || accountsOfType.length === 0) return null;

          return (
            <React.Fragment key={type}>
              <TableRow className="bg-gray-100 hover:bg-gray-100">
                <TableCell colSpan={7} className="font-bold text-lg">
                  <div className="flex items-center">
                    <ChevronRight
                      className={`w-5 h-5 mr-2 cursor-pointer transition-transform ${
                        expandedAccounts.has(type) ? 'rotate-90' : ''
                      }`}
                      onClick={() => toggleExpand(type)}
                    />
                    {type} ({type === 'Asset' || type === 'Expense' ? 'Debit Balance' : 'Credit Balance'})
                  </div>
                </TableCell>
              </TableRow>
              {expandedAccounts.has(type) && buildAccountTree(accountsOfType, null, 1)}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default AccountTreeTable;
