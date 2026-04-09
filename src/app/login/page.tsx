// TODO: Google OAuth requires these env vars in Vercel:
// NEXT_PUBLIC_SUPABASE_URL (already set)
// NEXT_PUBLIC_SUPABASE_ANON_KEY (already set)
// Google OAuth credentials must be created at:
// console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client IDs
// Authorized redirect URI: https://oxipzgkcmnsulgywsjbq.supabase.co/auth/v1/callback
// Then add to Supabase dashboard: Auth → Providers → Google → Client ID + Secret

'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
const supabase = createSupabaseBrowserClient();
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (token_hash && type) {
      setVerifying(true);
      supabase.auth.verifyOtp({
        token_hash,
        type: type as 'signup' | 'magiclink' | 'recovery' | 'invite' | 'email',
      }).then(({ data, error }) => {
        if (error) {
          setError('Verification failed: ' + error.message);
          setVerifying(false);
        } else if (data.session) {
          // Session is set — redirect to next param or dashboard
          const next = searchParams.get('next') ?? '/';
          router.push(next);
        }
      });
    }

    // Also check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const next = searchParams.get('next') ?? '/';
        router.push(next);
      }
    });
  }, [searchParams, router]);

  async function handleGoogleSignIn() {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://citedagent.com/auth/callback?next=/',
      },
    });
    if (error) setError(error.message);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: (process.env.NEXT_PUBLIC_APP_URL || window.location.origin) + '/auth/callback',
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A1929' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <p className="text-white text-lg font-medium">Verifying your login...</p>
          <p className="text-gray-400 text-sm mt-2">One moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A1929' }}>
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-widest" style={{ color: '#00BFA6' }}>CITED</h1>
          <p className="text-gray-400 mt-2 text-sm">AI Citation Dashboard</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✉️</div>
            <p className="text-white text-lg font-medium mb-2">Check your email</p>
            <p className="text-gray-400 text-sm">Your secure login link is on the way.</p>
          </div>
        ) : (
          <>
            {/* Google Sign In — Primary */}
            <button
              onClick={handleGoogleSignIn}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                width: '100%', padding: '13px 24px',
                background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '8px',
                fontSize: '14px', fontWeight: 600, color: '#0A1929', cursor: 'pointer',
                marginBottom: '16px', transition: 'border-color 0.15s'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>or continue with email</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            </div>

            {/* Magic Link — Secondary */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#00BFA6] transition-colors"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-opacity disabled:opacity-50"
                style={{ background: '#00BFA6' }}
              >
                {loading ? 'Sending…' : 'Send Login Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0A1929' }}>
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
