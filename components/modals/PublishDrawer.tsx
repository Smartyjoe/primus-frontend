'use client';

import React, { useState } from 'react';
import { X, Share2, PlaySquare, Video, Sparkles, CheckCircle2, Copy, Tag, ExternalLink } from 'lucide-react';

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
  const [platform, setPlatform] = useState<'youtube' | 'tiktok'>('youtube');
  const [title, setTitle] = useState(project?.title || 'Cyberpunk Heist: Official Short Film');
  const [description, setDescription] = useState(
    'Watch the official premiere of Cyberpunk Heist. Directed with Primus Director AI.\n\n#Cyberpunk #ShortFilm #AIVideo'
  );
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);

  if (!isOpen || !project) return null;

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="relative h-full w-full max-w-lg border-l border-white/10 bg-[#0c0e17] text-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400">
                <Share2 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">One-Click Social Publishing</h3>
                <p className="text-xs text-gray-400">{project.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {!published ? (
            <div className="mt-5 space-y-5">
              {/* Platform Selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPlatform('youtube')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
                    platform === 'youtube'
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-white'
                  }`}
                >
                  <PlaySquare className="h-4 w-4 text-red-500" />
                  <span>YouTube (16:9)</span>
                </button>
                <button
                  onClick={() => setPlatform('tiktok')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all ${
                    platform === 'tiktok'
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-white'
                  }`}
                >
                  <Video className="h-4 w-4 text-cyan-400" />
                  <span>TikTok (9:16)</span>
                </button>
              </div>

              {/* Title & Description Inputs */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-2">
                  Video Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Description & AI Trend Hashtags
                  </label>
                  <button className="flex items-center gap-1 text-[11px] text-purple-400 hover:underline">
                    <Sparkles className="h-3 w-3" /> Auto-Generate Metadata
                  </button>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="mt-8 text-center p-6 space-y-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
              <div>
                <h4 className="text-base font-semibold text-white">Published Successfully!</h4>
                <p className="text-xs text-gray-400 mt-1">Your film is live on {platform === 'youtube' ? 'YouTube' : 'TikTok'}.</p>
              </div>
              <a
                href={platform === 'youtube' ? 'https://youtube.com' : 'https://tiktok.com'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs text-white hover:bg-white/20"
              >
                <span>View Published Video</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        {!published && (
          <div className="border-t border-white/10 pt-4 flex items-center justify-end gap-3 mt-6">
            <button onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs text-gray-300 hover:bg-white/10">
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-600/30"
            >
              <span>{publishing ? 'Publishing...' : `Publish to ${platform === 'youtube' ? 'YouTube' : 'TikTok'}`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
