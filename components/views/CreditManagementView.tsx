'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Zap,
  TrendingDown,
  RotateCcw,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Film,
  Sparkles,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';

interface CreditManagementViewProps {
  onOpenTopUp: (tierAmount?: number) => void;
  notify: (msg: string) => void;
}

export function CreditManagementView({ onOpenTopUp, notify }: CreditManagementViewProps) {
  const [wallet, setWallet] = useState<{ credits: number; email: string; role: string }>({
    credits: 1250,
    email: 'director@primus.film',
    role: 'director',
  });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit' | 'refund'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch live wallet and transaction history
  const loadCreditData = async () => {
    setLoading(true);
    console.info('[CreditManagementView] Fetching live wallet and transactions');
    try {
      const [walletRes, txRes] = await Promise.allSettled([
        api.getWallet(),
        api.getTransactions(),
      ]);

      if (walletRes.status === 'fulfilled' && walletRes.value?.success) {
        setWallet(walletRes.value.data);
      }
      if (txRes.status === 'fulfilled' && txRes.value?.success) {
        setTransactions(txRes.value.data || []);
      }
    } catch (err: any) {
      console.error('[CreditManagementView] Load error:', err);
      notify('Failed to sync live credit ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreditData();
  }, []);

  // Filter transactions
  const filteredTxs = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesSearch =
      !searchQuery ||
      tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate statistics
  const totalDebits = transactions
    .filter((t) => t.type === 'debit')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const totalRefunds = transactions
    .filter((t) => t.type === 'refund')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const totalRenders = transactions.filter((t) => t.type === 'debit').length;

  return (
    <div className="space-y-12">
      {/* ── Top Header ── */}
      <header className="flex flex-col justify-between gap-6 border-b border-white/[0.09] pb-8 md:flex-row md:items-end">
        <div>
          <p className="mb-3 label-caps" style={{ color: '#827f87' }}>Studio Treasury</p>
          <h1
            className="text-3xl font-light tracking-[-0.045em] text-white md:text-5xl"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Credit <span className="text-amber-400">Management</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#8e8e8a]">
            Transparent compute accounting for AI video, script engines, and keyframe rendering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadCreditData()}
            className="flex items-center gap-2 border border-white/15 px-3.5 py-2.5 text-xs text-zinc-300 hover:border-white hover:text-white transition-colors"
          >
            <RotateCcw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Ledger
          </button>
          <button
            onClick={() => onOpenTopUp()}
            className="btn-amber flex items-center gap-2"
          >
            <Plus className="size-4" />
            Top Up Credits
          </button>
        </div>
      </header>

      {/* ── Key Treasury Metrics ── */}
      <div className="grid gap-px border border-white/[0.09] bg-white/[0.09] sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Live Balance */}
        <div className="bg-[#0b0b0c] p-6">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="label-caps">Available Balance</span>
            <Zap className="size-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span
              className="text-4xl font-light text-white"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {wallet.credits.toLocaleString()}
            </span>
            <span className="font-mono text-xs text-amber-400">CR</span>
          </div>
          <p className="mt-2 text-[11px] text-[#71717a]">
            ≈ {Math.floor(wallet.credits / 4)} Veo 3.1 video shots ready
          </p>
        </div>

        {/* Metric 2: Total Compute Burn */}
        <div className="bg-[#0b0b0c] p-6">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="label-caps">Compute Burn</span>
            <TrendingDown className="size-4 text-zinc-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span
              className="text-4xl font-light text-zinc-200"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {totalDebits.toLocaleString()}
            </span>
            <span className="font-mono text-xs text-zinc-400">CR</span>
          </div>
          <p className="mt-2 text-[11px] text-[#71717a]">
            {totalRenders} generation runs billed
          </p>
        </div>

        {/* Metric 3: Auto-Refunds Returned */}
        <div className="bg-[#0b0b0c] p-6">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="label-caps">Auto-Refunds</span>
            <ShieldCheck className="size-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span
              className="text-4xl font-light text-amber-300"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              +{totalRefunds.toLocaleString()}
            </span>
            <span className="font-mono text-xs text-amber-400/80">CR</span>
          </div>
          <p className="mt-2 text-[11px] text-[#71717a]">
            Instant restitution on failed generations
          </p>
        </div>

        {/* Metric 4: Plan Status */}
        <div className="bg-[#0b0b0c] p-6">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="label-caps">Account Tier</span>
            <span className="badge-amber text-[9px] uppercase">{wallet.role}</span>
          </div>
          <div className="mt-4">
            <span
              className="text-2xl font-light text-white"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              Director Studio
            </span>
          </div>
          <p className="mt-2 text-[11px] text-[#71717a]">
            Zero rate-limit throttling enabled
          </p>
        </div>
      </div>

      {/* ── Model Tier Pricing & Compute Rates ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps text-[#827f87]">Compute Rate Matrix</p>
          <span className="text-[11px] text-[#71717a]">Enforced by SnapGen AI engine</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="border border-white/[0.08] bg-[#111114] p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white">Veo 3.1 Lite (8s Video)</span>
              <span className="font-mono text-xs text-amber-400">4 CR / shot</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#8e8e8a]">
              Full cinematic camera movement, 720p/1080p photorealistic AI video synthesis.
            </p>
          </div>

          <div className="border border-white/[0.08] bg-[#111114] p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white">Veo 3.1 Video Extend</span>
              <span className="font-mono text-xs text-amber-400">4 CR / extension</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#8e8e8a]">
              Sequential frame history continuation. Extends narrative cut seamlessly.
            </p>
          </div>

          <div className="border border-white/[0.08] bg-[#111114] p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-white">Character & Style DNA</span>
              <span className="font-mono text-xs text-amber-400">5 CR / anchor</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#8e8e8a]">
              Nano-Banana Pro high-res reference anchor image for character continuity.
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick Purchase Packages ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps text-[#827f87]">Instant Credit Packs</p>
          <span className="text-[11px] text-[#71717a]">Direct Paystack checkout with instant wallet recharge</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              name: 'Starter Film Pack',
              credits: 500,
              price: '₦500',
              shots: '125 video clips',
              recommended: false,
            },
            {
              name: 'Indie Studio Bundle',
              credits: 2500,
              price: '₦2,500',
              shots: '625 video clips',
              recommended: true,
            },
            {
              name: 'Feature Production Suite',
              credits: 10000,
              price: '₦10,000',
              shots: '2,500 video clips',
              recommended: false,
            },
          ].map((pack) => (
            <div
              key={pack.name}
              className={`relative flex flex-col justify-between border p-6 transition-all ${
                pack.recommended
                  ? 'border-amber-500/60 bg-[#14120e]'
                  : 'border-white/[0.08] bg-[#0e0e11] hover:border-white/20'
              }`}
            >
              {pack.recommended && (
                <div className="absolute -top-2.5 right-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[9px] font-bold text-black uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-white">{pack.name}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span
                    className="text-3xl font-light text-white"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {pack.credits.toLocaleString()}
                  </span>
                  <span className="font-mono text-xs text-amber-400">CR</span>
                </div>
                <p className="mt-1 text-xs text-[#a1a1aa]">{pack.shots}</p>
                <p className="mt-4 font-mono text-sm text-zinc-200">{pack.price}</p>
              </div>

              <button
                onClick={() => onOpenTopUp(pack.credits)}
                className={`mt-6 w-full py-2.5 text-xs font-medium transition-colors ${
                  pack.recommended
                    ? 'bg-amber-500 text-black hover:bg-amber-400'
                    : 'border border-white/20 text-white hover:bg-white hover:text-black'
                }`}
              >
                Purchase Pack
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Transaction History & Compute Ledger ── */}
      <div className="border border-white/[0.09] bg-[#0c0c0e]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.09] p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-sm font-medium text-white">Full Transaction Ledger</h2>
            <p className="text-[11px] text-[#71717a]">Cryptographically auditable double-entry history</p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 border border-white/10 bg-[#121215] px-3 py-1.5 text-xs text-white">
              <Search className="size-3.5 text-zinc-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter description…"
                className="bg-transparent outline-none placeholder:text-zinc-600 text-xs w-32 sm:w-44"
              />
            </div>

            <div className="flex border border-white/10 bg-[#121215] p-0.5 text-xs">
              {(['all', 'credit', 'debit', 'refund'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 capitalize transition-colors ${
                    filterType === type
                      ? 'bg-white text-black font-medium'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[10px] uppercase text-[#71717a] font-mono">
                <th className="px-5 py-3.5">Time</th>
                <th className="px-5 py-3.5">Type</th>
                <th className="px-5 py-3.5">Description</th>
                <th className="px-5 py-3.5">Reference ID</th>
                <th className="px-5 py-3.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    <Loader2 className="mx-auto size-5 animate-spin text-amber-400 mb-2" />
                    Loading ledger data…
                  </td>
                </tr>
              ) : filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-500">
                    No transactions match current filters.
                  </td>
                </tr>
              ) : (
                filteredTxs.map((tx) => {
                  const isCredit = tx.type === 'credit';
                  const isRefund = tx.type === 'refund';
                  const isDebit = tx.type === 'debit';

                  return (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-[11px] text-zinc-400">
                        {new Date(tx.created_at || Date.now()).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                            isCredit
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isRefund
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-zinc-200">
                        {tx.description || 'System operation'}
                      </td>

                      <td className="px-5 py-3.5 font-mono text-[10px] text-zinc-500">
                        {tx.id ? String(tx.id).substring(0, 16) + '…' : '—'}
                      </td>

                      <td className="px-5 py-3.5 text-right font-mono font-medium">
                        <span
                          className={
                            isCredit
                              ? 'text-emerald-400'
                              : isRefund
                              ? 'text-amber-300'
                              : 'text-zinc-400'
                          }
                        >
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount} CR
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
