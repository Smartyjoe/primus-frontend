'use client';

import React, { useState, useEffect } from 'react';
import {
  X, CreditCard, Building2, PhoneCall, CheckCircle2,
  Loader2, ArrowRight, ShieldCheck, Copy, Clock,
} from 'lucide-react';
import { api } from '@/lib/api';

interface PaystackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (creditsAdded: number) => void;
  userEmail?: string;
}

const PACKAGES = [
  { id: 'starter', name: 'Starter Pack', credits: 250,  priceNgn: 3750,  priceUsd: 2.50,  badge: 'Popular'    },
  { id: 'creator', name: 'Creator Pass', credits: 1000, priceNgn: 14000, priceUsd: 9.00,  badge: 'Best Value' },
  { id: 'studio',  name: 'Studio Pro',   credits: 5000, priceNgn: 65000, priceUsd: 42.00, badge: 'Scale'      },
];

export function PaystackModal({
  isOpen,
  onClose,
  onSuccess,
  userEmail = 'creator@primusdirector.ai',
}: PaystackModalProps) {
  const [selectedPkg,    setSelectedPkg]    = useState(PACKAGES[0]);
  const [paymentMethod,  setPaymentMethod]  = useState<'card' | 'transfer' | 'ussd'>('card');
  const [loading,        setLoading]        = useState(false);
  const [verifying,      setVerifying]      = useState(false);
  const [payRef,         setPayRef]         = useState<string | null>(null);
  const [authUrl,        setAuthUrl]        = useState<string | null>(null);
  const [copied,         setCopied]         = useState(false);
  const [timeLeft,       setTimeLeft]       = useState(1800);

  useEffect(() => {
    if (!isOpen) {
      setPayRef(null);
      setAuthUrl(null);
      setLoading(false);
      setVerifying(false);
      setTimeLeft(1800);
    }
  }, [isOpen]);

  useEffect(() => {
    if (authUrl && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [authUrl, timeLeft]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleInitialize = async () => {
    setLoading(true);
    try {
      const customRef = `PB_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const res = await api.initPaystackPayment({
        email:     userEmail,
        amount:    selectedPkg.priceNgn,
        currency:  'NGN',
        reference: customRef,
        metadata:  { credits: selectedPkg.credits, package_id: selectedPkg.id },
      });

      if (res.success && res.data) {
        setPayRef(res.data.reference || customRef);
        const url = res.data.authorization_url || res.data.url;
        if (url) {
          setAuthUrl(url);
          if (paymentMethod === 'card') window.open(url, '_blank');
        }
      }
    } catch (err: any) {
      console.error('[paystack] init error:', err.message);
      alert(`Payment initialization failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!payRef) return;
    setVerifying(true);
    try {
      const res = await api.verifyPaystackPayment(payRef);
      if (res.success && res.data?.status === 'success') {
        onSuccess(selectedPkg.credits);
        onClose();
      } else {
        alert('Payment pending. If you sent the transfer, please wait 30 s and try again.');
      }
    } catch (err: any) {
      console.error('[paystack] verify error:', err.message);
      alert(`Verification error: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
      <div className="relative w-full max-w-xl overflow-hidden border border-white/[0.09] bg-[#0d0d0e] text-[#f1f1ef] shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-white/[0.09] px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="grid size-9 place-items-center border border-white/20">
              <ShieldCheck className="size-4 text-[#c0c0bb]" />
            </div>
            <div>
              <h2 className="text-sm tracking-[-0.02em]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Paystack Wallet Top-up
              </h2>
              <p className="text-[11px] text-[#777773]">Secured payments for SnapGen video credits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6f6f6b] hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="space-y-6 p-6 max-h-[82vh] overflow-y-auto">

          {/* 1. Package selector */}
          <div>
            <p className="mb-3 label-caps">1. Select credit package</p>
            <div className="grid grid-cols-3 gap-2">
              {PACKAGES.map((pkg) => {
                const isSel = selectedPkg.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => { setSelectedPkg(pkg); setAuthUrl(null); }}
                    className={`relative flex flex-col justify-between border p-4 text-left transition-all ${
                      isSel
                        ? 'border-white bg-white/[0.05]'
                        : 'border-white/[0.09] hover:border-white/30'
                    }`}
                  >
                    {pkg.badge && (
                      <span className="absolute -top-2 right-3 bg-[#f1f1ef] px-2 py-0.5 text-[9px] font-semibold text-black uppercase tracking-wider">
                        {pkg.badge}
                      </span>
                    )}
                    <div>
                      <p className="text-[11px] text-[#a5a5a2]">{pkg.name}</p>
                      <p className="mt-1 text-lg font-light" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                        {pkg.credits.toLocaleString()}
                        <span className="ml-1 text-[11px] text-[#777773]">CR</span>
                      </p>
                    </div>
                    <div className="mt-3 border-t border-white/[0.08] pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-[#c0c0bb]">₦{pkg.priceNgn.toLocaleString()}</span>
                      <span className="text-[10px] text-[#6f6f6b]">~${pkg.priceUsd}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Payment method */}
          <div>
            <p className="mb-3 label-caps">2. Choose payment method</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'card',     label: 'Card',        icon: CreditCard },
                { id: 'transfer', label: 'Bank Transfer', icon: Building2  },
                { id: 'ussd',     label: 'USSD',        icon: PhoneCall  },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id as any)}
                  className={`flex flex-col items-center gap-2 border p-3 text-[11px] transition-all ${
                    paymentMethod === id
                      ? 'border-white bg-white/[0.05] text-white'
                      : 'border-white/[0.09] text-[#777773] hover:border-white/30 hover:text-[#c0c0bb]'
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Transfer details (after init) */}
          {paymentMethod === 'transfer' && authUrl && (
            <div className="border border-white/[0.09] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs text-[#c0c0bb]">
                  <Building2 className="size-3.5" /> Virtual account details
                </span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-[#777773]">
                  <Clock className="size-3" /> {formatTime(timeLeft)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-black/40 p-3 text-xs">
                <div>
                  <p className="label-caps mb-1">Bank Name</p>
                  <p className="text-[#e5e5e1]">Wema / Paystack Titan</p>
                </div>
                <div>
                  <p className="label-caps mb-1">Account Name</p>
                  <p className="text-[#e5e5e1]">Primus AI — {selectedPkg.credits} CR</p>
                </div>
                <div className="col-span-2 flex items-center justify-between border-t border-white/[0.08] pt-2">
                  <div>
                    <p className="label-caps mb-1">Account Number</p>
                    <p className="font-mono text-base text-[#f1f1ef]">9948271034</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('9948271034')}
                    className="flex items-center gap-1 border border-white/20 px-2.5 py-1 text-[11px] text-[#c0c0bb] hover:bg-white hover:text-black transition-all"
                  >
                    <Copy className="size-3" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Footer actions ── */}
          <div className="border-t border-white/[0.09] pt-5 flex items-center justify-between">
            <div>
              <p className="label-caps">Amount due</p>
              <p className="mt-1 text-2xl font-light" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                ₦{selectedPkg.priceNgn.toLocaleString()}
              </p>
            </div>

            {!authUrl ? (
              <button
                onClick={handleInitialize}
                disabled={loading}
                className="flex items-center gap-2 bg-white px-5 py-3 text-xs font-medium text-black hover:bg-[#d6d6d6] disabled:opacity-50 transition-colors"
              >
                {loading
                  ? <Loader2 className="size-4 animate-spin" />
                  : <ShieldCheck className="size-4" />
                }
                Proceed to Paystack
                <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="flex items-center gap-2 border border-white/40 px-5 py-3 text-xs text-white hover:bg-white hover:text-black disabled:opacity-50 transition-all"
              >
                {verifying
                  ? <Loader2 className="size-4 animate-spin" />
                  : <CheckCircle2 className="size-4" />
                }
                I have sent the money
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
