/**
 * Hybrid Authentication Context
 * Uses Worker backend authentication as primary, Supabase as fallback
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';
import { workerAuthClient, type WorkerAuthResponse } from '@/lib/worker-auth-client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

type AuthMethod = 'worker' | 'supabase';

interface HybridUser {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  provider: string;
  createdAt: string;
  authMethod: AuthMethod;
}

interface AuthContextType {
  // Core auth state
  user: HybridUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  authMethod: AuthMethod | null;
  
  // Auth methods
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  
  // Utility methods
  clearError: () => void;
  setIntendedUrl: (url: string) => void;
  getIntendedUrl: () => string | null;
  clearIntendedUrl: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INTENDED_URL_KEY = 'saas_intended_url';

export function HybridAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HybridUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

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

  // Convert worker user to hybrid user
  const convertWorkerUser = useCallback((workerResponse: WorkerAuthResponse): HybridUser => {
    if (!workerResponse.user) {
      throw new Error('Invalid worker user response');
    }
    
    return {
      id: workerResponse.user.id,
      email: workerResponse.user.email,
      displayName: workerResponse.user.displayName,
      emailVerified: workerResponse.user.emailVerified,
      provider: workerResponse.user.provider,
      createdAt: workerResponse.user.createdAt,
      authMethod: 'worker' as AuthMethod,
    };
  }, []);

  // Convert Supabase user to hybrid user
  const convertSupabaseUser = useCallback((supabaseUser: User): HybridUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      displayName: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
      emailVerified: !!supabaseUser.email_confirmed_at,
      provider: 'supabase',
      createdAt: supabaseUser.created_at,
      authMethod: 'supabase' as AuthMethod,
    };
  }, []);

  // Check authentication status on load
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // First try worker authentication
        const workerUser = await workerAuthClient.getCurrentUser();
        
        if (workerUser && workerUser.user && mounted) {
          setUser(convertWorkerUser(workerUser));
          setAuthMethod('worker');
          setIsLoading(false);
          return;
        }

        // Fallback to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          if (session?.user) {
            setUser(convertSupabaseUser(session.user));
            setAuthMethod('supabase');
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

    // Listen for Supabase auth changes (fallback only)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted || authMethod === 'worker') return;

      setSession(session);
      if (session?.user) {
        setUser(convertSupabaseUser(session.user));
        setAuthMethod('supabase');
        
        if (event === 'SIGNED_IN') {
          const intendedUrl = getIntendedUrl();
          clearIntendedUrl();
          navigate(intendedUrl || '/dashboard');
        }
      } else {
        setUser(null);
        setAuthMethod(null);
        if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, convertWorkerUser, convertSupabaseUser, authMethod, getIntendedUrl, clearIntendedUrl]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    setError(null);
    setIsLoading(true);

    try {
      // Try worker authentication first
      const isWorkerAvailable = await workerAuthClient.isWorkerAuthAvailable();
      
      if (isWorkerAvailable) {
        const result = await workerAuthClient.register({
          email,
          password,
          name: fullName,
        });

        if (result.user) {
          setUser(convertWorkerUser(result));
          setAuthMethod('worker');
          
          // Navigate to dashboard after successful registration
          const intendedUrl = getIntendedUrl();
          clearIntendedUrl();
          navigate(intendedUrl || '/dashboard');
        }
        return;
      }

      // Fallback to Supabase
      console.log('Worker auth unavailable, falling back to Supabase');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id') || supabaseAnonKey.includes('your-actual')) {
        throw new Error('Neither worker authentication nor Supabase are properly configured. Please check your environment variables.');
      }

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
        setError('Please check your email and click the confirmation link to complete registration.');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError((error as Error).message || 'An unexpected error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  }, [convertWorkerUser, navigate, getIntendedUrl, clearIntendedUrl]);

  // Sign in with email and password
  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      // Try worker authentication first
      const isWorkerAvailable = await workerAuthClient.isWorkerAuthAvailable();
      
      if (isWorkerAvailable) {
        const result = await workerAuthClient.login({ email, password });

        if (result.user) {
          setUser(convertWorkerUser(result));
          setAuthMethod('worker');
          
          // Navigate to dashboard after successful login
          const intendedUrl = getIntendedUrl();
          clearIntendedUrl();
          navigate(intendedUrl || '/dashboard');
        }
        return;
      }

      // Fallback to Supabase
      console.log('Worker auth unavailable, falling back to Supabase');
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      setError((error as Error).message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  }, [convertWorkerUser, navigate, getIntendedUrl, clearIntendedUrl]);

  // Sign in with Google (Supabase only)
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

  // Sign in with GitHub (Supabase only)
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
      if (authMethod === 'worker') {
        await workerAuthClient.logout();
      } else if (authMethod === 'supabase') {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      setAuthMethod(null);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state even if logout fails
      setUser(null);
      setSession(null);
      setAuthMethod(null);
      navigate('/');
    }
  }, [authMethod, navigate]);

  // Reset password (Supabase only)
  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;
      setError('Password reset link sent to your email');
    } catch (error) {
      console.error('Password reset error:', error);
      setError((error as AuthError).message);
    }
  }, []);

  // Update password (Supabase only)
  const updatePassword = useCallback(async (password: string) => {
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    } catch (error) {
      console.error('Password update error:', error);
      setError((error as AuthError).message);
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    error,
    authMethod,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    resetPassword,
    updatePassword,
    clearError,
    setIntendedUrl,
    getIntendedUrl,
    clearIntendedUrl,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a HybridAuthProvider');
  }
  return context;
}