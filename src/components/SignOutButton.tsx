'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
    >
      Sign out
    </button>
  );
}
