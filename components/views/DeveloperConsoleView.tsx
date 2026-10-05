'use client';

import React, { useState } from 'react';
import { Key, Globe, Copy, Plus, Check, Code, Activity, Shield, Terminal } from 'lucide-react';

export function DeveloperConsoleView() {
  const [apiKey, setApiKey] = useState('pk_live_8f92a10b4c738e91d0a2');
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourdomain.com/webhooks/primus');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  const deliveryLogs = [
    { id: 'ev_101', event: 'clip.completed', status: 200, time: '2 mins ago', payload: '{ "uuid": "c558a44c-...", "status": 2 }' },
    { id: 'ev_100', event: 'project.stage_ready', status: 200, time: '14 mins ago', payload: '{ "projectId": "prj_992", "stage": "storyboard" }' },
    { id: 'ev_099', event: 'render.finished', status: 200, time: '1 hour ago', payload: '{ "renderId": "rnd_381", "exportUrl": "https://..." }' },
  ];

  const copyText = (text: string, isSecret: boolean) => {
    navigator.clipboard.writeText(text);
    if (isSecret) {
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="space-y-10">
      <header className="border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-purple-400 font-semibold mb-1">Developer Hub</p>
          <h1 className="text-3xl font-light tracking-tight text-white">API Keys & Signed Webhooks</h1>
          <p className="text-xs text-gray-400 mt-1">Integrate Primus Director backend video engine directly into your external products.</p>
        </div>
      </header>

      {/* Section 1: API Keys */}
      <div className="rounded-2xl border border-white/10 bg-[#10121d] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="h-5 w-5 text-purple-400" />
            <h2 className="text-sm font-semibold text-white">Developer API Key</h2>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs text-purple-300 hover:bg-purple-500/20">
            <Plus className="h-3.5 w-3.5" /> Generate New Secret Key
          </button>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400">Live Secret Key</p>
            <p className="font-mono text-sm text-purple-300 font-semibold mt-0.5">{apiKey}</p>
          </div>
          <button
            onClick={() => copyText(apiKey, false)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
          >
            {copiedKey ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
          </button>
        </div>
      </div>

      {/* Section 2: Webhook Configuration */}
      <div className="rounded-2xl border border-white/10 bg-[#10121d] p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <Globe className="h-5 w-5 text-blue-400" />
          <h2 className="text-sm font-semibold text-white">Signed Webhook Subscriptions</h2>
        </div>

        <div className="space-y-3">
          <label className="text-xs text-gray-400 block">Webhook Listener URL</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs font-mono text-white focus:border-blue-500 focus:outline-none"
            />
            <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500">
              Save Webhook
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/40 p-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-400">Signing Secret (RSA-SHA256)</p>
            <p className="font-mono text-xs text-gray-300 mt-0.5">whsec_rsa_99812471029384710293</p>
          </div>
          <button
            onClick={() => copyText('whsec_rsa_99812471029384710293', true)}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
          >
            {copiedSecret ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedSecret ? 'Copied' : 'Copy Secret'}</span>
          </button>
        </div>
      </div>

      {/* Section 3: Webhook Delivery Log */}
      <div className="rounded-2xl border border-white/10 bg-[#10121d] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Recent Webhook Delivery Logs</h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            ● Listening
          </span>
        </div>

        <div className="divide-y divide-white/5 rounded-xl border border-white/5 bg-black/40 overflow-hidden">
          {deliveryLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between p-4 hover:bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-300">
                  {log.status} OK
                </span>
                <span className="font-mono text-xs text-white">{log.event}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>{log.time}</span>
                <button
                  onClick={() => alert(`Webhook Payload:\n${log.payload}`)}
                  className="flex items-center gap-1 text-purple-400 hover:underline"
                >
                  <Code className="h-3.5 w-3.5" /> Payload
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
