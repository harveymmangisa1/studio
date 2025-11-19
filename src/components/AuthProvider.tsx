
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
      if (session?.user) {
        // Fallback to user metadata if 'users' table is not available or fails
        setUserProfile({ 
          id: session.user.id, 
          name: session.user.user_metadata?.full_name || session.user.email, 
          email: session.user.email || '', 
          role: 'Admin' // Default role
        });
      } else {
        setUserProfile(null);
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
