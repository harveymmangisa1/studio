import { supabase } from './supabase';

/**
 * Calculates the Profit & Loss for a given period using journal_entries and accounts.
 */
export async function calculateProfitAndLoss(startDate: string, endDate: string) {
  // Revenue: sum credits of Revenue accounts
  const { data: revRows, error: revErr } = await supabase
    .from('journal_entries')
    .select('debit, credit, accounts!inner(account_type)')
    .gte('journal_batches.date', startDate)
    .lte('journal_batches.date', endDate);
  if (revErr) throw revErr;

  let totalRevenue = 0;
  let totalCOGS = 0;
  let totalExpenses = 0;

  (revRows || []).forEach((r: any) => {
    const t = r.accounts.account_type;
    if (t === 'Revenue') totalRevenue += Number(r.credit || 0) - Number(r.debit || 0);
    if (t === 'Expense') totalExpenses += Number(r.debit || 0) - Number(r.credit || 0);
    if (t === 'Expense' && r.accounts.account_name === 'Cost of Goods Sold') totalCOGS += Number(r.debit || 0) - Number(r.credit || 0);
  });

  const grossProfit = totalRevenue - totalCOGS;
  const netProfit = grossProfit - totalExpenses;

  return { revenue: totalRevenue, cogs: totalCOGS, gross_profit: grossProfit, expenses: totalExpenses, net_profit: netProfit };
}

/**
 * Calculates a simple Balance Sheet based on journal entries by account type.
 */
export async function calculateBalanceSheet(asOfDate?: string) {
  const { data: rows, error } = await supabase
    .from('journal_entries')
    .select('debit, credit, accounts!inner(account_type)')
    .lte('journal_batches.date', asOfDate ?? new Date().toISOString().slice(0, 10));
  if (error) throw error;

  let assets = 0, liabilities = 0, equity = 0;
  (rows || []).forEach((r: any) => {
    const t = r.accounts.account_type;
    if (t === 'Asset') assets += Number(r.debit || 0) - Number(r.credit || 0);
    else if (t === 'Liability') liabilities += Number(r.credit || 0) - Number(r.debit || 0);
    else if (t === 'Equity') equity += Number(r.credit || 0) - Number(r.debit || 0);
  });

  return { assets, liabilities, equity };
}
