
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
    } = await supabase.from('employees').select('id', { count: 'exact' });

    const {
        data: activeTodayData,
        error: activeTodayError,
    } = await supabase.from('attendance').select('id', { count: 'exact' }).eq('date', today);

    const {
        data: onLeaveData,
        error: onLeaveError,
    } = await supabase.from('leave').select('id', { count: 'exact' }).eq('status', 'Approved').lte('start_date', today).gte('end_date', today);

    const {
        data: pendingApprovalsData,
        error: pendingApprovalsError,
    } = await supabase.from('leave').select('id', { count: 'exact' }).eq('status', 'Pending');

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
        totalEmployees: totalEmployeesData.length,
        activeToday: activeTodayData.length,
        onLeave: onLeaveData.length,
        pendingApprovals: pendingApprovalsData.length,
    };

    return NextResponse.json(stats);
}
