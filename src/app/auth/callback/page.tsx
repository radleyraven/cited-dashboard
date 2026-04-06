'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Suspense } from 'react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Signing you in...');

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const next = searchParams.get('next') ?? '/dashboard';
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as 'magiclink' | 'signup' | 'recovery' | 'email' | null;
    const code = searchParams.get('code');

    async function handleAuth() {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          router.replace(next);
          return;
        }

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash, type });
          if (error) throw error;
          router.replace(next);
          return;
        }

        // Check if session already set via hash fragment (implicit flow)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace(next);
          return;
        }

        // No auth params — go to login
        router.replace('/login');
      } catch (err) {
        console.error('Auth error:', err);
        setStatus('Something went wrong. Redirecting to login...');
        setTimeout(() => router.replace('/login'), 1500);
      }
    }

    handleAuth();
  }, [router, searchParams]);

  return (
    <div style={{
      minHeight: '100vh', background: '#0A1929',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px'
    }}>
      <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '4px', color: '#00BFA6' }}>CITED</div>
      <div style={{ fontSize: '14px', color: '#64748b' }}>{status}</div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#0A1929', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '4px', color: '#00BFA6' }}>CITED</div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
