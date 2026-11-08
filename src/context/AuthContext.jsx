import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoAdmin, setIsDemoAdmin] = useState(() => {
    return localStorage.getItem('sree_demo_admin') === 'true';
  });

  useEffect(() => {
    let subscription = null;

    if (isSupabaseConfigured()) {
      // Check existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // Listen for auth state changes
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = data.subscription;
    } else {
      setLoading(false);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please use Demo Admin Mode or update .env credentials.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    setUser(data.user);
    setSession(data.session);
    setIsDemoAdmin(false);
    localStorage.removeItem('sree_demo_admin');
    return data;
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsDemoAdmin(false);
    localStorage.removeItem('sree_demo_admin');
  };

  const enterDemoAdmin = () => {
    setIsDemoAdmin(true);
    setUser({ email: 'demo-admin@sreecollections.com', id: 'demo-admin' });
    localStorage.setItem('sree_demo_admin', 'true');
  };

  const isAuthenticated = Boolean(user) || isDemoAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isDemoAdmin,
        isAuthenticated,
        signIn,
        signOut,
        enterDemoAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
