'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Session, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import LoginPage from '@/app/auth/login/page';
import { TenantProvider } from './TenantProvider';
import { SidebarProvider, SidebarInset } from './ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { usePathname } from 'next/navigation';

type AuthContextType = {
  session: Session | null;
  supabase: SupabaseClient;
  userProfile: { id: string; name: string | null; email: string; role?: string | null } | null;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ id: string; name: string | null; email: string; role?: string | null } | null>(null);
  const pathname = usePathname();

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

  // Load user profile from users table once session is available
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const authUser = session.user;
        if (!authUser) return;
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, role')
          .eq('id', authUser.id)
          .single();
        if (!error && data) {
          setUserProfile({ id: data.id, name: data.name, email: data.email, role: data.role });
        } else {
          // fallback to auth values
          setUserProfile({ id: authUser.id, name: authUser.user_metadata?.name || null, email: authUser.email || '', role: null });
        }
      } catch (e) {
        setUserProfile({ id: session.user.id, name: session.user.user_metadata?.name || null, email: session.user.email || '', role: null });
      }
    };
    loadProfile();
  }, [session]);

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  // If there's no session and the user is not on a public page, show login.
  if (!session) {
      return <LoginPage />;
  }

  // If there is a session, show the main app layout.
  return (
    <AuthContext.Provider value={{ session, supabase, userProfile }}>
      <TenantProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <div className="p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
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
