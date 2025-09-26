/**
 * Auth Callback Page
 * Handles OAuth redirects and email confirmations
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle OAuth callback
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (data.session) {
          setStatus('success');
          setMessage('Successfully authenticated! Redirecting...');
          
          // Get intended URL from session storage or default to dashboard
          const intendedUrl = sessionStorage.getItem('saas_intended_url') || '/dashboard';
          sessionStorage.removeItem('saas_intended_url');
          
          // Small delay for better UX
          setTimeout(() => {
            navigate(intendedUrl);
          }, 1000);
        } else {
          // Check if this is an email confirmation
          const accessToken = searchParams.get('access_token');
          const refreshToken = searchParams.get('refresh_token');
          const type = searchParams.get('type');
          
          if (type === 'recovery') {
            // Password reset flow
            setStatus('success');
            setMessage('Please set your new password.');
            navigate('/auth/reset-password');
            return;
          }
          
          if (accessToken && refreshToken) {
            // Email confirmation flow
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (sessionError) {
              throw sessionError;
            }
            
            setStatus('success');
            setMessage('Email confirmed successfully! Redirecting...');
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          } else {
            throw new Error('No valid session found');
          }
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        
        // Redirect to home with error after delay
        setTimeout(() => {
          navigate('/?error=' + encodeURIComponent(error.message || 'Authentication failed'));
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-1 via-bg-2 to-bg-3">
      <div className="max-w-md w-full mx-4">
        <div className="bg-bg-1 border border-border-primary rounded-lg shadow-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="size-12 text-accent animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Authenticating
              </h2>
              <p className="text-text-primary/70">{message}</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="size-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="size-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Success!
              </h2>
              <p className="text-text-primary/70">{message}</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="size-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="size-6 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Authentication Failed
              </h2>
              <p className="text-text-primary/70 mb-4">{message}</p>
              <p className="text-sm text-text-primary/50">Redirecting to home page...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}