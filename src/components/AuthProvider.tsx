'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Session, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { TenantProvider } from './TenantProvider';
import { SidebarProvider } from './ui/sidebar';
import { AppSidebar } from './app-sidebar';

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
      };
      try {
        const authUser = session.user;
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, role')
          .eq('id', authUser.id)
          .single();
        if (!error && data) {
          setUserProfile({ id: data.id, name: data.name, email: data.email, role: data.role });
        } else {
          setUserProfile({ id: authUser.id, name: authUser.user_metadata?.full_name || authUser.email, email: authUser.email || '', role: null });
        }
      } catch (e) {
        if(session?.user) {
          setUserProfile({ id: session.user.id, name: session.user.user_metadata?.full_name || session.user.email, email: session.user.email || '', role: null });
        }
      }
    };
    loadProfile();
  }, [session]);

  const value = { session, supabase, userProfile };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (session) {
    return (
      <AuthContext.Provider value={value}>
        <TenantProvider>
          <SidebarProvider>
            <div className="flex min-h-screen flex-col">
              <div className="flex flex-1">
                <AppSidebar />
                <main className="flex-1 flex flex-col pl-16">
                  <div className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </TenantProvider>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
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
