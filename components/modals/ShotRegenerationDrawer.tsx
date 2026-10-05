'use client';

import React, { useState } from 'react';
import { X, RefreshCw, Wand2, Sparkles, AlertTriangle, CheckCircle2, Film, Camera, Play, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface ShotRegenerationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  shot: {
    id: string;
    projectId: string;
    shotNumber: string;
    sceneNumber: number;
    title: string;
    prompt?: string;
    videoUrl?: string;
    status?: string;
    qcFlags?: string[];
  } | null;
  onShotRegenerated: (shotId: string, taskId: string) => void;
}

export function ShotRegenerationDrawer({ isOpen, onClose, shot, onShotRegenerated }: ShotRegenerationDrawerProps) {
  const [prompt, setPrompt] = useState(shot?.prompt || '');
  const [model, setModel] = useState('veo-3.1-fast');
  const [cameraMove, setCameraMove] = useState('Slow Pan Left');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (shot) {
      setPrompt(shot.prompt || `Cinematic establishing shot of ${shot.title}. High detail, photorealistic, 35mm film grain.`);
    }
  }, [shot]);

  if (!isOpen || !shot) return null;

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const res = await api.queueVideoGeneration({
        projectId: shot.projectId,
        shotId: shot.id,
        prompt: `${prompt}. Camera: ${cameraMove}`,
        model,
        aspect_ratio: '16:9',
        resolution: '720p',
      });

      if (res.success && res.data) {
        onShotRegenerated(shot.id, res.data.taskId);
        onClose();
      }
    } catch (err: any) {
      alert(`Regeneration Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="relative h-full w-full max-w-lg border-l border-white/10 bg-[#0c0e17] text-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-400">
                <RefreshCw className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Regenerate Shot {shot.shotNumber}</h3>
                <p className="text-xs text-gray-400">{shot.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Current Video / Status Preview */}
          <div className="mt-5 space-y-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/60 flex items-center justify-center">
              {shot.videoUrl ? (
                <video src={shot.videoUrl} controls className="h-full w-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <Film className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">No active video clip</p>
                </div>
              )}
            </div>

            {/* QC Flags Notice */}
            {shot.qcFlags && shot.qcFlags.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <p className="font-semibold">QC Issues Detected:</p>
                  <p className="text-[11px] text-amber-300/80">{shot.qcFlags.join(', ')}</p>
                </div>
              </div>
            )}

            {/* Prompt Adjuster */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                Compiler Prompt Adjustment
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Camera Movement Picker */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                Camera Choreography
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Slow Pan Left', 'Tracking Shot', 'Static Wide', 'Drone Flyover'].map((move) => (
                  <button
                    key={move}
                    onClick={() => setCameraMove(move)}
                    className={`flex items-center gap-2 rounded-lg border p-2.5 text-xs text-left transition-all ${
                      cameraMove === move
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300 font-medium'
                        : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-white'
                    }`}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>{move}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Model Tier Selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                Model Tier
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/60 p-3 text-xs text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="veo-3.1-fast">Veo 3.1 Fast (25 Credits — Recommended)</option>
                <option value="veo-3.1">Veo 3.1 Premium (40 Credits)</option>
                <option value="omni-flash">Omni Flash 10s (50 Credits)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/10">
            Cancel
          </button>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-600/30"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>Re-Roll Shot Only</span>
          </button>
        </div>
      </div>
    </div>
  );
}
