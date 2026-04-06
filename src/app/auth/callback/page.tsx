'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';

function CallbackHandler() {
  const [msg, setMsg] = useState('Signing you in...');

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get next destination from query params
        const searchParams = new URLSearchParams(window.location.search);
        const next = searchParams.get('next') ?? '/dashboard';

        // Parse hash fragment — Supabase puts session here after verification
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');

        if (access_token && refresh_token) {
          // Import dynamically to avoid SSR issues
          const { createSupabaseBrowserClient } = await import('@/lib/supabase-browser');
          const supabase = createSupabaseBrowserClient();
          
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) throw error;

          // Hard redirect to ensure fresh request with cookie
          window.location.replace(next);
          return;
        }

        // No hash — check for token_hash in query params (email confirmation flow)
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (token_hash && type) {
          const { createSupabaseBrowserClient } = await import('@/lib/supabase-browser');
          const supabase = createSupabaseBrowserClient();

          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as 'magiclink' | 'signup' | 'recovery' | 'email',
          });

          if (error) throw error;

          window.location.replace(next);
          return;
        }

        // Check if already logged in
        const { createSupabaseBrowserClient } = await import('@/lib/supabase-browser');
        const supabase = createSupabaseBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          window.location.replace(next);
          return;
        }

        // Nothing worked
        setMsg('Could not sign in. Please try again.');
        setTimeout(() => { window.location.replace('/login'); }, 2000);

      } catch (err) {
        console.error('Auth callback error:', err);
        setMsg('Something went wrong. Redirecting...');
        setTimeout(() => { window.location.replace('/login'); }, 2000);
      }
    }

    handleCallback();
  }, []);

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
