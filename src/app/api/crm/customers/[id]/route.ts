import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';


function extractTenantFromRequest(req: Request): string | null {
  const h = req.headers.get('X-Tenant-Id') || req.headers.get('x-tenant-id');
  if (h) return h;
  const cookieHeader = req.headers.get('cookie') || '';
  const m = cookieHeader.match(/tenant_id=([^;]+)/);
  if (m) return m[1];
  return null;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const tenantId = extractTenantFromRequest(req);
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant context missing' }, { status: 401 });
  }
  const supabase = getSupabase(tenantId);
  const { data, error } = await supabase.from('customers').select('*').eq('id', params.id).maybeSingle();
  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
  if (!data) {
    return new NextResponse(JSON.stringify({ error: 'Not found' }), { status: 404 });
  }
  return NextResponse.json(data);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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
  const updates: any = {};
  if (typeof body?.name !== 'undefined') updates.name = body.name;
  if (typeof body?.email !== 'undefined') updates.email = body.email;
  if (Object.keys(updates).length === 0) {
    return new NextResponse(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
  }
  updates.updated_at = new Date().toISOString();
  const { data, error } = await supabase.from('customers').update(updates).eq('id', params.id).single();
  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return NextResponse.json(data ?? updates);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const tenantId = extractTenantFromRequest(req);
  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant context missing' }, { status: 401 });
  }
  const supabase = getSupabase(tenantId);
  const { data, error } = await supabase.from('customers').delete().eq('id', params.id).single();
  if (error) {
    return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return NextResponse.json(data ?? { id: params.id });
}
