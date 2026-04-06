'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Suspense } from 'react';

// CRITICAL: initialize at module level so hash fragment is captured on page load
const supabase = createSupabaseBrowserClient();

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState('Signing you in...');

  useEffect(() => {
    const next = searchParams.get('next') ?? '/dashboard';

    // Listen for SIGNED_IN — fires when session is set from hash or code
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        subscription.unsubscribe();
        router.replace(next);
      }
    });

    // Also check immediately — session may already be set
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        router.replace(next);
      }
    });

    // 6 second fallback
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      setMsg('Something went wrong. Redirecting...');
      router.replace('/login');
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A1929',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '5px', color: '#00BFA6' }}>CITED</div>
      <div style={{ fontSize: '13px', color: '#64748b' }}>{msg}</div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh', background: '#0A1929',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '5px', color: '#00BFA6' }}>CITED</div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
