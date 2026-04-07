/**
 * Auth Callback Page
 * Handles OAuth redirects from Google/GitHub via Cloudflare Worker.
 * Supabase auth has been removed — sessions are managed by the worker backend.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // The worker handles the OAuth callback and sets the session cookie.
        // By the time the browser lands here, /api/auth/profile should return a user.
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || error || 'Authentication failed.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Verify the session was set by the worker
        const res = await fetch('/api/auth/profile', { credentials: 'include' });

        if (res.ok) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          const intended = sessionStorage.getItem('saas_intended_url') || '/dashboard';
          sessionStorage.removeItem('saas_intended_url');
          setTimeout(() => navigate(intended), 1000);
        } else {
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (e) {
        console.error('Auth callback error:', e);
        setStatus('error');
        setMessage('An unexpected error occurred.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="size-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="size-8 mx-auto text-green-500">✓</div>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="size-8 mx-auto text-destructive">✗</div>
            <p className="text-destructive">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to home...</p>
          </>
        )}
      </div>
    </div>
  );
}
