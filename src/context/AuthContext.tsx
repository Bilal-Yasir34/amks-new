import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, isAdmin: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
        setLoading(false);
      })();
    });

    return () => data.subscription.unsubscribe();
  }, []);

  // Admin check: user email matches admin email in settings, or user has admin flag in metadata
<<<<<<< HEAD
  const isAdmin = !!user && (user.user_metadata?.is_admin === true || user.email === 'admin@amks.pk');
=======
  const isAdmin = !!user && (user.user_metadata?.is_admin === true || user.email === 'amks.pk@hotmail.com');
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36

  return <AuthContext.Provider value={{ user, loading, isAdmin }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
