
import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // @ts-ignore
    return crypto.randomUUID();
  }
  // Fallback simple UUID-ish
  return 'crm_' + Math.random().toString(36).slice(2, 8) + '_' + Date.now().toString(36);
}

export async function GET(req: Request) {
  const tenantId = req.headers.get('X-Tenant-Id') ?? req.headers.get('x-tenant-id');
  if (!tenantId) {
    return new Response(JSON.stringify({ error: 'Tenant header missing' }), { status: 400 });
  }
  const supabase = getSupabase(tenantId);
  const { data, error } = await supabase.from('customers').select('*').order('name', { ascending: true });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(req: Request) {
  const tenantId = req.headers.get('X-Tenant-Id') ?? req.headers.get('x-tenant-id');
  if (!tenantId) {
    return new Response(JSON.stringify({ error: 'Tenant header missing' }), { status: 400 });
  }
  const supabase = getSupabase(tenantId);
  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }
  const { name, email } = body || {};
  if (!name) {
    return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400 });
  }
  const id = generateUuid();
  const now = new Date().toISOString();
  const payload = {
    tenant_id: tenantId,
    id,
    name,
    email: email || null,
    created_at: now,
    updated_at: now,
  } as any;

  const { data, error } = await supabase.from('customers').insert([payload]).single();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return NextResponse.json(data ?? payload);
}
