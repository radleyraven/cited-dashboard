'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
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
          const next = searchParams.get('next') ?? '/dashboard';
          router.push(next);
        }
      });
    }

    // Also check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const next = searchParams.get('next') ?? '/dashboard';
        router.push(next);
      }
    });
  }, [searchParams, router]);

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
          <p className="text-gray-400 mt-2 text-sm">AI Visibility Dashboard</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✉️</div>
            <p className="text-white text-lg font-medium mb-2">Check your email</p>
            <p className="text-gray-400 text-sm">Your secure login link is on the way.</p>
          </div>
        ) : (
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
