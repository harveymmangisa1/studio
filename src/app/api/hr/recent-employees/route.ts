
import { NextResponse, NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
        return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }
    const supabase = getSupabase(tenantId);

    const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('hire_date', { ascending: false })
        .limit(5);

    if (error) {
        console.error(error);
        return NextResponse.json(
            { error: 'Failed to fetch recent employees' },
            { status: 500 }
        );
    }

    return NextResponse.json(data);
}
