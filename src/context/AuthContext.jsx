import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

// Configured Showroom Administrators
export const ADMIN_USERS = [
  {
    username: 'balubalaji',
    email: 'balubalaji@sreecollections.com',
    password: 'Balu@9966',
    name: 'Balu Balaji',
    role: 'Administrator'
  },
  {
    username: 'deva049',
    email: 'deva049@sreecollections.com',
    password: 'Deva@1009',
    name: 'Deva',
    role: 'Administrator'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('sree_admin_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to parse stored user:', e);
    }
    return null;
  });

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
        if (session?.user && !user) {
          setUser(session.user);
        }
        setLoading(false);
      });

      // Listen for auth state changes
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session?.user) {
          setUser(session.user);
        }
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

  const signIn = async (identifier, password) => {
    const cleanId = (identifier || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Check built-in configured admin accounts (balubalaji & deva049)
    const foundAdmin = ADMIN_USERS.find(
      (a) => a.username.toLowerCase() === cleanId || a.email.toLowerCase() === cleanId
    );

    if (foundAdmin) {
      if (foundAdmin.password === cleanPass) {
        const adminData = {
          id: foundAdmin.username,
          username: foundAdmin.username,
          name: foundAdmin.name,
          email: foundAdmin.email,
          role: foundAdmin.role
        };
        setUser(adminData);
        localStorage.setItem('sree_admin_user', JSON.stringify(adminData));
        setIsDemoAdmin(false);
        localStorage.removeItem('sree_demo_admin');
        return adminData;
      } else {
        throw new Error('Incorrect password. Please verify your admin password.');
      }
    }

    // 2. If Supabase Auth is connected, attempt sign-in via Supabase
    if (isSupabaseConfigured()) {
      const emailToUse = cleanId.includes('@') ? cleanId : `${cleanId}@sreecollections.com`;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailToUse,
          password: cleanPass
        });

        if (!error && data?.user) {
          const userData = {
            id: data.user.id,
            username: data.user.email?.split('@')[0] || 'admin',
            email: data.user.email,
            name: data.user.user_metadata?.full_name || 'Admin',
            role: 'Administrator'
          };
          setUser(userData);
          setSession(data.session);
          localStorage.setItem('sree_admin_user', JSON.stringify(userData));
          setIsDemoAdmin(false);
          localStorage.removeItem('sree_demo_admin');
          return data;
        }
        if (error) throw error;
      } catch (err) {
        throw new Error(err.message || 'Authentication failed. Please check your credentials.');
      }
    }

    throw new Error('Invalid username or password. Please use a registered admin account.');
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    }
    setUser(null);
    setSession(null);
    setIsDemoAdmin(false);
    localStorage.removeItem('sree_admin_user');
    localStorage.removeItem('sree_demo_admin');
  };

  const enterDemoAdmin = () => {
    setIsDemoAdmin(true);
    const demoData = {
      email: 'demo-admin@sreecollections.com',
      username: 'demo_admin',
      name: 'Demo Administrator',
      id: 'demo-admin',
      role: 'Demo Mode'
    };
    setUser(demoData);
    localStorage.setItem('sree_demo_admin', 'true');
    localStorage.setItem('sree_admin_user', JSON.stringify(demoData));
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
