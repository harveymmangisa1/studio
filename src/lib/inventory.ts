import { supabase } from './supabase';
import type { UUID, StockMovementReason } from './types';

export async function isPeriodOpen(date: string): Promise<boolean> {
  const period = date.slice(0,7); // YYYY-MM
  const { data, error } = await supabase
    .from('fiscal_periods')
    .select('status')
    .eq('period', period)
    .single();
  if (error && (error as any).code !== 'PGRST116') { // not found acceptable => treated as open
    throw error;
  }
  if (!data) return true; // no record means open by default
  return (data as any).status === 'Open';
}

export async function adjustStock(params: {
  productId: UUID;
  qtyChange: number; // + receive, - sale
  reason: StockMovementReason;
  referenceType?: string;
  referenceId?: string;
  unitCost?: number; // required for receipts
  date?: string; // ISO date
}) {
  const date = params.date ?? new Date().toISOString();
  const open = await isPeriodOpen(date.slice(0,10));
  if (!open) throw new Error('Posting locked: fiscal period is closed');

  const { error } = await supabase
    .from('stock_movements')
    .insert({
      product_id: params.productId,
      qty_change: params.qtyChange,
      reason: params.reason,
      reference_type: params.referenceType ?? null,
      reference_id: params.referenceId ?? null,
      unit_cost: params.unitCost ?? 0,
      created_at: date,
    });
  if (error) throw error;
}

export async function receivePurchaseLine(productId: UUID, quantity: number, unitCost: number) {
  // Update weighted average cost: new_avg = (old_qty*old_avg + qty*unitCost) / (old_qty + qty)
  const { data: stockRows } = await supabase
    .from('v_product_stock')
    .select('current_qty')
    .eq('product_id', productId)
    .single();
  const oldQty = Number((stockRows as any)?.current_qty || 0);

  const { data: prod, error: pErr } = await supabase
    .from('products')
    .select('avg_cost')
    .eq('id', productId)
    .single();
  if (pErr) throw pErr;

  const oldAvg = Number((prod as any)?.avg_cost || 0);
  const newQty = oldQty + quantity;
  const newAvg = newQty > 0 ? ((oldQty * oldAvg) + (quantity * unitCost)) / newQty : unitCost;

  const { error: uErr } = await supabase
    .from('products')
    .update({ avg_cost: newAvg })
    .eq('id', productId);
  if (uErr) throw uErr;

  await adjustStock({ productId, qtyChange: quantity, reason: 'purchase', unitCost });
}

export async function cogsForSale(productId: UUID, quantity: number): Promise<number> {
  const { data, error } = await supabase
    .from('products')
    .select('avg_cost')
    .eq('id', productId)
    .single();
  if (error) throw error;
  const avg = Number((data as any)?.avg_cost || 0);
  return Number((avg * quantity).toFixed(2));
}
