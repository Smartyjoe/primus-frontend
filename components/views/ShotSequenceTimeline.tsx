'use client';

import { useState } from 'react';
import {
  Play,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  RefreshCw,
  Eye,
  Sliders,
  Film,
} from 'lucide-react';
import { api } from '@/lib/api';

export interface ShotItem {
  id: string;
  project_id: string;
  shot_index: number;
  scene_number: number;
  shot_number: number;
  intent?: string;
  dialogue_text?: string;
  flow_type?: 'CUT' | 'EXTEND';
  estimated_duration_sec?: number;
  raw_video_url?: string;
  image_frame_url?: string;
  status: 'Pending' | 'Queued' | 'Rendering' | 'Completed' | 'Failed';
  error_message?: string;
  progress?: number;
  refunded?: boolean;
}

interface ShotSequenceTimelineProps {
  projectId: string;
  shots: ShotItem[];
  selectedIndex: number;
  onSelectShot: (index: number) => void;
  onRefreshShots: () => void;
  notify: (msg: string) => void;
}

export function ShotSequenceTimeline({
  projectId,
  shots = [],
  selectedIndex,
  onSelectShot,
  onRefreshShots,
  notify,
}: ShotSequenceTimelineProps) {
  const [retryingId, setRetryingId] = useState<string | null>(null);

  // Calculate overall sequence statistics
  const totalShots = shots.length;
  const completedCount = shots.filter((s) => s.status === 'Completed').length;
  const renderingCount = shots.filter((s) => s.status === 'Rendering' || s.status === 'Queued').length;
  const failedCount = shots.filter((s) => s.status === 'Failed').length;
  const overallProgress = totalShots > 0 ? Math.round((completedCount / totalShots) * 100) : 0;
  const totalDurationSec = shots.reduce((acc, s) => acc + (s.estimated_duration_sec || 8), 0);
  const formattedDuration = `${Math.floor(totalDurationSec / 60)}m ${totalDurationSec % 60}s`;

  // Handle single shot retry with strict logging
  const handleRetryShot = async (shot: ShotItem, e: React.MouseEvent) => {
    e.stopPropagation();
    console.info(`[ShotSequenceTimeline] Retrying shot ${shot.id} (index ${shot.shot_index})`);
    setRetryingId(shot.id);

    try {
      const res = await api.retryShot({
        projectId: shot.project_id || projectId,
        shotId: shot.id,
        prompt: shot.intent || `Shot ${shot.shot_number} cinematic sequence`,
        model: 'veo-3.1-lite',
        aspect_ratio: '16:9',
      });

      if (res.success) {
        notify(`Shot 0${shot.shot_number} queued for re-render (+4 CR auto-refund registered)`);
        onRefreshShots();
      } else {
        throw new Error((res as any).error || 'Failed to re-queue shot');
      }
    } catch (err: any) {
      console.error(`[ShotSequenceTimeline] Error retrying shot ${shot.id}:`, err);
      notify(`Retry error: ${err.message || 'Could not queue shot'}`);
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="border border-white/[0.09] bg-[#0c0c0e]">
      {/* ── Sequence Header & Metrics ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.09] bg-[#101013] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-8 place-items-center border border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Film className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-sm tracking-tight text-white">Shot Sequence Flow</span>
              <span className="badge-amber text-[9px]">Veo 3.1 Studio Engine</span>
            </div>
            <p className="text-[11px] text-[#8e8e8a]">
              Continuous director pipeline · Total run: <span className="font-mono text-zinc-300">{formattedDuration}</span>
            </p>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="font-mono text-xs text-amber-400">{completedCount}/{totalShots} Complete</span>
              <p className="text-[10px] text-[#71717a]">{renderingCount} in pipeline · {failedCount} failed</p>
            </div>
            <div className="relative h-2 w-36 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span className="font-mono text-xs text-white">{overallProgress}%</span>
          </div>

          <button
            onClick={onRefreshShots}
            title="Refresh sequence state"
            className="grid size-8 place-items-center border border-white/15 text-[#a1a1aa] hover:border-white hover:text-white transition-colors"
          >
            <RotateCw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* ── Filmstrip Sprockets Top ── */}
      <div className="h-2.5 filmstrip-sprockets border-b border-white/[0.06] bg-[#080809]" />

      {/* ── Horizontal Filmstrip Reel ── */}
      <div className="overflow-x-auto p-6 scrollbar-thin">
        {shots.length === 0 ? (
          <div className="flex h-36 flex-col items-center justify-center border border-dashed border-white/10 text-center">
            <p className="text-xs text-[#8e8e8a]">No shots generated in this sequence yet.</p>
            <p className="mt-1 text-[11px] text-[#52525b]">Generate script or breakdown above to populate the timeline.</p>
          </div>
        ) : (
          <div className="flex gap-4 min-w-max">
            {shots.map((shot, index) => {
              const isSelected = selectedIndex === index;
              const isFailed = shot.status === 'Failed';
              const isRendering = shot.status === 'Rendering';
              const isQueued = shot.status === 'Queued';
              const isCompleted = shot.status === 'Completed';
              const isRetrying = retryingId === shot.id;

              return (
                <div
                  key={shot.id || index}
                  onClick={() => onSelectShot(index)}
                  className={`group relative flex w-72 flex-col justify-between border bg-[#111114] transition-all cursor-pointer ${
                    isSelected
                      ? 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.18)]'
                      : isFailed
                      ? 'border-rose-500/50 hover:border-rose-400'
                      : 'border-white/[0.08] hover:border-white/30'
                  }`}
                >
                  {/* Active Shot Top Line Indicator */}
                  {isSelected && (
                    <div className="absolute -top-px left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500" />
                  )}

                  {/* Thumbnail / Visual Viewport */}
                  <div className="relative aspect-video w-full overflow-hidden bg-[#18181b]">
                    {shot.raw_video_url ? (
                      <video
                        src={shot.raw_video_url}
                        className="h-full w-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
                        onMouseLeave={(e) => (e.target as HTMLVideoElement).pause()}
                      />
                    ) : shot.image_frame_url ? (
                      <img
                        src={shot.image_frame_url}
                        alt={`Shot ${index + 1}`}
                        className="h-full w-full object-cover grayscale-[0.3]"
                      />
                    ) : (
                      <div className="shot-thumb flex h-full w-full flex-col items-center justify-center p-3 text-center">
                        {isRendering ? (
                          <div className="flex flex-col items-center gap-2">
                            <RefreshCw className="size-5 animate-spin text-amber-400" />
                            <span className="font-mono text-[10px] text-amber-300">
                              RENDERING ({shot.progress ?? 45}%)
                            </span>
                          </div>
                        ) : isQueued ? (
                          <div className="flex flex-col items-center gap-1 text-zinc-400">
                            <Clock className="size-4 animate-pulse text-amber-400/80" />
                            <span className="font-mono text-[10px] text-zinc-400">QUEUED</span>
                          </div>
                        ) : isFailed ? (
                          <div className="flex flex-col items-center gap-1 text-rose-400">
                            <AlertTriangle className="size-5" />
                            <span className="font-mono text-[10px] font-medium tracking-wider">RENDER FAILED</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-zinc-500">
                            <span>Ready for Render</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Top overlay pills */}
                    <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
                      <span className="bg-black/80 px-1.5 py-0.5 font-mono text-[9px] text-white">
                        0{shot.scene_number || 1}.{String(shot.shot_number || index + 1).padStart(2, '0')}
                      </span>
                      <span className="bg-white/10 px-1.5 py-0.5 text-[9px] text-[#d4d4d8]">
                        {shot.flow_type || 'CUT'}
                      </span>
                    </div>

                    <div className="absolute right-2.5 top-2.5">
                      <span className="bg-black/80 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400">
                        00:0{shot.estimated_duration_sec || 8}
                      </span>
                    </div>

                    {/* Video play icon hint if completed */}
                    {isCompleted && (
                      <div className="absolute bottom-2 right-2 grid size-6 place-items-center rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="size-3 fill-current ml-0.5" />
                      </div>
                    )}
                  </div>

                  {/* Shot Meta Details */}
                  <div className="p-3.5">
                    <p className="line-clamp-2 text-xs font-light leading-relaxed text-[#f4f4f5]">
                      {shot.intent || shot.dialogue_text || `Shot ${index + 1} narrative composition`}
                    </p>

                    {/* Status Row */}
                    <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-2.5 text-[10px]">
                      {isCompleted ? (
                        <span className="flex items-center gap-1.5 font-mono text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          READY
                        </span>
                      ) : isRendering ? (
                        <span className="flex items-center gap-1.5 font-mono text-amber-400">
                          <span className="size-1.5 animate-ping rounded-full bg-amber-400" />
                          RENDERING
                        </span>
                      ) : isQueued ? (
                        <span className="flex items-center gap-1.5 font-mono text-zinc-400">
                          <Clock className="size-3" />
                          IN QUEUE
                        </span>
                      ) : isFailed ? (
                        <span className="flex items-center gap-1.5 font-mono text-rose-400">
                          <AlertTriangle className="size-3" />
                          FAILED
                        </span>
                      ) : (
                        <span className="font-mono text-zinc-500">DRAFT</span>
                      )}

                      <span className="text-[10px] text-[#71717a]">
                        {shot.flow_type === 'EXTEND' ? 'History Linked' : 'Key Ingredient'}
                      </span>
                    </div>

                    {/* ── Failed Shot Diagnostic & Auto-Refund Banner ── */}
                    {isFailed && (
                      <div className="mt-3 rounded border border-rose-500/30 bg-rose-950/20 p-2 text-left">
                        <div className="flex items-start justify-between gap-1 text-[10px]">
                          <span className="text-rose-300">
                            {shot.error_message || 'Model capacity retry exceeded'}
                          </span>
                        </div>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="inline-flex items-center text-[9px] font-mono text-amber-300">
                            +4 CR Auto-Refunded
                          </span>
                          <button
                            onClick={(e) => handleRetryShot(shot, e)}
                            disabled={isRetrying}
                            className="flex items-center gap-1 rounded bg-amber-500 px-2 py-1 text-[10px] font-medium text-black hover:bg-amber-400 disabled:opacity-50 transition-colors"
                          >
                            <RefreshCw className={`size-2.5 ${isRetrying ? 'animate-spin' : ''}`} />
                            {isRetrying ? 'Retrying…' : 'Retry Shot'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Filmstrip Sprockets Bottom ── */}
      <div className="h-2.5 filmstrip-sprockets border-t border-white/[0.06] bg-[#080809]" />
    </div>
  );
}
