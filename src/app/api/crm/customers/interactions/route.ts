import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { generateUuid, extractTenantFromRequest } from '@/lib/crm/utils';

export async function GET(req: Request) {
  const tenantId = extractTenantFromRequest(req);
  const supabase = getSupabase(tenantId);
  const { searchParams } = new URL(req.url);
  const customerId = searchParams.get('customerId');

  let query = supabase.from('customer_interactions').select('*');
  if (customerId) {
    query = query.eq('customer_id', customerId);
  }

  const { data, error } = await query;

  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const tenantId = extractTenantFromRequest(req);
  const supabase = getSupabase(tenantId);
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
  const { customer_id, type, detail, interaction_date, created_by } = body || {};
  if (!customer_id || !type || !detail) {
    return new NextResponse(JSON.stringify({ error: 'customer_id, type, and detail are required' }), { status: 400 });
  }
  const id = generateUuid();
  const now = new Date().toISOString();
  const payload = {
    tenant_id: tenantId,
    id,
    customer_id,
    type,
    detail,
    interaction_date: interaction_date ?? now,
    created_by: created_by ?? null,
    created_at: now,
  } as any;
  const { data, error } = await supabase.from('customer_interactions').insert([payload]).select().single();
  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return NextResponse.json(data ?? payload);
}
