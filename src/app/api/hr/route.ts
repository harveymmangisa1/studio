
import { NextResponse, NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

// Get all employees
export async function GET(req: NextRequest) {
    // Get tenant ID from request headers
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
        return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }
    const supabase = getSupabase(tenantId);
    const { data, error } = await supabase.from('employees').select('*');
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}

// Create a new employee
export async function POST(req: NextRequest) {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
        return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }
    const supabase = getSupabase(tenantId);
    const employee = await req.json();
    const { data, error } = await supabase.from('employees').insert([employee]).select();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data[0]);
}
