
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

  // A real multi-tenant app would resolve the tenant based on the user session.
  // For now, we fall back to a hardcoded default tenant ID for demonstration.
  const tenantId = session.user.user_metadata?.tenant_id ?? 'a8d6f397-8e3a-4b8d-9b3d-2e6b7d3b3e5c';

  try {
    const { data: tenantInfo, error } = await supabase
      .from('tenants')
      .select('*, tenant_settings(*)')
      .eq('id', tenantId)
      .single();
    
    if (error) {
      // If the specific tenant is not found, try the absolute fallback.
      // This helps during initial setup or if the user's tenant link is broken.
      if (error.code === 'PGRST116') {
         const { data: fallbackData, error: fallbackError } = await supabase
          .from('tenants')
          .select('*, tenant_settings(*)')
          .eq('id', 'a8d6f397-8e3a-4b8d-9b3d-2e6b7d3b3e5c') // Dummy Tenant ID
          .single();

        if (fallbackError) throw fallbackError;
        return NextResponse.json(fallbackData);
      }
      throw error;
    }
    
    return NextResponse.json(tenantInfo);
  } catch (error: any) {
    console.error('Error fetching tenant data:', error.message);
    return NextResponse.json({ error: 'Failed to fetch tenant data', details: error.message }, { status: 500 });
  }
}
