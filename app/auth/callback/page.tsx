'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, Aperture } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const supabase = createClientComponentClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          // Save token to localStorage for api.ts convenience
          localStorage.setItem('primus_auth_token', session.access_token);
        }
        router.push('/');
      }).catch(() => {
        router.push('/');
      });
    } catch {
      router.push('/');
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0c] text-[#f1f1ef]">
      <div className="text-center">
        <div className="mx-auto mb-4 grid size-10 place-items-center border border-white/40 bg-white/5 animate-pulse">
          <Aperture className="size-5 text-white animate-spin" />
        </div>
        <h2 className="text-sm font-medium">Authenticating with Google...</h2>
        <p className="mt-1 text-xs text-[#8a8a86]">Establishing your secure studio session.</p>
      </div>
    </main>
  );
}
