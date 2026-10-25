'use client';

import { X, Aperture, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function LoginModal({ isOpen, onClose, message }: LoginModalProps) {
  const { signIn } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md border border-white/15 bg-[#121214] p-8 text-[#f1f1ef] shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#8a8a86] hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-8 place-items-center border border-white/40 bg-white/5">
            <Aperture className="size-4 text-white" />
          </span>
          <div>
            <h2 className="text-sm font-medium tracking-tight">Primus Director</h2>
            <p className="text-xs text-[#8a8a86]">AI Film Studio Authentication</p>
          </div>
        </div>

        <div className="mb-6 space-y-2">
          <p className="text-sm text-[#d1d1cc]">
            {message || 'You need to be signed in to create projects, generate scripts, or queue video renders.'}
          </p>
          <p className="text-xs text-[#8a8a86]">
            We use secure Google authentication to protect your studio workspace and credit balance.
          </p>
        </div>

        <button
          onClick={async () => {
            try {
              await signIn();
            } catch (err: any) {
              console.error('Sign in error:', err);
            }
          }}
          className="w-full flex items-center justify-center gap-3 border border-white/20 bg-white text-black px-4 py-3 text-xs font-medium hover:bg-[#e2e2df] transition-colors"
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Continue with Google
          <ArrowRight className="size-3.5" />
        </button>

        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <p className="text-[11px] text-[#777773]">
            By continuing, you agree to Smatatech terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
