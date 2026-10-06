'use client';

import React, { useState } from 'react';
import { X, Share2, PlaySquare, Video, Sparkles, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';

interface PublishDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    title: string;
    premise: string;
    videoUrl?: string;
  } | null;
}

export function PublishDrawer({ isOpen, onClose, project }: PublishDrawerProps) {
  const [platform,    setPlatform]    = useState<'youtube' | 'tiktok'>('youtube');
  const [title,       setTitle]       = useState(project?.title ?? 'Cyberpunk Heist: Official Short Film');
  const [description, setDescription] = useState(
    'Watch the official premiere of Cyberpunk Heist. Directed with Primus Director AI.\n\n#Cyberpunk #ShortFilm #AIVideo'
  );
  const [published,   setPublished]   = useState(false);
  const [publishing,  setPublishing]  = useState(false);

  if (!isOpen || !project) return null;

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 2000);
  };

  const autoGenerate = () => {
    setDescription(
      `${project.title} — An AI-directed short film.\n${project.premise}\n\n#AIFilm #PrimusDirector #ShortFilm #${platform === 'tiktok' ? 'TikTokFilm' : 'YouTubeFilm'}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 animate-fade-in">
      <div className="relative h-full w-full max-w-lg border-l border-white/[0.09] bg-[#0d0d0e] text-[#f1f1ef] flex flex-col overflow-y-auto animate-slide-right">

        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-white/[0.09] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid size-8 place-items-center border border-white/20">
              <Share2 className="size-3.5" />
            </div>
            <div>
              <h3 className="text-sm tracking-[-0.02em]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Publish Film
              </h3>
              <p className="text-[11px] text-[#777773]">{project.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#6f6f6b] hover:text-white transition-colors">
            <X className="size-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 p-6">
          {!published ? (
            <div className="space-y-6">

              {/* Platform selector */}
              <div>
                <p className="mb-3 label-caps">Platform</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPlatform('youtube')}
                    className={`flex items-center justify-center gap-2 border p-3 text-xs transition-all ${
                      platform === 'youtube'
                        ? 'border-white bg-white/[0.05] text-white'
                        : 'border-white/[0.09] text-[#777773] hover:border-white/30 hover:text-[#c0c0bb]'
                    }`}
                  >
                    <PlaySquare className="size-4" />
                    YouTube (16:9)
                  </button>
                  <button
                    onClick={() => setPlatform('tiktok')}
                    className={`flex items-center justify-center gap-2 border p-3 text-xs transition-all ${
                      platform === 'tiktok'
                        ? 'border-white bg-white/[0.05] text-white'
                        : 'border-white/[0.09] text-[#777773] hover:border-white/30 hover:text-[#c0c0bb]'
                    }`}
                  >
                    <Video className="size-4" />
                    TikTok (9:16)
                  </button>
                </div>
              </div>

              {/* Video title */}
              <div>
                <p className="mb-2 label-caps">Video title</p>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-white/[0.09] bg-[#111112] p-3 text-xs text-[#f1f1ef] placeholder-[#555552] focus:border-white/30 outline-none transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="label-caps">Description & hashtags</p>
                  <button
                    onClick={autoGenerate}
                    className="flex items-center gap-1 text-[11px] text-[#aaa7b4] hover:text-white transition-colors"
                  >
                    <Sparkles className="size-3" />
                    Auto-generate
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full border border-white/[0.09] bg-[#111112] p-3 text-xs text-[#f1f1ef] placeholder-[#555552] focus:border-white/30 outline-none transition-colors resize-none"
                />
              </div>

              {/* Info note */}
              <p className="text-[11px] text-[#555552] leading-5">
                Publishing connects to your linked {platform === 'youtube' ? 'YouTube' : 'TikTok'} account via OAuth. 
                Ensure your account is linked under Settings.
              </p>
            </div>
          ) : (
            /* Success state */
            <div className="flex h-full items-center justify-center">
              <div className="text-center space-y-5 border border-white/[0.09] p-10">
                <CheckCircle2 className="size-12 text-[#c0c0bb] mx-auto" />
                <div>
                  <h4 className="text-base font-light" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    Published successfully.
                  </h4>
                  <p className="text-xs text-[#777773] mt-1">
                    Your film is live on {platform === 'youtube' ? 'YouTube' : 'TikTok'}.
                  </p>
                </div>
                <a
                  href={platform === 'youtube' ? 'https://youtube.com' : 'https://tiktok.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-white/20 px-4 py-2.5 text-xs text-[#c0c0bb] hover:bg-white hover:text-black transition-all"
                >
                  View published video
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {!published && (
          <div className="border-t border-white/[0.09] px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="border border-white/[0.09] px-4 py-2.5 text-xs text-[#777773] hover:text-white hover:border-white/30 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 bg-white px-5 py-2.5 text-xs font-medium text-black hover:bg-[#d6d6d6] disabled:opacity-50 transition-colors"
            >
              {publishing && <Loader2 className="size-4 animate-spin" />}
              {publishing ? 'Publishing…' : `Publish to ${platform === 'youtube' ? 'YouTube' : 'TikTok'}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
