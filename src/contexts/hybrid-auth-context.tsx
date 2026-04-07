/**
 * Hybrid Authentication Context
 * Uses Cloudflare Worker backend authentication exclusively.
 * Supabase has been removed — auth is handled via /api/auth/* endpoints.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { workerAuthClient, type WorkerAuthResponse } from '@/lib/worker-auth-client';

interface HybridUser {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  provider: string;
  createdAt: string;
  authMethod: 'worker';
}

interface AuthContextType {
  user: HybridUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;

  clearError: () => void;
  setIntendedUrl: (url: string) => void;
  getIntendedUrl: () => string | null;
  clearIntendedUrl: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INTENDED_URL_KEY = 'saas_intended_url';

export function HybridAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HybridUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

  const setIntendedUrl = useCallback((url: string) => {
    try { sessionStorage.setItem(INTENDED_URL_KEY, url); } catch {}
  }, []);

  const getIntendedUrl = useCallback((): string | null => {
    try { return sessionStorage.getItem(INTENDED_URL_KEY); } catch { return null; }
  }, []);

  const clearIntendedUrl = useCallback(() => {
    try { sessionStorage.removeItem(INTENDED_URL_KEY); } catch {}
  }, []);

  const convertWorkerUser = useCallback((r: WorkerAuthResponse): HybridUser => {
    if (!r.user) throw new Error('Invalid worker user response');
    return {
      id: r.user.id,
      email: r.user.email,
      displayName: r.user.displayName,
      emailVerified: r.user.emailVerified,
      provider: r.user.provider,
      createdAt: r.user.createdAt,
      authMethod: 'worker',
    };
  }, []);

  // Initialize auth on load
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const workerUser = await workerAuthClient.getCurrentUser();
        if (workerUser?.user && mounted) {
          setUser(convertWorkerUser(workerUser));
        }
      } catch (e) {
        console.error('Error initializing auth:', e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, [convertWorkerUser]);

  const clearError = useCallback(() => setError(null), []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await workerAuthClient.register({ email, password, name: fullName });
      if (result.user) {
        setUser(convertWorkerUser(result));
        const url = getIntendedUrl();
        clearIntendedUrl();
        navigate(url || '/dashboard');
      }
    } catch (e) {
      setError((e as Error).message || 'Sign up failed.');
    } finally {
      setIsLoading(false);
    }
  }, [convertWorkerUser, navigate, getIntendedUrl, clearIntendedUrl]);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await workerAuthClient.login({ email, password });
      if (result.user) {
        setUser(convertWorkerUser(result));
        const url = getIntendedUrl();
        clearIntendedUrl();
        navigate(url || '/dashboard');
      }
    } catch (e) {
      setError((e as Error).message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  }, [convertWorkerUser, navigate, getIntendedUrl, clearIntendedUrl]);

  // Google OAuth — redirect to worker endpoint
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    try {
      window.location.href = `${window.location.origin}/api/auth/google`;
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  // GitHub OAuth — redirect to worker endpoint
  const signInWithGithub = useCallback(async () => {
    setError(null);
    try {
      window.location.href = `${window.location.origin}/api/auth/github`;
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await workerAuthClient.logout();
    } catch {}
    setUser(null);
    navigate('/');
  }, [navigate]);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      const res = await fetch(`${window.location.origin}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Password reset failed.');
      }
    } catch (e) {
      setError((e as Error).message);
      throw e;
    }
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    setError(null);
    try {
      const res = await fetch(`${window.location.origin}/api/auth/update-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Password update failed.');
      }
    } catch (e) {
      setError((e as Error).message);
      throw e;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated, error,
      signUp, signIn, signInWithGoogle, signInWithGithub,
      signOut, resetPassword, updatePassword,
      clearError, setIntendedUrl, getIntendedUrl, clearIntendedUrl,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within HybridAuthProvider');
  return ctx;
}

// Named export alias for compatibility
export { AuthContext };
