// Common types for accounting and app

export type UUID = string;

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
export type NormalBalance = 'Debit' | 'Credit';

export interface Account {
  id: UUID;
  account_code: string;
  account_name: string;
  account_type: AccountType;
  normal_balance?: NormalBalance;
  parent_account_id?: UUID | null;
  is_active?: boolean;
  description?: string;
}

export interface JournalEntry {
  account_id: UUID;
  debit: number; // >= 0
  credit: number; // >= 0
  memo?: string;
}

export interface JournalBatch {
  id?: UUID;
  date: string; // ISO date
  description?: string;
  source_type: string; // e.g., 'AR_INVOICE', 'AR_PAYMENT', 'BILL', 'EXPENSE', 'PAYROLL'
  source_id?: string;
  entries: JournalEntry[];
}

export type PaymentMethod = 'cash' | 'card' | 'bank' | 'transfer' | 'cheque';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
export type TimeRange = 'day' | 'week' | 'month' | 'year';

export type SalesStatus = 'Draft' | 'Accepted' | 'Paid' | 'Cancelled' | 'Overdue';

export type StockMovementReason = 'sale' | 'purchase' | 'adjustment' | 'return' | 'transfer';
