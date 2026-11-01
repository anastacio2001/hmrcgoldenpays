import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'client';
}

interface AuthContextType {
  user: User | null;
  /** True until the stored session has been restored. */
  loading: boolean;
  /** Resolves to an error message, or null on success. */
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toUser = (session: Session | null): User | null => {
  if (!session) return null;
  const { id, email = '', user_metadata, app_metadata } = session.user;
  return {
    id,
    email,
    name: user_metadata?.name || email,
    // app_metadata can only be set server-side, so users cannot grant themselves admin.
    role: app_metadata?.role === 'admin' ? 'admin' : 'client',
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setUser(toUser(data.session));
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session));
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Authentication service is not configured.';
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return 'Invalid credentials. Please try again.';
    if (toUser(data.session)?.role !== 'admin') {
      await supabase.auth.signOut();
      return 'This account does not have admin access.';
    }
    return null;
  };

  const logout = async () => {
    await supabase?.auth.signOut();
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
