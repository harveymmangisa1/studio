import { supabase } from './supabase';

/**
 * Calculates the Profit & Loss for a given period.
 * @param startDate - The start date of the period.
 * @param endDate - The end date of the period.
 * @returns An object containing revenue, cogs, gross_profit, expenses, and net_profit.
 */
export async function calculateProfitAndLoss(startDate: string, endDate: string) {
  // Resolve account ids by conventional names
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id, account_name');
  if (accountsError) throw accountsError;

  const revenueAccountIds = accounts
    ?.filter(a => a.account_name?.toLowerCase().includes('revenue'))
    .map(a => a.id) || [];
  const cogsAccountIds = accounts
    ?.filter(a => a.account_name?.toLowerCase().includes('cost of goods sold') || a.account_name === 'COGS')
    .map(a => a.id) || [];
  const expenseAccountIds = accounts
    ?.filter(a => a.account_name && !a.account_name.toLowerCase().includes('revenue') && !a.account_name.toLowerCase().includes('inventory') && !a.account_name.toLowerCase().includes('accounts receivable') && !a.account_name.toLowerCase().includes('cash') && a.account_name !== 'Cost of Goods Sold')
    .map(a => a.id) || [];

  // Revenue: sum credits for revenue accounts
  const { data: revenueData, error: revenueError } = await supabase
    .from('ledger_entries')
    .select('credit_amount, account_id')
    .in('account_id', revenueAccountIds)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);
  if (revenueError) throw revenueError;
  const totalRevenue = (revenueData || []).reduce((sum, entry) => sum + Number(entry.credit_amount || 0), 0);

  // COGS: sum debits for COGS accounts
  const { data: cogsData, error: cogsError } = await supabase
    .from('ledger_entries')
    .select('debit_amount, account_id')
    .in('account_id', cogsAccountIds)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);
  if (cogsError) throw cogsError;
  const totalCOGS = (cogsData || []).reduce((sum, entry) => sum + Number(entry.debit_amount || 0), 0);

  // Expenses: sum debits for expense accounts
  const { data: expenseData, error: expenseError } = await supabase
    .from('ledger_entries')
    .select('debit_amount, account_id')
    .in('account_id', expenseAccountIds)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);
  if (expenseError) throw expenseError;
  const totalExpenses = (expenseData || []).reduce((sum, entry) => sum + Number(entry.debit_amount || 0), 0);

  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;

  return {
    revenue: totalRevenue,
    cogs: totalCOGS,
    gross_profit: grossProfit,
    expenses: totalExpenses,
    net_profit: netProfit,
  };
}

/**
 * Calculates the Balance Sheet.
 * @returns An object containing total assets, liabilities, and equity.
 */
export async function calculateBalanceSheet() {
  const { data: accounts, error } = await supabase
    .from('accounts')
    .select('balance, account_type');
  if (error) throw error;

  const totals = (accounts || []).reduce(
    (acc, account) => {
      const balance = Number(account.balance || 0);
      if (account.account_type === 'Asset') acc.assets += balance;
      else if (account.account_type === 'Liability') acc.liabilities += balance;
      else if (account.account_type === 'Equity') acc.equity += balance;
      return acc;
    },
    { assets: 0, liabilities: 0, equity: 0 }
  );

  return {
    assets: totals.assets,
    liabilities: totals.liabilities,
    equity: totals.equity,
  };
}
