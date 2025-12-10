
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { data: tenantLink, error: tenantLinkError } = await supabase
      .from('tenant_users')
      .select('tenant_id')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (tenantLinkError) {
      throw tenantLinkError;
    }

    if (!tenantLink?.tenant_id) {
      return NextResponse.json({ error: 'No tenant assigned to user' }, { status: 404 });
    }

    const { data: tenantInfo, error } = await supabase
      .from('tenants')
      .select('*, tenant_settings(*)')
      .eq('id', tenantLink.tenant_id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json(tenantInfo);
  } catch (error: any) {
    console.error('Error fetching tenant data:', error.message);
    return NextResponse.json({ error: 'Failed to fetch tenant data', details: error.message }, { status: 500 });
  }
}
