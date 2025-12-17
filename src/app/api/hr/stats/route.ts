
import { NextResponse, NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const tenantId = req.headers.get('x-tenant-id');
    if (!tenantId) {
        return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }
    const supabase = getSupabase(tenantId);

    const today = new Date().toISOString().slice(0, 10);

    const {
        data: totalEmployeesData,
        error: totalEmployeesError,
        count: totalEmployeesCount,
    } = await supabase.from('employees').select('id', { count: 'exact' }).eq('tenant_id', tenantId);

    const {
        data: activeTodayData,
        error: activeTodayError,
        count: activeTodayCount,
    } = await supabase.from('attendance').select('id', { count: 'exact' }).eq('date', today).eq('tenant_id', tenantId);

    const {
        data: onLeaveData,
        error: onLeaveError,
        count: onLeaveCount,
    } = await supabase.from('leave').select('id', { count: 'exact' }).eq('status', 'Approved').lte('start_date', today).gte('end_date', today).eq('tenant_id', tenantId);

    const {
        data: pendingApprovalsData,
        error: pendingApprovalsError,
        count: pendingApprovalsCount,
    } = await supabase.from('leave').select('id', { count: 'exact' }).eq('status', 'Pending').eq('tenant_id', tenantId);

    if (totalEmployeesError || activeTodayError || onLeaveError || pendingApprovalsError) {
        console.error(
            totalEmployeesError || activeTodayError || onLeaveError || pendingApprovalsError
        );
        return NextResponse.json(
            { error: 'Failed to fetch HR stats' },
            { status: 500 }
        );
    }

    const stats = {
        totalEmployees: totalEmployeesCount,
        activeToday: activeTodayCount,
        onLeave: onLeaveCount,
        pendingApprovals: pendingApprovalsCount,
    };

    return NextResponse.json(stats);
}
