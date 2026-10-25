'use client';

import { useState, useEffect } from 'react';
import {
  AlertTriangle, ArrowRight, Bell, Check, ChevronDown, Download,
  Film, FolderOpen, Gauge, Layers3, MapPin, Menu, MoreHorizontal, Pause, Play,
  Plus, RefreshCw, Search, Settings2, Share2, SlidersHorizontal, UserRound,
  Wand2, X, Code, Aperture, Clock3, Loader2, Zap,
} from 'lucide-react';
import { api } from '@/lib/api';
import { PaystackModal } from '@/components/modals/PaystackModal';
import { ShotRegenerationDrawer } from '@/components/modals/ShotRegenerationDrawer';
import { PublishDrawer } from '@/components/modals/PublishDrawer';
import { LoginModal } from '@/components/modals/LoginModal';
import { DeveloperConsoleView } from '@/components/views/DeveloperConsoleView';
import { ShotSequenceTimeline } from '@/components/views/ShotSequenceTimeline';
import { CreditManagementView } from '@/components/views/CreditManagementView';
import { useAuth } from '@/components/AuthProvider';

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | 'projects' | 'canvas' | 'characters' | 'locations'
  | 'templates' | 'billing' | 'settings' | 'story'
  | 'storyboard' | 'render' | 'preview' | 'developer';

// ─── Navigation config ────────────────────────────────────────────────────────

const navPrimary = [
  { id: 'projects'   as Screen, label: 'Projects',       icon: FolderOpen },
  { id: 'canvas'     as Screen, label: 'Director Canvas', icon: Film, badge: 'Sequence' },
  { id: 'characters' as Screen, label: 'Characters',     icon: UserRound  },
  { id: 'locations'  as Screen, label: 'Locations',      icon: MapPin     },
  { id: 'templates'  as Screen, label: 'Templates',      icon: Layers3    },
];

const navSecondary = [
  { id: 'billing'   as Screen, label: 'Credits & Ledger',  icon: Gauge, badge: 'Live' },
  { id: 'developer' as Screen, label: 'API & Webhooks',    icon: Code     },
  { id: 'settings'  as Screen, label: 'Settings',          icon: Settings2 },
];

// ─── Mock shot thumbnails (grayscale gradient) ────────────────────────────────

const SHOT_THUMBS = [
  'bg-[radial-gradient(ellipse_at_65%_35%,#cbd5d8_0%,#5d6668_24%,#1b2223_62%,#080909_100%)]',
  'bg-[radial-gradient(ellipse_at_40%_40%,#b5bdba_0%,#596463_25%,#171d1d_62%,#070808_100%)]',
  'bg-[radial-gradient(ellipse_at_55%_42%,#d2b9a4_0%,#665b55_24%,#211e1e_58%,#090909_100%)]',
  'bg-[radial-gradient(ellipse_at_50%_35%,#b7c2c7_0%,#566169_22%,#1c2428_60%,#070808_100%)]',
];

// ─── Root Page ────────────────────────────────────────────────────────────────

export default function Page() {
  const { user, signOut } = useAuth();
  const [screen, setScreen]               = useState<Screen>('projects');
  const [mobileNav, setMobileNav]         = useState(false);
  const [toast, setToast]                 = useState('');
  const [credits, setCredits]             = useState(1250);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectsList, setProjectsList]       = useState<any[]>([]);
  const [currentProject, setCurrentProject]   = useState<any>(null);
  const [selectedShotIndex, setSelectedShotIndex] = useState(0);

  const [paystackOpen,   setPaystackOpen]   = useState(false);
  const [regenShot,      setRegenShot]      = useState<any | null>(null);
  const [publishProject, setPublishProject] = useState<any | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginMessage,   setLoginMessage]   = useState('');

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const go = (next: Screen)   => { setScreen(next); setMobileNav(false); };

  // ── Sync live wallet credits
  const syncWallet = () => {
    api.getWallet()
      .then((res) => {
        if (res.success && res.data?.credits !== undefined) {
          setCredits(res.data.credits);
        }
      })
      .catch((err) => console.warn('[wallet] sync warning:', err.message));
  };

  useEffect(() => {
    syncWallet();
  }, [user]);

  // ── Fetch projects on load
  const loadProjects = () => {
    api.getProjects()
      .then((res) => { if (res.success && res.data) setProjectsList(res.data); })
      .catch((err) => console.error('[projects] fetch failed:', err.message));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  // ── Fetch active project details
  const refreshProjectDetails = () => {
    if (!activeProjectId) return;
    api.getProjectDetails(activeProjectId)
      .then((res) => { if (res.success && res.data) setCurrentProject(res.data); })
      .catch((err) => console.warn('[project-details] fetch failed:', err.message));
  };

  useEffect(() => {
    refreshProjectDetails();
  }, [activeProjectId]);

  const activeNav = [...navPrimary, ...navSecondary].find((n) => n.id === screen)?.id ?? 'projects';

  return (
    <main className="min-h-screen bg-[#080809] text-[#f4f4f5]">

      {/* ── Top header ── */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#080809]/95 backdrop-blur-md px-4 md:px-6">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => setMobileNav(!mobileNav)}
            className="text-[#a5a5a2] md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>

          {/* Brand with Amber Aperture */}
          <button onClick={() => go('projects')} className="flex items-center gap-2.5">
            <span className="grid size-6 place-items-center border border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <Aperture className="size-3.5" />
            </span>
            <span className="text-[13px] tracking-[-0.01em] font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              PRIMUS <span className="text-amber-400 font-mono text-[11px] font-normal">DIRECTOR</span>
            </span>
          </button>

          <span className="hidden h-4 w-px bg-white/15 sm:block" />

          {/* Studio Live Tally */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-mono">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
            REC STANDBY
          </div>

          <span className="hidden h-4 w-px bg-white/15 lg:block" />

          {/* Active project breadcrumb */}
          <button
            onClick={() => go('canvas')}
            className="hidden items-center gap-2 text-xs text-[#d4d4d8] hover:text-white transition-colors sm:flex"
          >
            <span className="text-zinc-500">Project:</span>
            <span className="font-medium text-amber-300">{currentProject?.title ?? 'Cyberpunk Heist'}</span>
            <ChevronDown className="size-3 text-[#777773]" />
          </button>
        </div>

        <div className="flex items-center gap-3.5 text-xs text-[#a5a5a2]">
          <button
            onClick={() => notify('Project state synced with director engine')}
            className="hidden items-center gap-2 border border-white/10 px-2.5 py-1 text-[11px] text-zinc-400 hover:border-white/30 hover:text-white transition-colors lg:flex"
          >
            <span className="size-1.5 bg-amber-400" />
            Checkpoint Active
          </button>

          {/* Live Wallet Chip */}
          <button
            onClick={() => { syncWallet(); go('billing'); }}
            title="Open Credit Management"
            className="flex items-center gap-1.5 font-mono text-xs px-3 py-1 border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          >
            <Zap className="size-3 text-amber-400 fill-amber-400" />
            <span>{credits.toLocaleString()}</span>
            <span className="text-[10px] text-amber-400/80">CR</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2.5 pl-1">
              <span className="grid size-7 place-items-center border border-white/20 bg-white/10 text-white text-[10px] font-mono">
                {user.email ? user.email.substring(0, 2).toUpperCase() : 'DR'}
              </span>
              <button
                onClick={() => signOut()}
                className="text-[11px] text-[#8a8a86] hover:text-rose-400 transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setLoginMessage('Sign in to sync your projects and dispatch GPU generation tasks.');
                setLoginModalOpen(true);
              }}
              className="border border-white/30 bg-white px-3 py-1 text-xs font-medium text-black hover:bg-zinc-200 transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* ── Sidebar ── */}
      <aside
        className={`${mobileNav ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-60 border-r border-white/[0.08] bg-[#09090b] px-3 pb-6 pt-20 transition-transform duration-200 md:block md:translate-x-0`}
      >
        <div className="mb-4 px-3 flex items-center justify-between">
          <span className="label-caps text-[#71717a]">Production Suite</span>
          <span className="text-[9px] font-mono text-amber-500/80">v1.2</span>
        </div>
        <nav className="flex flex-col gap-1">
          {navPrimary.map(({ id, label, icon: Icon, badge }: any) => (
            <NavItem
              key={id}
              active={activeNav === id}
              label={label}
              icon={Icon}
              badge={badge}
              onClick={() => go(id)}
            />
          ))}
        </nav>

        <div className="my-5 border-t border-white/[0.06]" />

        <div className="mb-3 px-3 label-caps text-[#71717a]">Management</div>
        <nav className="flex flex-col gap-1">
          {navSecondary.map(({ id, label, icon: Icon, badge }: any) => (
            <NavItem
              key={id}
              active={activeNav === id}
              label={label}
              icon={Icon}
              badge={badge}
              onClick={() => go(id)}
            />
          ))}
        </nav>

        {/* AI status footer */}
        <div className="absolute bottom-6 left-5 right-5 border border-white/[0.06] bg-[#0e0e11] p-3 text-left">
          <div className="flex items-center justify-between">
            <p className="label-caps text-amber-400">Veo 3.1 Director</p>
            <span className="size-1.5 rounded-full bg-emerald-400" />
          </div>
          <p className="mt-1.5 text-[11px] text-[#a1a1aa] leading-relaxed">
            Sequence continuity guard active.
          </p>
        </div>
      </aside>

      {/* ── Main content ── */}
      <section className="min-h-screen pt-14 md:ml-60">
        <div className="mx-auto max-w-[1440px] px-5 py-9 pb-24 md:px-10 md:py-12 md:pb-12 animate-fade-up">

          {screen === 'projects' && (
            <ProjectsView
              projects={projectsList}
              onSelectProject={(id: string) => { setActiveProjectId(id); go('canvas'); }}
              onCreateNew={() => go('story')}
              notify={notify}
            />
          )}

          {screen === 'canvas' && (
            <CanvasView
              project={currentProject}
              selectedIndex={selectedShotIndex}
              onSelectIndex={setSelectedShotIndex}
              onRegenerateShot={(shot: any) => setRegenShot(shot)}
              onRefreshShots={refreshProjectDetails}
              go={go}
              notify={notify}
            />
          )}

          {screen === 'characters' && (
            <CharactersView projectId={activeProjectId} notify={notify} />
          )}

          {screen === 'locations' && (
            <LocationsView projectId={activeProjectId} notify={notify} />
          )}

          {screen === 'templates' && <TemplatesView go={go} notify={notify} />}

          {screen === 'billing' && (
            <CreditManagementView
              onOpenTopUp={() => setPaystackOpen(true)}
              notify={notify}
            />
          )}

          {screen === 'developer' && <DeveloperConsoleView />}

          {screen === 'settings' && <SettingsView notify={notify} />}

          {screen === 'story' && (
            <StoryView
              user={user}
              onRequireLogin={() => {
                setLoginMessage('Sign in with Google to create and save your film project.');
                setLoginModalOpen(true);
              }}
              go={go}
              notify={notify}
              onProjectCreated={(id: string) => setActiveProjectId(id)}
            />
          )}

          {screen === 'storyboard' && (
            <StoryboardView project={currentProject} go={go} notify={notify} />
          )}

          {screen === 'render' && (
            <RenderView project={currentProject} go={go} notify={notify} />
          )}

          {screen === 'preview' && (
            <PreviewView
              project={currentProject}
              go={go}
              onPublish={() => setPublishProject(currentProject)}
            />
          )}
        </div>
      </section>

      {/* ── Modals ── */}
      <PaystackModal
        isOpen={paystackOpen}
        onClose={() => setPaystackOpen(false)}
        onSuccess={(added) => { setCredits((c) => c + added); notify(`Added ${added} Credits.`); }}
      />

      <ShotRegenerationDrawer
        isOpen={!!regenShot}
        shot={regenShot}
        onClose={() => setRegenShot(null)}
        onShotRegenerated={(_, taskId) => notify(`Shot queued (${taskId.substring(0, 8)}…)`)}
      />

      <PublishDrawer
        isOpen={!!publishProject}
        project={publishProject}
        onClose={() => setPublishProject(null)}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        message={loginMessage}
      />

      {/* Mobile nav overlay */}
      {mobileNav && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 border border-white/15 bg-[#181819] px-4 py-3 text-xs text-white animate-fade-up"
        >
          <Check className="size-3.5 text-[#c0c0bb]" />
          {toast}
        </div>
      )}
    </main>
  );
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function NavItem({ active, label, icon: Icon, badge, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-between px-3 py-2 text-left text-xs transition-colors rounded-sm ${
        active
          ? 'bg-white/[0.06] text-white font-medium'
          : 'text-[#8e8e93] hover:bg-white/[0.03] hover:text-[#d4d4d8]'
      }`}
    >
      <div className="flex items-center gap-3">
        {active && <span className="nav-active-stripe" />}
        <Icon className={`size-4 ${active ? 'text-amber-400' : 'text-zinc-500'}`} />
        <span>{label}</span>
      </div>
      {badge && (
        <span
          className={`text-[9px] font-mono px-1.5 py-0.5 rounded-sm border ${
            badge === 'Live' || badge === 'Sequence'
              ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
              : 'border-white/10 text-zinc-500'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function Eyebrow({ children }: any) {
  return <p className="mb-3 label-caps text-amber-500/90 font-mono tracking-widest">{children}</p>;
}

function PageHeader({ eyebrow, title, description, action, onAction }: any) {
  return (
    <header className="mb-12 flex flex-col justify-between gap-6 border-b border-white/[0.09] pb-8 md:flex-row md:items-end">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1
          className="max-w-3xl text-3xl font-light tracking-[-0.045em] text-white md:text-5xl"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#8e8e8a]">{description}</p>
        )}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="btn-amber flex-shrink-0"
        >
          {action}
          <ArrowRight className="size-3.5" />
        </button>
      )}
    </header>
  );
}

function SectionLabel({ children }: any) {
  return <p className="mb-4 label-caps text-zinc-400">{children}</p>;
}

function Metric({ value, label, accent }: any) {
  return (
    <div className="border border-white/[0.06] bg-[#0c0c0e] p-5">
      <p
        className={`text-2xl font-light tracking-[-0.03em] ${accent ? 'text-amber-400' : 'text-white'}`}
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        {value}
      </p>
      <p className="mt-2 label-caps text-[#71717a]">{label}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center border border-dashed border-white/10 bg-[#0a0a0c] text-sm text-[#71717a]">
      {label}
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <label className="mb-8 block">
      <span className="label-caps">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

// ─── Projects View ────────────────────────────────────────────────────────────

function ProjectsView({ projects, onSelectProject, onCreateNew, notify }: any) {
  const list = projects ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Film Projects"
        title={<>Make the impossible<br /><span className="text-amber-400">watchable.</span></>}
        description="A professional director workspace for long-form films with character continuity, camera control, and precision craft."
        action="New Project"
        onAction={onCreateNew}
      />

      {/* Metrics */}
      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        <Metric value={list.length || '0'} label="Active Productions" />
        <Metric value="18h 42m" label="Compute Rendered" />
        <Metric value="1,250 CR" label="Available Treasury" accent={true} />
      </div>

      <div className="mb-5 flex items-center justify-between">
        <SectionLabel>Recent Productions</SectionLabel>
        <button
          onClick={() => notify('Showing all productions')}
          className="text-xs text-amber-400/90 hover:text-amber-300 font-mono transition-colors"
        >
          View all productions →
        </button>
      </div>

      {list.length === 0 ? (
        <EmptyState label="No productions in studio. Create your first film project above." />
      ) : (
        <div className="grid gap-px border border-white/[0.08] bg-white/[0.08] md:grid-cols-2 lg:grid-cols-3">
          {list.map((proj: any, i: number) => {
            const isCompleted = proj.status === 'Completed';
            const isRendering = proj.status === 'Rendering';

            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id)}
                className="group relative flex flex-col justify-between bg-[#0b0b0e] text-left transition-all hover:bg-[#121216] cursor-pointer"
              >
                {/* Visual Thumbnail */}
                <div className="relative h-44 overflow-hidden bg-[#18181b] p-4">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0e] via-transparent to-transparent z-10" />
                  <div className="flex items-center justify-between relative z-20">
                    <span className="badge-amber text-[9px]">
                      {proj.visual_style || 'Realistic 35mm'}
                    </span>
                    <span className="font-mono text-[9px] bg-black/80 px-1.5 py-0.5 text-zinc-300 border border-white/10">
                      {proj.aspect_ratio || '16:9'}
                    </span>
                  </div>

                  <Film className="absolute bottom-4 right-4 size-8 text-white/10 group-hover:text-amber-400/30 transition-colors z-20" />
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-light text-white group-hover:text-amber-300 transition-colors">
                      {proj.title}
                    </h3>
                    <span className="font-mono text-[10px] text-zinc-500">
                      {proj.target_duration || '60s'}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-[#8e8e93] line-clamp-2 leading-relaxed">
                    {proj.premise || 'No logline entered.'}
                  </p>

                  <div className="mt-5 border-t border-white/[0.06] pt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-amber-400 transition-all duration-300"
                          style={{ width: `${proj.progress ?? 65}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-zinc-400">{proj.progress ?? 65}%</span>
                    </div>

                    <span className="text-[11px] text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Direct Film <ArrowRight className="size-3" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─── Director Canvas View ─────────────────────────────────────────────────────

function CanvasView({ project, selectedIndex, onSelectIndex, onRegenerateShot, onRefreshShots, go, notify }: any) {
  const shotList = project?.shots || [];
  const activeShot = shotList[selectedIndex] || shotList[0];

  const handleTriggerPipeline = async () => {
    if (!project?.id) {
      notify('No active project selected.');
      return;
    }
    try {
      const res = await api.triggerPipeline(project.id);
      if (res.success) {
        notify('Production pipeline triggered! Generating scene 1 shots...');
        if (onRefreshShots) onRefreshShots();
      } else {
        notify('Error: Failed to trigger pipeline');
      }
    } catch (err: any) {
      notify(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Stage 04 / Director Canvas"
        title={<>{project?.title ?? 'Production'}<br /><span className="text-amber-400">in sequence.</span></>}
        description="Direct every camera move, continuous extension, and prompt parameter. Live pipeline connected to Veo 3.1 engine."
        action="Trigger Pipeline"
        onAction={handleTriggerPipeline}
      />

      {shotList.length === 0 && (
        <div className="border border-amber-500/30 bg-amber-500/10 p-6 text-center text-amber-300 text-xs font-mono space-y-3">
          <p>No shots planned for this project yet.</p>
          <button
            onClick={() => go('story')}
            className="btn-amber px-4 py-2 text-xs font-medium inline-block"
          >
            Go to Story & Generate Script / Storyboard
          </button>
        </div>
      )}

      {/* ── Cinematic Filmstrip Timeline Sequence Track ── */}
      <ShotSequenceTimeline
        projectId={project?.id || 'current'}
        shots={shotList}
        selectedIndex={selectedIndex}
        onSelectShot={onSelectIndex}
        onRefreshShots={onRefreshShots || (() => notify('Sequence refreshed'))}
        notify={notify}
      />

      {/* ── Main Canvas Grid (Multi-track audio/video + Shot Inspector) ── */}
      <div className="grid border border-white/[0.08] xl:grid-cols-[1fr_320px] bg-[#0c0c0e]">
        <div className="min-w-0">
          {/* Multi-Track Scrubbing Timeline */}
          <CanvasTimeline />
        </div>

        {/* Shot Inspector with Diagnostics and Retry */}
        <ShotInspector
          shot={activeShot}
          index={selectedIndex}
          projectId={project?.id || 'current'}
          onRegenerate={() => onRegenerateShot(activeShot)}
          onRefreshShots={onRefreshShots}
          notify={notify}
        />
      </div>
    </div>
  );
}

function CanvasTimeline() {
  const tracks = [
    { name: 'VIDEO', desc: 'Veo 3.1 Lite Stream', color: 'bg-amber-500/80' },
    { name: 'DIALOGUE', desc: 'Trained Voice Clones', color: 'bg-zinc-500' },
    { name: 'SFX', desc: 'Spatial Audio Foley', color: 'bg-zinc-600' },
    { name: 'SCORE', desc: 'Cinematic Dynamic Stems', color: 'bg-zinc-700' },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-5 flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-2">
          <SectionLabel>Multi-Track Master Timeline</SectionLabel>
          <span className="badge-amber text-[9px]">4K 24FPS</span>
        </div>
        <span className="font-mono text-xs text-amber-400">TC 00:00:24:12</span>
      </div>

      <div className="relative flex flex-col gap-3.5">
        {/* Playhead Indicator with warm amber beam */}
        <div className="absolute bottom-0 left-[42%] top-0 w-px bg-amber-400 z-10 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />

        {tracks.map((track) => (
          <div key={track.name} className="flex items-center gap-4">
            <div className="w-20">
              <span className="font-mono text-[10px] tracking-widest text-[#a1a1aa]">{track.name}</span>
            </div>
            <div className="relative flex h-8 flex-1 gap-1 border border-white/[0.06] bg-[#111114] p-1">
              {[0, 1, 2, 3, 4, 5].map((x) => (
                <div
                  key={x}
                  className={`h-full flex-1 transition-opacity ${
                    x <= 2 ? track.color : 'bg-white/[0.04]'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShotInspector({ shot, index, projectId, onRegenerate, onRefreshShots, notify }: any) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!shot) return;
    setRetrying(true);
    console.info(`[ShotInspector] Retrying shot ${shot.id}`);
    try {
      const res = await api.retryShot({
        projectId: shot.project_id || projectId,
        shotId: shot.id,
        prompt: shot.intent || `Shot ${index + 1}`,
        model: 'veo-3.1-lite',
      });
      if (res.success) {
        notify('Shot generation re-queued (+4 CR auto-refund verified)');
        if (onRefreshShots) onRefreshShots();
      }
    } catch (err: any) {
      console.error('[ShotInspector] Retry failed:', err);
      notify(`Retry error: ${err.message}`);
    } finally {
      setRetrying(false);
    }
  };

  const isFailed = shot?.status === 'Failed';
  const isRendering = shot?.status === 'Rendering';
  const isCompleted = shot?.status === 'Completed';

  return (
    <aside className="border-t border-white/[0.08] xl:border-l xl:border-t-0 bg-[#0e0e11]">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
        <span className="font-display text-xs tracking-tight text-white">Shot Inspector</span>
        <SlidersHorizontal className="size-3.5 text-amber-400" />
      </div>

      <div className="p-5 space-y-5">
        {shot ? (
          <>
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber-400">
                  0{shot.scene_number || 1}.{String(shot.shot_number || index + 1).padStart(2, '0')}
                </span>
                <span className="badge-amber text-[9px]">{shot.flow_type || 'CUT'}</span>
              </div>
              <h3 className="mt-2 text-base font-light text-white leading-snug">
                {shot.intent || shot.dialogue_text || `Shot ${index + 1} Visual Composition`}
              </h3>
            </div>

            {/* Diagnostic Alert if Failed */}
            {isFailed && (
              <div className="rounded border border-rose-500/30 bg-rose-950/20 p-3 text-left">
                <div className="flex items-center gap-1.5 text-xs font-medium text-rose-300">
                  <AlertTriangle className="size-4 text-rose-400" />
                  Render Failure Detected
                </div>
                <p className="mt-1 text-[11px] text-zinc-300 leading-relaxed">
                  {shot.error_message || 'Model capacity retry exceeded on GPU node.'}
                </p>
                <div className="mt-2.5 flex items-center justify-between border-t border-rose-500/20 pt-2">
                  <span className="font-mono text-[10px] text-amber-300">+4 CR Auto-Refunded</span>
                  <button
                    onClick={handleRetry}
                    disabled={retrying}
                    className="flex items-center gap-1 rounded bg-amber-500 px-2.5 py-1 text-[10px] font-medium text-black hover:bg-amber-400 disabled:opacity-50"
                  >
                    <RefreshCw className={`size-3 ${retrying ? 'animate-spin' : ''}`} />
                    {retrying ? 'Retrying…' : 'Retry Shot'}
                  </button>
                </div>
              </div>
            )}

            {/* Parameters Matrix */}
            <div className="divide-y divide-white/[0.06] border-y border-white/[0.06] text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-[#8e8e93]">Status</span>
                <span className={`font-mono text-[11px] ${
                  isCompleted ? 'text-emerald-400' : isRendering ? 'text-amber-400' : isFailed ? 'text-rose-400' : 'text-zinc-400'
                }`}>
                  {shot.status || 'Draft'}
                </span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#8e8e93]">Duration</span>
                <span className="font-mono text-[11px] text-zinc-200">00:0{shot.estimated_duration_sec || 8}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#8e8e93]">Camera Framing</span>
                <span className="text-zinc-200">Cinematic 35mm Wide</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-[#8e8e93]">Model Engine</span>
                <span className="font-mono text-[11px] text-amber-400">Veo 3.1 Lite</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2.5">
              <button
                onClick={onRegenerate}
                className="btn-amber w-full justify-between"
              >
                <span>Re-roll Shot Parameters</span>
                <RefreshCw className="size-3.5" />
              </button>

              <button
                onClick={() => notify('Shot locked into final cut sequence')}
                className="w-full border border-white/20 py-2 text-xs text-white hover:bg-white hover:text-black transition-colors"
              >
                Lock Shot Continuity
              </button>
            </div>
          </>
        ) : (
          <p className="text-xs text-zinc-500">Select a shot along the sequence track to inspect.</p>
        )}
      </div>
    </aside>
  );
}

// ─── Characters View ──────────────────────────────────────────────────────────

function CharactersView({ projectId, notify }: any) {
  const [chars, setChars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    api.getProjectDetails(projectId)
      .then((r) => { if (r.success) setChars(r.data?.characters ?? []); })
      .catch((e) => console.error('[characters] load error:', e))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <>
      <PageHeader
        eyebrow="Creative library"
        title="Characters"
        description="Performance references for every scene. Each character references a consistent visual DNA."
        action="Add character"
        onAction={() => notify('Character creation opened')}
      />

      <div className="mb-8 flex items-center gap-3 border-b border-white/[0.09] pb-4">
        <Search className="size-4 text-[#6f6f6b]" />
        <input
          className="w-full bg-transparent text-sm text-[#f1f1ef] outline-none placeholder:text-[#555552]"
          placeholder="Search characters…"
        />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-xs text-[#555552]">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading characters…
        </div>
      ) : chars.length === 0 ? (
        <div className="border border-white/10 bg-[#0c0c0e] p-8 text-center text-zinc-400 text-xs">
          No characters defined yet. Generate a script/storyboard to extract character DNA.
        </div>
      ) : (
        <div className="grid gap-px border border-white/[0.09] bg-white/[0.09] sm:grid-cols-2 lg:grid-cols-4">
          {chars.map((char: any, i: number) => (
            <button
              key={char.id ?? char.name ?? i}
              onClick={() => notify(`${char.name} opened`)}
              className="bg-[#0b0b0c] text-left hover:bg-[#151516] transition-colors"
            >
              <div
                className={`h-44 grayscale ${['bg-[#555755]','bg-[#484e4e]','bg-[#605751]','bg-[#484f4d]'][i % 4]}`}
              />
              <div className="p-4">
                <p className="text-sm text-[#e5e5e1]">{char.name}</p>
                <p className="mt-2 text-[10px] text-[#6f6f6b]">References defined · Updated today</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Locations View ───────────────────────────────────────────────────────────

function LocationsView({ projectId, notify }: any) {
  const [locs, setLocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    api.getProjectDetails(projectId)
      .then((r) => { if (r.success) setLocs(r.data?.locations ?? []); })
      .catch((e) => console.error('[locations] load error:', e))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <>
      <PageHeader
        eyebrow="Creative library"
        title="Locations"
        description="Worlds, light, and continuity references."
        action="Add location"
        onAction={() => notify('Location creation opened')}
      />

      <div className="mb-8 flex items-center gap-3 border-b border-white/[0.09] pb-4">
        <Search className="size-4 text-[#6f6f6b]" />
        <input
          className="w-full bg-transparent text-sm text-[#f1f1ef] outline-none placeholder:text-[#555552]"
          placeholder="Search locations…"
        />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center text-xs text-[#555552]">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading locations…
        </div>
      ) : locs.length === 0 ? (
        <div className="border border-white/10 bg-[#0c0c0e] p-8 text-center text-zinc-400 text-xs">
          No locations defined yet. Generate a script/storyboard to extract location references.
        </div>
      ) : (
        <div className="grid gap-px border border-white/[0.09] bg-white/[0.09] sm:grid-cols-2 lg:grid-cols-4">
          {locs.map((loc: any, i: number) => (
            <button
              key={loc.id ?? loc.name ?? i}
              onClick={() => notify(`${loc.name} opened`)}
              className="bg-[#0b0b0c] text-left hover:bg-[#151516] transition-colors"
            >
              <div className="h-44 grayscale bg-[#484e4e]" />
              <div className="p-4">
                <p className="text-sm text-[#e5e5e1]">{loc.name}</p>
                <p className="mt-2 text-[10px] text-[#6f6f6b]">Ambient phrases defined · Updated today</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Templates View ───────────────────────────────────────────────────────────

const TEMPLATE_ITEMS = [
  'Cinematic short film',
  'Documentary essay',
  'Product launch film',
  'Music video',
  'Narrative series pilot',
  'Visual poem',
];

const TEMPLATE_BKGS = [
  'bg-[#414143]', 'bg-[#514e4a]', 'bg-[#41484a]',
  'bg-[#4b454a]', 'bg-[#414844]', 'bg-[#45494e]',
];

function TemplatesView({ go, notify }: any) {
  return (
    <>
      <PageHeader
        eyebrow="Creative library"
        title="Templates"
        description="A considered starting point for the next production."
      />
      <div className="grid gap-px border border-white/[0.09] bg-white/[0.09] md:grid-cols-2 lg:grid-cols-3">
        {TEMPLATE_ITEMS.map((tmpl, i) => (
          <button
            key={tmpl}
            onClick={() => go('story')}
            className="bg-[#0b0b0c] text-left hover:bg-[#151516] transition-colors"
          >
            <div className={`h-32 ${TEMPLATE_BKGS[i]} p-4`}>
              <span className="label-caps text-white/60">Template 0{i + 1}</span>
            </div>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-[#e5e5e1]">{tmpl}</p>
                <p className="mt-2 text-[10px] text-[#6f6f6b]">12 scene beats · 8 min average</p>
              </div>
              <ArrowRight className="size-4 text-[#aaa7b4]" />
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Settings View ────────────────────────────────────────────────────────────

function SettingsView({ notify }: any) {
  const fields = [
    ['Workspace name',   'Primus Studio'],
    ['Default delivery', '4K · 24fps'],
    ['Continuity model', 'Strict'],
  ];

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Project defaults and production preferences."
        action="Save changes"
        onAction={() => notify('Settings saved')}
      />

      <div className="max-w-2xl">
        {fields.map(([label, value]) => (
          <label key={label} className="block border-b border-white/[0.09] py-5">
            <span className="label-caps">{label}</span>
            <input
              defaultValue={value}
              className="mt-3 block w-full bg-transparent text-sm text-[#f1f1ef] outline-none"
            />
          </label>
        ))}

        <div className="flex items-center justify-between border-b border-white/[0.09] py-5">
          <div>
            <p className="text-sm text-[#e5e5e1]">Director checkpoints</p>
            <p className="mt-1 text-xs text-[#777773]">Pause before expensive render steps.</p>
          </div>
          <span className="size-5 border border-[#aaa0bf] bg-[#aaa0bf]" />
        </div>
      </div>
    </>
  );
}

// ─── Story / New Project View ─────────────────────────────────────────────────

function StoryView({ user, onRequireLogin, go, notify, onProjectCreated }: any) {
  const [title,   setTitle]           = useState('Cyberpunk Heist');
  const [premise, setPremise]         = useState('A courier steals a memory from the city that built her.');
  const [estimatedMinutes, setEstimatedMinutes] = useState('5');
  const [videoStyle, setVideoStyle]     = useState('realistic');
  const [aspectRatio, setAspectRatio]   = useState('16:9');
  
  const [step, setStep]               = useState<'form' | 'review'>('form');
  const [projectId, setProjectId]     = useState<string | null>(null);
  const [scriptData, setScriptData]   = useState<any>(null);
  const [editableScript, setEditableScript] = useState('');
  const [adjustmentPrompt, setAdjustmentPrompt] = useState('');
  const [loading, setLoading]         = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const handleGenerateScript = async () => {
    if (!user) {
      onRequireLogin();
      return;
    }

    setLoading(true);
    setLoadingMessage('Creating project & generating script & story bible...');
    try {
      const projRes = await api.createProject({
        title,
        premise,
        visual_style: videoStyle,
        aspect_ratio: aspectRatio,
        estimated_duration: parseInt(estimatedMinutes) * 60,
        ai_video_model: 'veo-3.1-lite',
      });
      if (!projRes.success || !projRes.data) {
        throw new Error('Failed to create project');
      }
      const pId = projRes.data.id;
      setProjectId(pId);
      onProjectCreated(pId);

      const scriptRes = await api.generateScript({
        premise,
        useCase: premise,
        duration: parseInt(estimatedMinutes) * 60,
        visualStyle: videoStyle,
      });
      if (!scriptRes.success || !scriptRes.data) {
        throw new Error('Failed to generate script');
      }
      setScriptData(scriptRes.data);
      setEditableScript(scriptRes.data.script);
      setStep('review');
      notify('Script generated successfully!');
    } catch (err: any) {
      console.error('[story] error:', err);
      notify(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustScript = async () => {
    if (!adjustmentPrompt.trim()) return;
    setLoading(true);
    setLoadingMessage('Adjusting script with AI director...');
    try {
      const res = await api.generateScript({
        premise: `${premise}. User requested adjustment: ${adjustmentPrompt}`,
        useCase: premise,
        duration: parseInt(estimatedMinutes) * 60,
        visualStyle: videoStyle,
      });
      if (res.success && res.data) {
        setScriptData(res.data);
        setEditableScript(res.data.script);
        setAdjustmentPrompt('');
        notify('Script updated based on your feedback.');
      }
    } catch (err: any) {
      notify(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndGenerateStoryboard = async () => {
    if (!projectId) return;
    setLoading(true);
    setLoadingMessage('Saving script, extracting characters/locations, and planning storyboard shots scene by scene...');
    try {
      await api.updateProject(projectId, {
        script: editableScript,
        status: 'ScriptApproved',
      });

      if (scriptData?.characters && Array.isArray(scriptData.characters)) {
        for (const char of scriptData.characters) {
          await api.registerCharacterDna(projectId, {
            name: char.name,
            description: char.description,
            dna_prompt: char.dna_prompt || char.description,
            face_reference_url: char.reference_url,
          });
        }
      }

      if (scriptData?.locations && Array.isArray(scriptData.locations)) {
        for (const loc of scriptData.locations) {
          await api.registerLocationDna(projectId, {
            name: loc.name,
            description: loc.description,
            dna_prompt: loc.dna_prompt || loc.description,
            reference_url: loc.reference_url,
          });
        }
      }

      const sbRes = await api.generateStoryboard({
        script: editableScript,
        visualStyle: videoStyle,
        aiVideoModel: 'veo-3.1-lite',
        targetDurationSec: parseInt(estimatedMinutes) * 60,
      });

      if (!sbRes.success || !sbRes.data || !sbRes.data.shots) {
        throw new Error('Failed to generate storyboard shots');
      }

      await api.addShots(projectId, sbRes.data.shots);

      notify('Storyboard planned scene by scene! Entering Director Canvas...');
      go('canvas');
    } catch (err: any) {
      console.error('[story] approval error:', err);
      notify(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'review') {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <PageHeader
          eyebrow="Stage 02 / Script Review & Approval"
          title="Review, edit, or adjust your film script."
          description="Read the generated script, make manual edits, re-prompt for specific adjustments, or approve to start shot-by-shot storyboard planning."
        />

        {loading && (
          <div className="flex items-center gap-3 p-4 border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono">
            <Loader2 className="size-4 animate-spin" />
            {loadingMessage}
          </div>
        )}

        {scriptData?.reasoning && (
          <div className="border border-white/10 bg-[#0c0c0e] p-5">
            <p className="text-xs uppercase tracking-widest text-amber-400 font-mono mb-2">🧠 AI Story Planner & Structure</p>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{scriptData.reasoning}</p>
          </div>
        )}

        <div className="border border-white/15 bg-[#0c0c0e] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-amber-400 uppercase tracking-widest">Full Production Script (Editable)</label>
            <span className="text-[10px] text-zinc-500 font-mono">Manual edits persist on approval</span>
          </div>
          <textarea
            value={editableScript}
            onChange={(e) => setEditableScript(e.target.value)}
            className="w-full h-96 bg-[#060607] border border-white/10 p-4 text-xs font-mono text-zinc-200 leading-relaxed outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        <div className="border border-white/10 bg-[#0c0c0e] p-5 space-y-3">
          <label className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Want to adjust pacing or stakes? Re-prompt:</label>
          <div className="flex gap-3">
            <input
              value={adjustmentPrompt}
              onChange={(e) => setAdjustmentPrompt(e.target.value)}
              placeholder="e.g., Make the climax more intense, add a twist..."
              className="flex-1 bg-transparent border border-white/15 px-4 py-2.5 text-xs text-white outline-none focus:border-amber-400"
            />
            <button
              onClick={handleAdjustScript}
              disabled={loading || !adjustmentPrompt.trim()}
              className="btn-amber px-4 py-2.5 text-xs font-medium disabled:opacity-50"
            >
              Adjust Script
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-white/10 bg-[#0c0c0e] p-5">
            <p className="text-xs uppercase tracking-widest text-amber-400 font-mono mb-3">Extracted Characters ({scriptData?.characters?.length || 0})</p>
            <div className="space-y-2">
              {scriptData?.characters?.map((c: any, i: number) => (
                <div key={i} className="text-xs border-b border-white/5 pb-2">
                  <span className="text-white font-medium">{c.name}</span>: <span className="text-zinc-400">{c.description}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-white/10 bg-[#0c0c0e] p-5">
            <p className="text-xs uppercase tracking-widest text-amber-400 font-mono mb-3">Extracted Locations ({scriptData?.locations?.length || 0})</p>
            <div className="space-y-2">
              {scriptData?.locations?.map((l: any, i: number) => (
                <div key={i} className="text-xs border-b border-white/5 pb-2">
                  <span className="text-white font-medium">{l.name}</span>: <span className="text-zinc-400">{l.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={() => setStep('form')}
            className="border border-white/20 px-5 py-3 text-xs text-zinc-300 hover:border-white/50"
          >
            Back to Pitch
          </button>
          <button
            onClick={handleApproveAndGenerateStoryboard}
            disabled={loading}
            className="btn-amber flex items-center gap-2 px-6 py-3 text-xs font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Approve Script & Plan Storyboard (Shots)
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Stage 01 / Pitch Intake"
        title={<>Give the film<br /><span className="text-amber-400">a north star.</span></>}
        description="Start with the core conflict, tone, and character arc. Build an auditable story bible from a precise prompt seed."
        action="Save Story Seed"
        onAction={() => notify('Story seed draft saved')}
      />

      {loading && (
        <div className="flex items-center gap-3 p-4 mb-4 border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono">
          <Loader2 className="size-4 animate-spin" />
          {loadingMessage}
        </div>
      )}

      <div className="max-w-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 md:p-8">
        <Field label="Working title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-b border-white/15 bg-transparent py-3 text-sm text-[#f1f1ef] outline-none focus:border-amber-400 transition-colors"
          />
        </Field>

        <Field label="One-line premise / logline">
          <textarea
            value={premise}
            onChange={(e) => setPremise(e.target.value)}
            className="min-h-32 w-full resize-none border-b border-white/15 bg-transparent py-3 text-sm leading-6 text-[#f1f1ef] outline-none focus:border-amber-400 transition-colors"
          />
        </Field>

        <Field label="Target duration">
          <div className="flex gap-2.5">
            {['1', '5', '10'].map((min) => (
              <button
                key={min}
                onClick={() => setEstimatedMinutes(min)}
                className={`px-3.5 py-2 text-xs border font-mono transition-all ${
                  estimatedMinutes === min
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'border-white/15 text-zinc-400 hover:border-white/40'
                }`}
              >
                {min} min
              </button>
            ))}
          </div>
        </Field>

        <Field label="Cinematic visual style">
          <div className="flex gap-2.5">
            {['realistic', '2d', '3d'].map((style) => (
              <button
                key={style}
                onClick={() => setVideoStyle(style)}
                className={`px-3.5 py-2 text-xs border uppercase tracking-wider font-mono transition-all ${
                  videoStyle === style
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'border-white/15 text-zinc-400 hover:border-white/40'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Aspect ratio">
          <div className="flex gap-2.5">
            {['9:16', '16:9'].map((ratio) => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`px-3.5 py-2 text-xs border font-mono transition-all ${
                  aspectRatio === ratio
                    ? 'border-amber-500 bg-amber-500/15 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'border-white/15 text-zinc-400 hover:border-white/40'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </Field>

        <button
          onClick={handleGenerateScript}
          disabled={loading}
          className="mt-6 flex items-center gap-2 btn-amber w-full justify-center py-3 text-xs font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
          {loading ? loadingMessage : 'Build Story Bible & Generate Script'}
          {!loading && <ArrowRight className="size-3.5" />}
        </button>
      </div>
    </>
  );
}

// ─── Storyboard View ──────────────────────────────────────────────────────────

function StoryboardView({ project, go, notify }: any) {
  return (
    <>
      <PageHeader
        eyebrow="Stage 05 / Storyboard"
        title={<>See the rhythm<br /><span className="text-amber-400">before the render.</span></>}
        description="Review pacing, camera angles, and visual continuity as an interactive sequence of keyframes."
        action="Render Animatic"
        onAction={() => go('render')}
      />

      <div className="border border-white/[0.08] bg-[#0c0c0e] p-6 md:p-8">
        <div className="mb-8 flex justify-between items-center border-b border-white/[0.06] pb-4">
          <div>
            <p className="text-sm font-medium text-white">{project?.title ?? 'Cyberpunk Heist'} · Animatic Pass 01</p>
            <p className="mt-1 text-xs text-[#8e8e93]">8 scenes breakdown · 01:04 total runtime</p>
          </div>
          <button
            onClick={() => notify('Storyboard exported to PDF')}
            className="flex items-center gap-2 border border-white/15 px-3 py-1.5 text-xs text-zinc-300 hover:border-white hover:text-white transition-colors"
          >
            <Download className="size-3.5" /> Export Bible
          </button>
        </div>

        <div className="grid gap-px border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-[#111114] group">
              <div className="h-28 bg-[#18181b] p-3 relative overflow-hidden">
                <span className="font-mono text-[10px] text-amber-400 font-medium">0{i + 1}</span>
                <Film className="absolute bottom-2 right-2 size-4 text-white/10 group-hover:text-amber-400/40 transition-colors" />
              </div>
              <div className="p-3.5">
                <p className="text-xs text-zinc-200">
                  {['Wide establishing cityscape', 'Ada enters the balcony', 'The memory handoff', 'Subterranean chase'][i % 4]}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>00:08</span>
                  <span className="text-emerald-400">Audio Ready</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => go('render')}
          className="mt-8 btn-amber"
        >
          Continue to Quote & Render
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </>
  );
}

// ─── Render View ──────────────────────────────────────────────────────────────

function RenderView({ project, go, notify }: any) {
  return (
    <>
      <PageHeader
        eyebrow="Stage 06 / Quote & Render"
        title={<>Choose<br /><span className="text-amber-400">the finish.</span></>}
        description="Audit compute quota, verify continuous frame extensions, and submit to render cluster."
      />

      <div className="max-w-2xl border border-white/[0.08] bg-[#0c0c0e] p-6 md:p-8">
        <div className="flex justify-between items-center border-b border-white/[0.08] pb-6">
          <div>
            <p className="text-sm font-medium text-white">Final Cut Production Estimate</p>
            <p className="mt-1.5 text-xs text-[#8e8e93]">
              {project?.title ?? 'Cyberpunk Heist'} · 01:04 Runtime · Veo 3.1 4K Master
            </p>
          </div>
          <div className="text-right">
            <span
              className="text-3xl font-light text-white"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              320
            </span>
            <span className="font-mono text-xs text-amber-400 ml-1">CR</span>
          </div>
        </div>

        {[
          ['Total Render Frames', '1,536 Frames'],
          ['Target Resolution', '3840 × 2160 (4K UHD)'],
          ['Audio Stem Master', 'Stereo + Atmos Stems'],
          ['Continuity Model', 'Strict Agent Vector Lock'],
        ].map(([x, y]) => (
          <div key={x} className="flex justify-between border-b border-white/[0.06] py-3.5 text-xs">
            <span className="text-zinc-400">{x}</span>
            <span className="text-white font-mono">{y}</span>
          </div>
        ))}

        <button
          onClick={() => { notify('Full production render dispatched to cluster'); go('preview'); }}
          className="mt-8 btn-amber w-full justify-center py-3 text-xs font-medium"
        >
          Queue Master Production Render
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </>
  );
}

// ─── Preview View ─────────────────────────────────────────────────────────────

function PreviewView({ project, go, onPublish }: any) {
  return (
    <>
      <PageHeader
        eyebrow="Review / Final Cut"
        title={project?.title ?? 'Cyberpunk Heist'}
        description="Final master render · 01:04 duration · 4K 24fps delivery"
        action="Back to Canvas"
        onAction={() => go('canvas')}
      />

      {/* Video player */}
      <div className="relative flex aspect-video max-w-4xl items-center justify-center overflow-hidden border border-white/[0.08] bg-[#121215]">
        <button className="grid size-16 place-items-center rounded-full border border-white/20 bg-black/60 text-white hover:border-amber-400 hover:text-amber-400 transition-all">
          <Play className="size-8 fill-current ml-1" />
        </button>
        {/* Playback Scrubber with warm amber progress */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div className="h-full w-[38%] bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
        </div>
      </div>

      <div className="mt-5 flex max-w-4xl items-center justify-between text-xs text-[#8e8e93]">
        <span className="font-mono text-amber-400">00:24 / 01:04</span>
        <div className="flex gap-4 items-center">
          <Pause className="size-4 cursor-pointer hover:text-white transition-colors" />
          <Download className="size-4 cursor-pointer hover:text-white transition-colors" />
          <button
            onClick={onPublish}
            className="btn-amber"
          >
            <Share2 className="size-3.5" />
            Publish Film
          </button>
        </div>
      </div>
    </>
  );
}
