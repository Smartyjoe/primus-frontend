'use client';

import React, { useState } from 'react';
import { Key, Globe, Copy, Plus, Check, Code, Activity, ArrowRight } from 'lucide-react';

const DELIVERY_LOGS = [
  { id: 'ev_101', event: 'clip.completed',     status: 200, time: '2 mins ago',  payload: '{ "uuid": "c558a44c-...", "status": 2 }' },
  { id: 'ev_100', event: 'project.stage_ready',status: 200, time: '14 mins ago', payload: '{ "projectId": "prj_992", "stage": "storyboard" }' },
  { id: 'ev_099', event: 'render.finished',    status: 200, time: '1 hour ago',  payload: '{ "renderId": "rnd_381", "exportUrl": "https://..." }' },
];

export function DeveloperConsoleView() {
  const [apiKey,     setApiKey]     = useState('pk_live_8f92a10b4c738e91d0a2');
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourdomain.com/webhooks/primus');
  const [copiedKey,  setCopiedKey]  = useState(false);
  const [copiedSec,  setCopiedSec]  = useState(false);

  const copy = (text: string, isSecret: boolean) => {
    navigator.clipboard.writeText(text);
    if (isSecret) { setCopiedSec(true); setTimeout(() => setCopiedSec(false), 2000); }
    else          { setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }
  };

  return (
    <div className="space-y-10">
      {/* ── Page header ── */}
      <header className="mb-12 flex flex-col justify-between gap-6 border-b border-white/[0.09] pb-8 md:flex-row md:items-end">
        <div>
          <p className="mb-3 label-caps" style={{ color: '#827f87' }}>Developer Hub</p>
          <h1 className="max-w-3xl text-3xl font-light tracking-[-0.045em] md:text-5xl" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            API Keys &amp; Webhooks
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#8e8e8a]">
            Integrate the Primus Director video engine directly into your external products.
          </p>
        </div>
      </header>

      {/* ── Section 1: API Key ── */}
      <section className="border border-white/[0.09] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="size-4 text-[#c0c0bb]" />
            <h2 className="text-sm text-[#e5e5e1]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Developer API Key
            </h2>
          </div>
          <button className="flex items-center gap-1.5 border border-white/20 px-3 py-1.5 text-xs text-[#c0c0bb] hover:bg-white hover:text-black transition-all">
            <Plus className="size-3.5" />
            Generate new key
          </button>
        </div>

        <div className="flex items-center justify-between border border-white/[0.09] bg-[#111112] p-4">
          <div>
            <p className="label-caps mb-1">Live Secret Key</p>
            <p className="font-mono text-sm text-[#f1f1ef]">{apiKey}</p>
          </div>
          <button
            onClick={() => copy(apiKey, false)}
            className="flex items-center gap-1.5 border border-white/[0.09] px-3 py-1.5 text-xs text-[#777773] hover:border-white/30 hover:text-white transition-all"
          >
            {copiedKey ? <Check className="size-3.5 text-[#c0c0bb]" /> : <Copy className="size-3.5" />}
            {copiedKey ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>

      {/* ── Section 2: Webhooks ── */}
      <section className="border border-white/[0.09] p-6 space-y-5">
        <div className="flex items-center gap-2.5">
          <Globe className="size-4 text-[#c0c0bb]" />
          <h2 className="text-sm text-[#e5e5e1]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Signed Webhook Subscriptions
          </h2>
        </div>

        {/* URL input */}
        <div>
          <p className="mb-2 label-caps">Webhook Listener URL</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 border border-white/[0.09] bg-[#111112] px-4 py-2.5 font-mono text-xs text-[#f1f1ef] focus:border-white/30 outline-none transition-colors"
            />
            <button className="bg-white px-5 py-2.5 text-xs font-medium text-black hover:bg-[#d6d6d6] transition-colors flex-shrink-0">
              Save
              <ArrowRight className="inline ml-1.5 size-3.5" />
            </button>
          </div>
        </div>

        {/* Signing secret */}
        <div className="flex items-center justify-between border border-white/[0.09] bg-[#111112] p-4">
          <div>
            <p className="label-caps mb-1">Signing Secret (RSA-SHA256)</p>
            <p className="font-mono text-xs text-[#c0c0bb]">whsec_rsa_99812471029384710293</p>
          </div>
          <button
            onClick={() => copy('whsec_rsa_99812471029384710293', true)}
            className="flex items-center gap-1.5 border border-white/[0.09] px-3 py-1.5 text-xs text-[#777773] hover:border-white/30 hover:text-white transition-all"
          >
            {copiedSec ? <Check className="size-3.5 text-[#c0c0bb]" /> : <Copy className="size-3.5" />}
            {copiedSec ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>

      {/* ── Section 3: Delivery logs ── */}
      <section className="border border-white/[0.09] p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="size-4 text-[#c0c0bb]" />
            <h2 className="text-sm text-[#e5e5e1]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Recent Delivery Logs
            </h2>
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[11px] text-[#c0c0bb]">
            <span className="size-1.5 bg-[#c0c0bb] inline-block" />
            Listening
          </span>
        </div>

        <div className="border border-white/[0.09] divide-y divide-white/[0.07] overflow-hidden">
          {DELIVERY_LOGS.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="border border-white/20 px-2 py-0.5 font-mono text-[11px] text-[#c0c0bb]">
                  {log.status}
                </span>
                <span className="font-mono text-xs text-[#f1f1ef]">{log.event}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#777773]">
                <span>{log.time}</span>
                <button
                  onClick={() => alert(`Webhook Payload:\n${log.payload}`)}
                  className="flex items-center gap-1 text-[#aaa7b4] hover:text-white transition-colors"
                >
                  <Code className="size-3.5" />
                  Payload
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
