import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setUserProfile(null);
          return;
        }
        throw error;
      }
      setUserProfile(data);
    } catch (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error);
      }
      setUserProfile(null);
    }
  };

  const getRedirectUrl = () => {
    const vercelUrl = import.meta.env.VITE_VERCEL_URL;
    if (vercelUrl) {
      return `https://${vercelUrl}/auth/callback`;
    }
    if (window.location.hostname === 'agriance.vercel.app') {
      return 'https://agriance.vercel.app/auth/callback';
    }
    return `${window.location.origin}/auth/callback`;
  };

  const signUp = async (email, password, metadata = {}) => {
    try {
      setError(null);
      const redirectUrl = getRedirectUrl();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      const message = handleSupabaseError(error);
      setError(message);
      return { data: null, error: message };
    }
  };

  const signIn = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      const message = handleSupabaseError(error);
      setError(message);
      return { data: null, error: message };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserProfile(null);
      return { error: null };
    } catch (error) {
      const message = handleSupabaseError(error);
      setError(message);
      return { error: message };
    }
  };

  const resetPassword = async (email) => {
    try {
      setError(null);
      const redirectUrl = getRedirectUrl();
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      const message = handleSupabaseError(error);
      setError(message);
      return { data: null, error: message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);
      if (!user) throw new Error('No user logged in');
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      setUserProfile(data);
      return { data, error: null };
    } catch (error) {
      const message = handleSupabaseError(error);
      setError(message);
      return { data: null, error: message };
    }
  };

  const updateUserMetadata = async (metadata) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.updateUser({
        data: metadata,
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      const message = handleSupabaseError(error);
      setError(message);
      return { data: null, error: message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const redirectUrl = getRedirectUrl();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      const message = handleSupabaseError(error);
      setError(message);
      return { data: null, error: message };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    logout: signOut, // Alias for backward compatibility
    signInWithGoogle,
    resetPassword,
    updateProfile,
    updateUserMetadata,
    isAuthenticated: !!user,
    role: userProfile?.role || null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
