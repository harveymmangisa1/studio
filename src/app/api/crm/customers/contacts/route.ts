import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  return 'crm_contact_' + Math.random().toString(36).slice(2, 8) + '_' + Date.now().toString(36);
}

function extractTenantFromRequest(req: Request): string {
  const h = req.headers.get('X-Tenant-Id') || req.headers.get('x-tenant-id');
  if (h) return h;
  const cookieHeader = req.headers.get('cookie') || '';
  const m = cookieHeader.match(/tenant_id=([^;]+)/);
  if (m) return m[1];
  return 'default-tenant';
}

export async function GET(req: Request) {
  const tenantId = extractTenantFromRequest(req);
  let supabase: any;
  try {
    supabase = getSupabase(tenantId);
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err?.message ?? 'Supabase not configured' }), { status: 500 });
  }
  const { data, error } = await supabase.from('customer_contacts').select('*');
  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const tenantId = extractTenantFromRequest(req);
  let supabase: any;
  try {
    supabase = getSupabase(tenantId);
  } catch (err: any) {
    return new NextResponse(JSON.stringify({ error: err?.message ?? 'Supabase not configured' }), { status: 500 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new NextResponse(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
  const { customer_id, contact_type, value } = body || {};
  if (!customer_id || !value) {
    return new NextResponse(JSON.stringify({ error: 'customer_id and value are required' }), { status: 400 });
  }
  const id = generateUuid();
  const payload = {
    tenant_id: tenantId,
    id,
    customer_id,
    contact_type: contact_type ?? null,
    value: value,
  } as any;
  const { data, error } = await supabase.from('customer_contacts').insert([payload]).single();
  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return NextResponse.json(data ?? payload);
}
