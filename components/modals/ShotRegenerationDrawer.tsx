'use client';

import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Camera, Film, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
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

const CAMERA_MOVES = ['Slow Pan Left', 'Tracking Shot', 'Static Wide', 'Drone Flyover'];
const MODELS = [
  { value: 'veo-3.1-fast',  label: 'Veo 3.1 Fast — 25 CR (Recommended)' },
  { value: 'veo-3.1',       label: 'Veo 3.1 Premium — 40 CR'             },
  { value: 'omni-flash',    label: 'Omni Flash 10s — 50 CR'              },
];

export function ShotRegenerationDrawer({
  isOpen,
  onClose,
  shot,
  onShotRegenerated,
}: ShotRegenerationDrawerProps) {
  const [prompt,     setPrompt]     = useState('');
  const [model,      setModel]      = useState('veo-3.1-fast');
  const [cameraMove, setCameraMove] = useState('Slow Pan Left');
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (shot) {
      setPrompt(
        shot.prompt ??
        `Cinematic establishing shot of ${shot.title}. High detail, photorealistic, 35mm film grain.`
      );
    }
  }, [shot]);

  if (!isOpen || !shot) return null;

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const res = await api.queueVideoGeneration({
        projectId:    shot.projectId,
        shotId:       shot.id,
        prompt:       `${prompt}. Camera: ${cameraMove}`,
        model,
        aspect_ratio: '16:9',
        resolution:   '720p',
      });

      if (res.success && res.data) {
        onShotRegenerated(shot.id, res.data.taskId);
        onClose();
      }
    } catch (err: any) {
      console.error('[shot-regen] error:', err.message);
      alert(`Regeneration error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 animate-fade-in">
      <div className="relative h-full w-full max-w-lg border-l border-white/[0.09] bg-[#0d0d0e] text-[#f1f1ef] flex flex-col overflow-y-auto animate-slide-right">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-white/[0.09] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center border border-white/20">
              <RefreshCw className="size-3.5" />
            </div>
            <div>
              <h3 className="text-sm tracking-[-0.02em]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Re-roll Shot {shot.shotNumber}
              </h3>
              <p className="text-[11px] text-[#777773]">{shot.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#6f6f6b] hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 space-y-6 p-6">

          {/* Current clip preview */}
          <div className="relative aspect-video w-full overflow-hidden border border-white/[0.09] bg-[#111112] flex items-center justify-center">
            {shot.videoUrl ? (
              <video src={shot.videoUrl} controls className="h-full w-full object-cover" />
            ) : (
              <div className="text-center">
                <Film className="size-8 text-[#3a3a3c] mx-auto mb-2" />
                <p className="text-[11px] text-[#555552]">No active clip</p>
              </div>
            )}
          </div>

          {/* QC flags */}
          {shot.qcFlags && shot.qcFlags.length > 0 && (
            <div className="flex items-start gap-3 border border-white/[0.09] p-3">
              <AlertTriangle className="size-4 text-[#a5a5a2] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-[#c0c0bb]">QC Issues Detected</p>
                <p className="text-[11px] text-[#777773] mt-0.5">{shot.qcFlags.join(', ')}</p>
              </div>
            </div>
          )}

          {/* Prompt */}
          <div>
            <p className="mb-2 label-caps">Prompt</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full border border-white/[0.09] bg-[#111112] p-3 text-xs text-[#f1f1ef] placeholder-[#555552] focus:border-white/30 outline-none transition-colors resize-none"
            />
          </div>

          {/* Camera movement */}
          <div>
            <p className="mb-2 label-caps">Camera choreography</p>
            <div className="grid grid-cols-2 gap-2">
              {CAMERA_MOVES.map((move) => (
                <button
                  key={move}
                  onClick={() => setCameraMove(move)}
                  className={`flex items-center gap-2 border p-2.5 text-xs text-left transition-all ${
                    cameraMove === move
                      ? 'border-white bg-white/[0.05] text-white'
                      : 'border-white/[0.09] text-[#777773] hover:border-white/30 hover:text-[#c0c0bb]'
                  }`}
                >
                  <Camera className="size-3.5" />
                  {move}
                </button>
              ))}
            </div>
          </div>

          {/* Model tier */}
          <div>
            <p className="mb-2 label-caps">Model tier</p>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full border border-white/[0.09] bg-[#111112] p-3 text-xs text-[#f1f1ef] focus:border-white/30 outline-none"
            >
              {MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-white/[0.09] px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="border border-white/[0.09] px-4 py-2.5 text-xs text-[#777773] hover:text-white hover:border-white/30 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleRegenerate}
            disabled={loading}
            className="flex items-center gap-2 bg-white px-5 py-2.5 text-xs font-medium text-black hover:bg-[#d6d6d6] disabled:opacity-50 transition-colors"
          >
            {loading
              ? <Loader2 className="size-4 animate-spin" />
              : <Sparkles className="size-4" />
            }
            {loading ? 'Queuing…' : 'Re-Roll Shot Only'}
          </button>
        </div>
      </div>
    </div>
  );
}
