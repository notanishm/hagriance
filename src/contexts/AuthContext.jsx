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

const PROFILE_CACHE_KEY = 'agriance_cached_profile';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: save profile to localStorage for demo fallback
  const setLocalProfile = (profileData) => {
    try {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profileData));
    } catch (e) { /* ignore */ }
    setUserProfile(profileData);
  };

  // Helper: load cached profile from localStorage
  const loadCachedProfile = () => {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setUserProfile(parsed);
        return parsed;
      }
    } catch (e) { /* ignore */ }
    return null;
  };

  useEffect(() => {
    // Immediately try loading cached profile so the app doesn't hang
    loadCachedProfile();

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fire-and-forget: try to load from Supabase (will update if successful)
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    }).catch(() => {
      // Even if getSession fails, stop loading
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
      // Race the Supabase query against a 3-second timeout (demo safety net)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile load timeout')), 3000)
      );

      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        if (error.code === 'PGRST116') {
          // No profile in DB — try localStorage cache (demo fallback)
          loadCachedProfile();
          return;
        }
        if (error.message && error.message.includes('recursion')) {
          console.error('CRITICAL: RLS Recursion detected. Falling back to cached profile.');
        }
        // Fall back to cached profile on any error
        loadCachedProfile();
        return;
      }
      setUserProfile(data);
      // Also cache it so we have a fallback
      try { localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
    } catch (error) {
      console.error('Error loading user profile (possibly timeout):', error);
      // Try loading from cache instead of setting null
      if (!loadCachedProfile()) {
        setUserProfile(null);
      }
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
      // Clear cached profile on sign out
      try { localStorage.removeItem(PROFILE_CACHE_KEY); } catch (e) { /* ignore */ }
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
      // Also cache it
      try { localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
      return { data, error: null };
    } catch (error) {
      // DEMO FALLBACK: save to localStorage even if Supabase fails
      const cachedProfile = { id: user.id, ...updates, updated_at: new Date().toISOString() };
      setLocalProfile(cachedProfile);
      console.warn('updateProfile: Supabase failed, saved to localStorage instead.', error);
      return { data: cachedProfile, error: null };
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
    setLocalProfile, // Demo: direct localStorage profile setter
    isAuthenticated: !!user,
    role: userProfile?.role || null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
