'use client';

import React, { useState, useEffect } from 'react';
import { X, CreditCard, Building2, PhoneCall, CheckCircle2, Loader2, ArrowRight, ShieldCheck, Copy, Clock } from 'lucide-react';
import { api } from '@/lib/api';

interface PaystackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (creditsAdded: number) => void;
  userEmail?: string;
}

const PACKAGES = [
  { id: 'starter', name: 'Starter Pack', credits: 250, priceNgn: 3750, priceUsd: 2.50, badge: 'Popular' },
  { id: 'creator', name: 'Creator Pass', credits: 1000, priceNgn: 14000, priceUsd: 9.00, badge: 'Best Value' },
  { id: 'studio', name: 'Studio Pro', credits: 5000, priceNgn: 65000, priceUsd: 42.00, badge: 'Scale' },
];

export function PaystackModal({ isOpen, onClose, onSuccess, userEmail = 'creator@primusdirector.ai' }: PaystackModalProps) {
  const [selectedPkg, setSelectedPkg] = useState(PACKAGES[0]);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [payRef, setPayRef] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds

  useEffect(() => {
    if (!isOpen) {
      setPayRef(null);
      setAuthUrl(null);
      setLoading(false);
      setVerifying(false);
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
        email: userEmail,
        amount: selectedPkg.priceNgn,
        currency: 'NGN',
        reference: customRef,
        metadata: { credits: selectedPkg.credits, package_id: selectedPkg.id },
      });

      if (res.success && res.data) {
        setPayRef(res.data.reference || customRef);
        const url = res.data.authorization_url || res.data.url;
        if (url) {
          setAuthUrl(url);
          // If user chose card, open Paystack checkout window
          if (paymentMethod === 'card') {
            window.open(url, '_blank');
          }
        }
      }
    } catch (err: any) {
      alert(`Payment Initialization Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!payRef) return;
    setVerifying(true);
    try {
      const res = await api.verifyPaystackPayment(payRef);
      if (res.success && res.data.status === 'success') {
        onSuccess(selectedPkg.credits);
        onClose();
      } else {
        alert('Payment verification in progress. If you completed transfer, please wait 30 seconds and try again.');
      }
    } catch (err: any) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d0f17] text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-medium tracking-tight">Paystack Secured Wallet Checkout</h2>
              <p className="text-xs text-gray-400">Top-up platform credits for AI video generation</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
          {/* Package Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-3">
              1. Select Credit Package
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PACKAGES.map((pkg) => {
                const isSel = selectedPkg.id === pkg.id;
                return (
                  <button
                    key={pkg.id}
                    onClick={() => { setSelectedPkg(pkg); setAuthUrl(null); }}
                    className={`relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                      isSel
                        ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    {pkg.badge && (
                      <span className="absolute -top-2.5 right-3 rounded-full bg-purple-600 px-2 py-0.5 text-[9px] font-semibold text-white uppercase tracking-wider">
                        {pkg.badge}
                      </span>
                    )}
                    <div>
                      <p className="text-xs font-medium text-gray-300">{pkg.name}</p>
                      <p className="mt-1 text-lg font-bold text-white">{pkg.credits.toLocaleString()} <span className="text-xs font-normal text-purple-400">CR</span></p>
                    </div>
                    <div className="mt-3 border-t border-white/5 pt-2 flex items-center justify-between text-xs text-gray-400">
                      <span>₦{pkg.priceNgn.toLocaleString()}</span>
                      <span className="text-[10px]">~${pkg.priceUsd}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-3">
              2. Choose Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'card', label: 'Debit/Credit Card', icon: CreditCard },
                { id: 'transfer', label: 'Bank Transfer (NGN)', icon: Building2 },
                { id: 'ussd', label: 'USSD Code', icon: PhoneCall },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id as any)}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-medium transition-all ${
                    paymentMethod === id
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 text-blue-400" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Paystack Virtual Bank Account Display (if Transfer selected or authUrl ready) */}
          {paymentMethod === 'transfer' && authUrl && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Building2 className="h-4 w-4" /> Paystack Virtual Account Details
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono text-gray-400">
                  <Clock className="h-3 w-3" /> Expires in {formatTime(timeLeft)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs bg-black/40 p-3 rounded-lg border border-white/5">
                <div>
                  <p className="text-[10px] text-gray-400">Bank Name</p>
                  <p className="font-semibold text-white">Wema / Paystack Titan</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">Account Name</p>
                  <p className="font-semibold text-white">Primus AI — {selectedPkg.credits} CR</p>
                </div>
                <div className="col-span-2 flex items-center justify-between border-t border-white/5 pt-2">
                  <div>
                    <p className="text-[10px] text-gray-400">Account Number</p>
                    <p className="font-mono text-base font-bold text-emerald-400">9948271034</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard('9948271034')}
                    className="flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 text-[11px] font-medium text-gray-300 hover:bg-white/20"
                  >
                    <Copy className="h-3 w-3" /> {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-400">Amount Due</p>
              <p className="text-xl font-bold text-white">₦{selectedPkg.priceNgn.toLocaleString()}</p>
            </div>

            {!authUrl ? (
              <button
                onClick={handleInitialize}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-500 disabled:opacity-50 transition-all"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                <span>Proceed to Paystack</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 disabled:opacity-50 transition-all"
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>I Have Sent The Money</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
