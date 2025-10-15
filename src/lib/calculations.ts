import { supabase } from './supabase';

/**
 * Calculates the Profit & Loss for a given period.
 * @param startDate - The start date of the period.
 * @param endDate - The end date of the period.
 * @returns An object containing revenue, cogs, gross_profit, expenses, and net_profit.
 */
export async function calculateProfitAndLoss(startDate: string, endDate: string) {
  // Fetch revenue
  const { data: revenueData, error: revenueError } = await supabase
    .from('ledger_entries')
    .select('credit_amount')
    .eq('account_type', 'Revenue') // This assumes account_type is on ledger_entries
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  if (revenueError) throw revenueError;
  const totalRevenue = revenueData.reduce((sum, entry) => sum + entry.credit_amount, 0);

  // Fetch Cost of Goods Sold (COGS)
  const { data: cogsData, error: cogsError } = await supabase
    .from('ledger_entries')
    .select('debit_amount')
    .eq('account_type', 'COGS')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  if (cogsError) throw cogsError;
  const totalCOGS = cogsData.reduce((sum, entry) => sum + entry.debit_amount, 0);

  // Fetch Expenses
  const { data: expenseData, error: expenseError } = await supabase
    .from('ledger_entries')
    .select('debit_amount')
    .eq('account_type', 'Expense')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);

  if (expenseError) throw expenseError;
  const totalExpenses = expenseData.reduce((sum, entry) => sum + entry.debit_amount, 0);

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
  // Fetch total assets
  const { data: assetsData, error: assetsError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('account_type', 'Asset');

  if (assetsError) throw assetsError;
  const totalAssets = assetsData.reduce((sum, account) => sum + account.balance, 0);

  // Fetch total liabilities
  const { data: liabilitiesData, error: liabilitiesError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('account_type', 'Liability');

  if (liabilitiesError) throw liabilitiesError;
  const totalLiabilities = liabilitiesData.reduce((sum, account) => sum + account.balance, 0);

  // Fetch total equity
  const { data: equityData, error: equityError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('account_type', 'Equity');

  if (equityError) throw equityError;
  const totalEquity = equityData.reduce((sum, account) => sum + account.balance, 0);

  return {
    assets: totalAssets,
    liabilities: totalLiabilities,
    equity: totalEquity,
  };
}
