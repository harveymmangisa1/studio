import { supabase } from './supabase';

interface LedgerTransaction {
  accountId: string;
  debit: number;
  credit: number;
  date: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
}

/**
 * Creates a double-entry transaction and ensures it is balanced.
 * @param entries - An array of ledger entries for the transaction.
 * @param description - A description of the overall transaction.
 * @param date - The date of the transaction.
 */
export async function createDoubleEntryTransaction(entries: Omit<LedgerTransaction, 'date' | 'description'>[]) {
  const totalDebits = entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredits = entries.reduce((sum, entry) => sum + entry.credit, 0);

  if (totalDebits !== totalCredits) {
    throw new Error('Transaction is not balanced. Debits must equal credits.');
  }

  const transactionDate = new Date().toISOString();

  const ledgerEntries = entries.map(entry => ({
    account_id: entry.accountId,
    debit_amount: entry.debit,
    credit_amount: entry.credit,
    transaction_date: transactionDate,
    description: `Transaction created on ${transactionDate}`,
    reference_type: entry.referenceType,
    reference_id: entry.referenceId,
  }));

  const { data, error } = await supabase.from('ledger_entries').insert(ledgerEntries).select();

  if (error) {
    throw error;
  }

  // After inserting, update account balances
  for (const entry of entries) {
    await updateAccountBalance(entry.accountId, entry.debit, entry.credit);
  }

  return data;
}

/**
 * Updates the balance of a single account.
 * @param accountId - The ID of the account to update.
 * @param debit - The debit amount to apply.
 * @param credit - The credit amount to apply.
 */
async function updateAccountBalance(accountId: string, debit: number, credit: number) {
  const { data: account, error: fetchError } = await supabase
    .from('accounts')
    .select('balance, account_type')
    .eq('id', accountId)
    .single();

  if (fetchError) throw fetchError;

  let newBalance = account.balance;
  // Asset and Expense accounts increase with debits
  if (['Asset', 'Expense'].includes(account.account_type)) {
    newBalance += debit - credit;
  } 
  // Liability, Equity, and Revenue accounts increase with credits
  else {
    newBalance += credit - debit;
  }

  const { error: updateError } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', accountId);

  if (updateError) throw updateError;
}

// Example of how to use createDoubleEntryTransaction for a sale
export async function recordSale(invoiceId: string, customerId: string, totalAmount: number, cogs: number) {
  // This is a simplified example. You would need to fetch the correct account IDs for
  // Accounts Receivable, Sales Revenue, Cost of Goods Sold, and Inventory.
  const accountsReceivableAccountId = '... a real account ID ...';
  const salesRevenueAccountId = '... a real account ID ...';
  const cogsAccountId = '... a real account ID ...';
  const inventoryAccountId = '... a real account ID ...';

  const entries = [
    // Debit Accounts Receivable to increase it
    { accountId: accountsReceivableAccountId, debit: totalAmount, credit: 0, referenceType: 'sales_invoice', referenceId: invoiceId },
    // Credit Sales Revenue to increase it
    { accountId: salesRevenueAccountId, debit: 0, credit: totalAmount, referenceType: 'sales_invoice', referenceId: invoiceId },
    
    // Debit COGS to recognize the expense
    { accountId: cogsAccountId, debit: cogs, credit: 0, referenceType: 'sales_invoice', referenceId: invoiceId },
    // Credit Inventory to decrease it
    { accountId: inventoryAccountId, debit: 0, credit: cogs, referenceType: 'sales_invoice', referenceId: invoiceId },
  ];

  await createDoubleEntryTransaction(entries);
}
