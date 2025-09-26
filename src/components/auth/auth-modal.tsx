/**
 * Modern SaaS Auth Modal
 * Supports both sign in and sign up with OAuth and email/password
 */

import { useState, useCallback } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Github, Chrome, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/supabase-auth-context';
import { VibeCodingLogo } from '@/components/icons/logos';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  context?: string;
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin', context }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const {
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    resetPassword,
    isLoading,
    error,
    clearError,
  } = useAuth();

  // Reset form when mode changes
  const switchMode = useCallback((newMode: 'signin' | 'signup' | 'forgot') => {
    setMode(newMode);
    setEmail('');
    setPassword('');
    setFullName('');
    setShowPassword(false);
    clearError();
  }, [clearError]);

  const handleEmailAuth = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (!agreedToTerms) {
          return; // Form validation should handle this
        }
        await signUp(email, password, fullName);
        // Don't close modal yet - user needs to check email
      } else if (mode === 'forgot') {
        await resetPassword(email);
        switchMode('signin');
      }
    } catch (error) {
      // Error is handled by the auth context
      console.error('Auth error:', error);
    }
  }, [mode, email, password, fullName, agreedToTerms, isLoading, signIn, signUp, resetPassword, onClose, switchMode]);

  const handleGoogleAuth = useCallback(async () => {
    if (isLoading) return;
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google auth error:', error);
    }
  }, [signInWithGoogle, isLoading]);

  const handleGithubAuth = useCallback(async () => {
    if (isLoading) return;
    try {
      await signInWithGithub();
    } catch (error) {
      console.error('GitHub auth error:', error);
    }
  }, [signInWithGithub, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-bg-1 rounded-lg shadow-xl border border-border-primary">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary">
          <div className="flex items-center gap-3">
            <VibeCodingLogo showText={false} className="w-8 h-8" />
            <h2 className="text-xl font-semibold text-text-primary">
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Reset Password'}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-text-primary/70 hover:text-text-primary"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Context Message */}
        {context && (
          <div className="px-6 pt-4">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 text-sm text-accent">
              Please {mode === 'signin' ? 'sign in' : 'create an account'} {context}.
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Chrome className="size-4 mr-2" />
              )}
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGithubAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Github className="size-4 mr-2" />
              )}
              Continue with GitHub
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-primary" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-bg-1 text-text-primary/60">or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Full Name (Sign Up Only) */}
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  Full Name
                </label>
                <div className="relative">
                  <User className="size-4 text-text-primary/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required={mode === 'signup'}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                Email Address
              </label>
              <div className="relative">
                <Mail className="size-4 text-text-primary/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Password (Not for Forgot Password) */}
            {mode !== 'forgot' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">
                  Password
                </label>
                <div className="relative">
                  <Lock className="size-4 text-text-primary/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Create a strong password' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-primary/40 hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-text-primary/60">
                    Must be at least 8 characters with a mix of letters, numbers, and symbols.
                  </p>
                )}
              </div>
            )}

            {/* Terms Agreement (Sign Up Only) */}
            {mode === 'signup' && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                  required
                />
                <label htmlFor="terms" className="text-xs text-text-primary/70 leading-relaxed">
                  I agree to the{' '}
                  <a href="/terms" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || (mode === 'signup' && !agreedToTerms)}
            >
              {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'forgot' && 'Send Reset Link'}
            </Button>
          </form>

          {/* Mode Switching */}
          <div className="mt-6 text-center text-sm text-text-primary/70 space-y-2">
            {mode === 'signin' && (
              <>
                <div>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="text-accent hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-accent hover:underline font-medium"
                  >
                    Forgot your password?
                  </button>
                </div>
              </>
            )}
            
            {mode === 'signup' && (
              <div>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-accent hover:underline font-medium"
                >
                  Sign in
                </button>
              </div>
            )}
            
            {mode === 'forgot' && (
              <div>
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="text-accent hover:underline font-medium"
                >
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}