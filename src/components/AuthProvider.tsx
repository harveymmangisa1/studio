
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Session, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { TenantProvider } from './TenantProvider';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  session: Session | null;
  supabase: SupabaseClient;
  userProfile: { id: string; name: string | null; email: string; role?: string | null } | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ id: string; name: string | null; email: string; role?: string | null } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user) {
        setUserProfile(null);
        return;
      }

      const userId = session.user.id;

      try {
        const { data, error } = await supabase
          .from('tenant_users')
          .select('role, tenants!fk_tenant(company_name), tenant_id')
          .eq('user_id', userId)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.warn('Unable to load tenant user profile:', error.message);
        }

        setUserProfile({
          id: userId,
          name: session.user.user_metadata?.full_name || session.user.email,
          email: session.user.email || '',
          role: data?.role || session.user.user_metadata?.role || 'Admin'
        });
      } catch (profileError) {
        console.error('Error loading profile information:', profileError);
        setUserProfile({
          id: userId,
          name: session.user.user_metadata?.full_name || session.user.email,
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'Admin'
        });
      }
    };

    loadProfile();
  }, [session]);

  const value = { session, supabase, userProfile, loading };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  
  return (
    <AuthContext.Provider value={value}>
      <TenantProvider>
        {children}
      </TenantProvider>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
