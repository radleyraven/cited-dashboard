'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Suspense } from 'react';

const supabase = createSupabaseBrowserClient();

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [msg, setMsg] = useState('Signing you in...');

  useEffect(() => {
    const next = searchParams.get('next') ?? '/dashboard';

    // onAuthStateChange fires when Supabase processes hash fragment
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        subscription.unsubscribe();
        // Small delay to allow cookie to be written before middleware checks it
        setTimeout(() => {
          window.location.href = next; // Hard redirect — not router.replace — ensures fresh cookie is sent
        }, 200);
      }
    });

    // Check if already signed in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe();
        setTimeout(() => {
          window.location.href = next;
        }, 200);
      }
    });

    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      setMsg('Could not sign in. Try again.');
      setTimeout(() => { window.location.href = '/login'; }, 1500);
    }, 8000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [searchParams]);

  return (
    <div style={{
      minHeight: '100vh', background: '#0A1929',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px',
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
      <div style={{ minHeight: '100vh', background: '#0A1929', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '5px', color: '#00BFA6' }}>CITED</div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
