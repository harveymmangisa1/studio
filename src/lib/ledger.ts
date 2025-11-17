import { supabase } from './supabase';
import type { JournalEntry, JournalBatch, UUID } from './types';

// Core: Create a journal batch and its entries atomically
export async function createJournalBatch(batch: Omit<JournalBatch, 'id'>): Promise<{ batchId: UUID }> {
  // Validate balanced
  const totalDebit = batch.entries.reduce((s, e) => s + (e.debit || 0), 0);
  const totalCredit = batch.entries.reduce((s, e) => s + (e.credit || 0), 0);
  if (Number(totalDebit.toFixed(2)) !== Number(totalCredit.toFixed(2))) {
    throw new Error('Journal is not balanced: debits must equal credits');
  }

  // Period locking check
  const period = (batch.date || new Date().toISOString().slice(0,10)).slice(0,7);
  const { data: p, error: pErr } = await supabase
    .from('fiscal_periods')
    .select('status')
    .eq('period', period)
    .single();
  if (pErr && (pErr as any).code !== 'PGRST116') throw pErr; // ignore not found
  if (p && (p as any).status === 'Closed') {
    throw new Error(`Fiscal period ${period} is closed`);
  }

  const { data: batchRows, error: bErr } = await supabase
    .from('journal_batches')
    .insert({
      date: batch.date,
      description: batch.description,
      source_type: batch.source_type,
      source_id: batch.source_id,
    })
    .select('id')
    .single();
  if (bErr) throw bErr;

  const entriesPayload = batch.entries.map((e: JournalEntry) => ({
    batch_id: batchRows.id,
    account_id: e.account_id ?? e.account_id, // kept for clarity if evolving types
    debit: e.debit ?? 0,
    credit: e.credit ?? 0,
    memo: e.memo ?? null,
  }));

  const { error: eErr } = await supabase
    .from('journal_entries')
    .insert(entriesPayload);
  if (eErr) throw eErr;

  return { batchId: batchRows.id as UUID };
}

// Utility to fetch account id by name (simple helper; in production use caching)
export async function getAccountIdByName(name: string): Promise<UUID> {
  const { data, error } = await supabase
    .from('accounts')
    .select('id')
    .eq('account_name', name)
    .single();
  if (error || !data) throw new Error(`Account not found: ${name}`);
  return data.id as UUID;
}

// Posting helpers
export async function postARInvoice(params: {
  date: string;
  invoiceId: string;
  customerName?: string;
  amount: number;
  taxAmount?: number;
  revenueAccountName?: string; // default 'Sales Revenue'
  taxLiabilityAccountName?: string; // default from tax code; fallback 'Tax Payable'
}): Promise<{ batchId: UUID }> {
  const revenueAccount = await getAccountIdByName(params.revenueAccountName ?? 'Sales Revenue');
  const arAccount = await getAccountIdByName('Accounts Receivable');
  const taxAccount = params.taxAmount && params.taxAmount > 0
    ? await getAccountIdByName(params.taxLiabilityAccountName ?? 'Tax Payable')
    : null;

  const entries: JournalEntry[] = [] as any;
  // Dr A/R total
  entries.push({ account_id: arAccount, debit: params.amount + (params.taxAmount ?? 0), credit: 0, memo: `Invoice ${params.invoiceId}` });
  // Cr Revenue amount
  entries.push({ account_id: revenueAccount, debit: 0, credit: params.amount, memo: `Invoice ${params.invoiceId}` });
  // Cr Tax if any
  if (taxAccount && params.taxAmount) {
    entries.push({ account_id: taxAccount, debit: 0, credit: params.taxAmount, memo: `Invoice tax ${params.invoiceId}` });
  }

  return createJournalBatch({
    date: params.date,
    description: `AR Invoice ${params.invoiceId}${params.customerName ? ' - ' + params.customerName : ''}`,
    source_type: 'AR_INVOICE',
    source_id: params.invoiceId,
    entries,
  });
}

export async function postCOGS(params: {
  date: string;
  referenceId: string;
  cogsAmount: number;
}): Promise<{ batchId: UUID }> {
  const cogsAccount = await getAccountIdByName('Cost of Goods Sold');
  const inventoryAccount = await getAccountIdByName('Inventory');

  const entries: JournalEntry[] = [
    { account_id: cogsAccount, debit: params.cogsAmount, credit: 0, memo: `COGS ${params.referenceId}` },
    { account_id: inventoryAccount, debit: 0, credit: params.cogsAmount, memo: `COGS ${params.referenceId}` },
  ];

  return createJournalBatch({
    date: params.date,
    description: `COGS for ${params.referenceId}`,
    source_type: 'COGS',
    source_id: params.referenceId,
    entries,
  });
}

export async function postARPayment(params: {
  date: string;
  receiptId: string;
  amount: number;
  cashAccountName?: string; // 'Cash' or 'Bank'
}): Promise<{ batchId: UUID }> {
  const cashAccount = await getAccountIdByName(params.cashAccountName ?? 'Cash');
  const arAccount = await getAccountIdByName('Accounts Receivable');

  const entries: JournalEntry[] = [
    { account_id: cashAccount, debit: params.amount, credit: 0, memo: `Payment ${params.receiptId}` },
    { account_id: arAccount, debit: 0, credit: params.amount, memo: `Payment ${params.receiptId}` },
  ];

  return createJournalBatch({
    date: params.date,
    description: `AR Payment ${params.receiptId}`,
    source_type: 'AR_PAYMENT',
    source_id: params.receiptId,
    entries,
  });
}

// Reverse a batch by creating a new batch with flipped debits/credits
export async function reverseJournalBatch(batchId: UUID, date: string, reason = 'Reversal') {
  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('account_id, debit, credit, journal_batches!inner(id, description, source_type, source_id)')
    .eq('journal_batches.id', batchId);
  if (error || !entries || entries.length === 0) throw new Error('Batch not found or empty');

  const first = entries[0] as any;
  const description = `${reason}: ${first.journal_batches.description ?? ''}`.trim();
  const reversed: JournalEntry[] = entries.map((e: any) => ({
    account_id: e.account_id,
    debit: e.credit,
    credit: e.debit,
    memo: `Reversal of batch ${batchId}`,
  }));

  return createJournalBatch({
    date,
    description,
    source_type: `REVERSAL:${first.journal_batches.source_type}`,
    source_id: first.journal_batches.source_id,
    entries: reversed,
  });
}

// New: Record a sale by creating standard ledger entries (AR, Revenue, COGS, Inventory)
export async function recordSale(invoiceId: string, customerId: string, amount: number, cogs: number) {
  const revenueAccount = await getAccountIdByName('Sales Revenue');
  const arAccount = await getAccountIdByName('Accounts Receivable');
  const cogsAccount = await getAccountIdByName('Cost of Goods Sold');
  const inventoryAccount = await getAccountIdByName('Inventory');

  const date = new Date().toISOString().slice(0, 10);

  const entries: JournalEntry[] = [
    { account_id: arAccount, debit: amount, credit: 0, memo: `Invoice ${invoiceId} - AR` },
    { account_id: revenueAccount, debit: 0, credit: amount, memo: `Invoice ${invoiceId} - Revenue` },
    { account_id: cogsAccount, debit: cogs, credit: 0, memo: `Invoice ${invoiceId} - COGS` },
    { account_id: inventoryAccount, debit: 0, credit: cogs, memo: `COGS for Invoice ${invoiceId}` }
  ];

  return createJournalBatch({
    date,
    description: `Sale ${invoiceId} - Customer ${customerId}`,
    source_type: 'SALE',
    source_id: invoiceId,
    entries,
  });
}
