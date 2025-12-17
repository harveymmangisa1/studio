
import { NextResponse, NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Get all attendance records
export async function GET(req: NextRequest) {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
        return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }
    const supabase = getSupabase(tenantId);
    const { data, error } = await supabase.from('attendance').select('*, employees (*)').eq('tenant_id', tenantId);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}
