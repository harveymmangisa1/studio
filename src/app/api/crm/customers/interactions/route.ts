import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in (crypto as any)) {
    // @ts-ignore
    return (crypto as any).randomUUID();
  }
  return 'crm_' + Math.random().toString(36).slice(2, 8) + '_' + Date.now().toString(36);
}

function extractTenantFromRequest(req: Request): string | null {
  const h = req.headers.get('X-Tenant-Id') || req.headers.get('x-tenant-id');
  if (h) return h;
  const cookieHeader = req.headers.get('cookie') || '';
  const m = cookieHeader.match(/tenant_id=([^;]+)/);
  if (m) return m[1];
  return null;
}

export async function GET(req: Request) {
  const tenantId = extractTenantFromRequest(req);
  if (!tenantId) {
    return new NextResponse(JSON.stringify({ error: 'Tenant context missing' }), { status: 401 });
  }
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
  if (!tenantId) {
    return new NextResponse(JSON.stringify({ error: 'Tenant context missing' }), { status: 401 });
  }
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
