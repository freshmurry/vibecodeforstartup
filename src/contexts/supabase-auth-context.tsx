/**
 * Supabase Auth Context for VibeCoding SaaS
 * Production-ready authentication with subscription management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { UserProfile, UserProfileInsert, UserProfileUpdate } from '@/lib/database.types';

interface AuthContextType {
  // Core auth state
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Auth methods
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  
  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  
  // Credit management
  deductCredits: (amount: number, description: string, appId?: string) => Promise<boolean>;
  addCredits: (amount: number, description: string) => Promise<void>;
  
  // Utility methods
  clearError: () => void;
  setIntendedUrl: (url: string) => void;
  getIntendedUrl: () => string | null;
  clearIntendedUrl: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INTENDED_URL_KEY = 'saas_intended_url';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = !!user && !!session;

  // Redirect URL management
  const setIntendedUrl = useCallback((url: string) => {
    try {
      sessionStorage.setItem(INTENDED_URL_KEY, url);
    } catch (error) {
      console.warn('Failed to store intended URL:', error);
    }
  }, []);

  const getIntendedUrl = useCallback((): string | null => {
    try {
      return sessionStorage.getItem(INTENDED_URL_KEY);
    } catch (error) {
      console.warn('Failed to retrieve intended URL:', error);
      return null;
    }
  }, []);

  const clearIntendedUrl = useCallback(() => {
    try {
      sessionStorage.removeItem(INTENDED_URL_KEY);
    } catch (error) {
      console.warn('Failed to clear intended URL:', error);
    }
  }, []);

  // Load user profile from database
  const loadUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const newProfile: UserProfileInsert = {
            id: userId,
            email: user?.email || '',
            credits: 45, // Free tier credits
            plan: 'free',
            onboarding_completed: false,
            preferences: {},
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return null;
          }

          return createdProfile;
        }
        console.error('Error loading profile:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error in loadUserProfile:', err);
      return null;
    }
  }, [user?.email]);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const userProfile = await loadUserProfile(session.user.id);
            if (mounted) {
              setProfile(userProfile);
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Only log meaningful auth events in development mode
      if (import.meta.env.DEV && (event !== 'INITIAL_SESSION' || session)) {
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userProfile = await loadUserProfile(session.user.id);
        setProfile(userProfile);
        
        // Navigate to intended URL or dashboard after successful auth
        if (event === 'SIGNED_IN') {
          const intendedUrl = getIntendedUrl();
          clearIntendedUrl();
          navigate(intendedUrl || '/dashboard');
        }
      } else {
        setProfile(null);
        if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
      
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, loadUserProfile, getIntendedUrl, clearIntendedUrl]);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        // Email confirmation required
        setError('Please check your email and click the confirmation link to complete registration.');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError((error as AuthError).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      setError((error as AuthError).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in with Google
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google sign in error:', error);
      setError((error as AuthError).message);
    }
  }, []);

  // Sign in with GitHub
  const signInWithGithub = useCallback(async () => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('GitHub sign in error:', error);
      setError((error as AuthError).message);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      setError((error as AuthError).message);
    }
  }, []);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Reset password error:', error);
      setError((error as AuthError).message);
    }
  }, []);

  // Update password
  const updatePassword = useCallback(async (password: string) => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Update password error:', error);
      setError((error as AuthError).message);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates: UserProfileUpdate) => {
    if (!user || !profile) {
      throw new Error('User not authenticated');
    }

    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setProfile(data);
    } catch (error) {
      console.error('Update profile error:', error);
      setError('Failed to update profile');
      throw error;
    }
  }, [user, profile]);

  // Refresh user profile
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    
    const updatedProfile = await loadUserProfile(user.id);
    if (updatedProfile) {
      setProfile(updatedProfile);
    }
  }, [user, loadUserProfile]);

  // Deduct credits (with database function for atomicity)
  const deductCredits = useCallback(async (amount: number, description: string, appId?: string): Promise<boolean> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase.rpc('deduct_credits', {
        user_id: user.id,
        amount,
        description,
        app_id: appId,
      });

      if (error) {
        console.error('Error deducting credits:', error);
        return false;
      }

      // Refresh profile to get updated credits
      await refreshProfile();
      
      return data;
    } catch (error) {
      console.error('Error in deductCredits:', error);
      return false;
    }
  }, [user, refreshProfile]);

  // Add credits
  const addCredits = useCallback(async (amount: number, description: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Insert credit transaction
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert([{
          user_id: user.id,
          amount,
          type: 'credit',
          description,
        }]);

      if (transactionError) throw transactionError;

      // Update user's total credits
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: (profile?.credits || 0) + amount })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh profile
      await refreshProfile();
    } catch (error) {
      console.error('Error adding credits:', error);
      setError('Failed to add credits');
      throw error;
    }
  }, [user, profile?.credits, refreshProfile]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
    deductCredits,
    addCredits,
    clearError,
    setIntendedUrl,
    getIntendedUrl,
    clearIntendedUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook for protected routes
export function useRequireAuth(redirectTo = '/') {
  const { isAuthenticated, isLoading, setIntendedUrl } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store intended URL before redirecting
      setIntendedUrl(window.location.pathname + window.location.search);
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo, setIntendedUrl]);

  return { isAuthenticated, isLoading };
}