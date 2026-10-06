'use client';

import { useState, useEffect } from 'react';
import {
  ArrowRight, Bell, Check, ChevronDown, Download,
  Film, FolderOpen, Gauge, Layers3, MapPin, Menu, MoreHorizontal, Pause, Play,
  Plus, RefreshCw, Search, Settings2, Share2, SlidersHorizontal, UserRound,
  Wand2, X, Code, Aperture, Clock3, Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { PaystackModal } from '@/components/modals/PaystackModal';
import { ShotRegenerationDrawer } from '@/components/modals/ShotRegenerationDrawer';
import { PublishDrawer } from '@/components/modals/PublishDrawer';
import { DeveloperConsoleView } from '@/components/views/DeveloperConsoleView';

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | 'projects' | 'canvas' | 'characters' | 'locations'
  | 'templates' | 'billing' | 'settings' | 'story'
  | 'storyboard' | 'render' | 'preview' | 'developer';

// ─── Navigation config ────────────────────────────────────────────────────────

const navPrimary = [
  { id: 'projects'   as Screen, label: 'Projects',       icon: FolderOpen },
  { id: 'canvas'     as Screen, label: 'Director Canvas', icon: Film       },
  { id: 'characters' as Screen, label: 'Characters',     icon: UserRound  },
  { id: 'locations'  as Screen, label: 'Locations',      icon: MapPin     },
  { id: 'templates'  as Screen, label: 'Templates',      icon: Layers3    },
];

const navSecondary = [
  { id: 'billing'   as Screen, label: 'Credits & Billing',  icon: Gauge    },
  { id: 'developer' as Screen, label: 'API & Webhooks',     icon: Code     },
  { id: 'settings'  as Screen, label: 'Settings',           icon: Settings2 },
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

  const notify = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };
  const go = (next: Screen)   => { setScreen(next); setMobileNav(false); };

  // ── Fetch projects on load
  useEffect(() => {
    api.getProjects()
      .then((res) => { if (res.success && res.data) setProjectsList(res.data); })
      .catch((err) => console.error('[projects] fetch failed:', err.message));
  }, []);

  // ── Fetch active project details
  useEffect(() => {
    if (!activeProjectId) return;
    api.getProjectDetails(activeProjectId)
      .then((res) => { if (res.success && res.data) setCurrentProject(res.data); })
      .catch((err) => console.warn('[project-details] fetch failed:', err.message));
  }, [activeProjectId]);

  const activeNav = [...navPrimary, ...navSecondary].find((n) => n.id === screen)?.id ?? 'projects';

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-[#f1f1ef]">

      {/* ── Top header ── */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.09] bg-[#0b0b0c] px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNav(!mobileNav)}
            className="text-[#a5a5a2] md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>

          {/* Brand */}
          <button onClick={() => go('projects')} className="flex items-center gap-2.5">
            <span className="grid size-6 place-items-center border border-white/40">
              <Aperture className="size-3.5" />
            </span>
            <span className="text-[13px] tracking-[-0.01em]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Primus <span className="text-[#8d8d8a]">Director</span>
            </span>
          </button>

          <span className="hidden h-4 w-px bg-white/15 sm:block" />

          {/* Active project breadcrumb */}
          <button
            onClick={() => go('canvas')}
            className="hidden items-center gap-2 text-xs text-[#b5b5b1] sm:flex"
          >
            {currentProject?.title ?? 'No project'}
            <ChevronDown className="size-3 text-[#777773]" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#a5a5a2]">
          <button
            onClick={() => notify('Checkpoint saved')}
            className="hidden items-center gap-2 lg:flex"
          >
            <span className="size-1.5 bg-[#c0c0bb]" />
            Checkpoint
          </button>

          <button
            onClick={() => setPaystackOpen(true)}
            className="font-mono text-[#c7c7c2] hover:text-white transition-colors"
          >
            {credits.toLocaleString()} <span className="text-[#777773]">CR</span>
          </button>

          <Bell className="hidden size-4 md:block cursor-pointer hover:text-white transition-colors" />
          <button className="grid size-7 place-items-center border border-white/20 text-[10px] hover:bg-white hover:text-black transition-all">
            JD
          </button>
        </div>
      </header>

      {/* ── Sidebar ── */}
      <aside
        className={`${mobileNav ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-60 border-r border-white/[0.09] bg-[#0b0b0c] px-3 pb-6 pt-20 transition-transform duration-200 md:block md:translate-x-0`}
      >
        <div className="mb-6 px-3 label-caps">Workspace</div>
        <nav className="flex flex-col gap-0.5">
          {navPrimary.map(({ id, label, icon: Icon }) => (
            <NavItem key={id} active={activeNav === id} label={label} icon={Icon} onClick={() => go(id)} />
          ))}
        </nav>

        <div className="my-6 border-t border-white/[0.08]" />

        <nav className="flex flex-col gap-0.5">
          {navSecondary.map(({ id, label, icon: Icon }) => (
            <NavItem key={id} active={activeNav === id} label={label} icon={Icon} onClick={() => go(id)} />
          ))}
        </nav>

        {/* AI status footer */}
        <div className="absolute bottom-6 left-6 right-6 border-t border-white/[0.08] pt-4">
          <p className="label-caps" style={{ color: '#6f6f6b' }}>Director AI</p>
          <p className="mt-2 text-xs text-[#a5a5a2]">Continuity pass complete.</p>
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
            <BillingView credits={credits} onTopUp={() => setPaystackOpen(true)} />
          )}

          {screen === 'developer' && <DeveloperConsoleView />}

          {screen === 'settings' && <SettingsView notify={notify} />}

          {screen === 'story' && (
            <StoryView
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

function NavItem({ active, label, icon: Icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors ${
        active ? 'text-white' : 'text-[#858582] hover:text-[#d1d1cc]'
      }`}
    >
      {active && <span className="nav-active-stripe" />}
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function Eyebrow({ children }: any) {
  return <p className="mb-3 label-caps" style={{ color: '#827f87' }}>{children}</p>;
}

function PageHeader({ eyebrow, title, description, action, onAction }: any) {
  return (
    <header className="mb-12 flex flex-col justify-between gap-6 border-b border-white/[0.09] pb-8 md:flex-row md:items-end">
      <div>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1
          className="max-w-3xl text-3xl font-light tracking-[-0.045em] md:text-5xl"
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
          className="btn-primary flex-shrink-0"
        >
          {action}
          <ArrowRight className="size-3.5" />
        </button>
      )}
    </header>
  );
}

function SectionLabel({ children }: any) {
  return <p className="mb-4 label-caps">{children}</p>;
}

function Metric({ value, label }: any) {
  return (
    <div>
      <p
        className="text-2xl font-light tracking-[-0.03em]"
        style={{ fontFamily: 'DM Sans, sans-serif' }}
      >
        {value}
      </p>
      <p className="mt-2 label-caps" style={{ color: '#6f6f6b' }}>{label}</p>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-64 items-center justify-center border border-white/[0.09] text-sm text-[#555552]">
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

  const statusColors: Record<number, string> = {
    0: 'bg-[#39383b]',
    1: 'bg-[#303330]',
    2: 'bg-[#35373a]',
  };

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title={<>Make the impossible<br /><span className="text-[#aaa7b4]">watchable.</span></>}
        description="A production workspace for long-form films with continuity, control, and craft."
        action="New project"
        onAction={onCreateNew}
      />

      {/* Metrics */}
      <div className="mb-14 grid gap-8 border-b border-white/[0.09] pb-10 sm:grid-cols-3">
        <Metric value={list.length || '0'} label="Active projects" />
        <Metric value="18h 42m" label="Rendered this month" />
        <Metric value="1,250" label="Credits remaining" />
      </div>

      <div className="mb-5 flex items-center justify-between">
        <SectionLabel>Recent projects</SectionLabel>
        <button onClick={() => notify('Showing all projects')} className="text-xs text-[#aaa7b4] hover:text-white transition-colors">
          View all
        </button>
      </div>

      {list.length === 0 ? (
        <EmptyState label="No projects yet. Create your first one above." />
      ) : (
        <div className="grid gap-px border border-white/[0.09] bg-white/[0.09] lg:grid-cols-3">
          {list.map((proj: any, i: number) => (
            <button
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className="bg-[#0b0b0c] text-left transition-colors hover:bg-[#151516]"
            >
              <div className={`h-44 ${statusColors[i % 3] ?? 'bg-[#2a2a2c]'} relative overflow-hidden p-4 grayscale`}>
                <span className="label-caps text-white/60">
                  {i === 0 ? 'In production' : i === list.length - 1 ? 'Rendering' : 'Draft'}
                </span>
                <Film className="absolute bottom-4 right-4 size-5 text-white/35" />
              </div>
              <div className="p-5">
                <p className="text-sm text-[#e5e5e1]">{proj.title}</p>
                <p className="mt-2 text-xs text-[#777773]">
                  {proj.premise?.substring(0, 55) ?? 'No premise'}
                  {proj.premise?.length > 55 ? '…' : ''}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/10">
                    <div className="h-px bg-[#aaa7b4]" style={{ width: `${proj.progress ?? 50}%` }} />
                  </div>
                  <span className="font-mono text-[10px] text-[#777773]">{proj.progress ?? 50}%</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Director Canvas View ─────────────────────────────────────────────────────

function CanvasView({ project, selectedIndex, onSelectIndex, onRegenerateShot, go, notify }: any) {
  const shotList = project?.shots ?? [];
  const activeShot = shotList[selectedIndex];

  if (!project) {
    return (
      <>
        <PageHeader
          eyebrow="Director Canvas"
          title={<>Select a project<br /><span className="text-[#aaa7b4]">to begin directing.</span></>}
          description="Open a project from the Projects screen to start building scenes and shots."
          action="Open projects"
          onAction={() => go('projects')}
        />
        <EmptyState label="No project selected." />
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Stage 04 / Director canvas"
        title={<>{project.title}<br /><span className="text-[#aaa7b4]">in motion.</span></>}
        description="Direct every shot with precision. Continuity tracked across character, world, and cut."
        action="Add scene"
        onAction={() => notify('Scene added to canvas')}
      />

      <div className="grid border border-white/[0.09] xl:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {/* Scene header */}
          <div className="flex items-center justify-between border-b border-white/[0.09] px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="size-1.5 bg-[#a798c7]" />
              <span className="text-xs">Scene 01</span>
              <span className="label-caps text-[#6f6f6b]">Neon city / night</span>
            </div>
            <MoreHorizontal className="size-4 text-[#6f6f6b]" />
          </div>

          {/* Shots grid */}
          <div className="border-b border-white/[0.09] p-5 md:p-8">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs text-[#7b7b77]">SEQUENCE 01</p>
                <h2
                  className="mt-2 text-xl font-light"
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  The handoff
                </h2>
              </div>
              <p className="font-mono text-[10px] text-[#6f6f6b]">
                {shotList.length} SHOTS
              </p>
            </div>

            {shotList.length === 0 ? (
              <EmptyState label="No shots generated yet." />
            ) : (
              <div className="grid gap-px border border-white/[0.1] bg-white/[0.1] sm:grid-cols-2 xl:grid-cols-4">
                {shotList.map((shot: any, i: number) => (
                  <button
                    key={shot.id ?? i}
                    onClick={() => onSelectIndex(i)}
                    className={`bg-[#111112] text-left transition-colors hover:bg-[#19191a] ${
                      selectedIndex === i ? 'ring-1 ring-inset ring-[#aaa0bf]' : ''
                    }`}
                  >
                    <div className={`h-28 ${SHOT_THUMBS[i % SHOT_THUMBS.length]} grayscale-[0.35]`} />
                    <div className="p-3">
                      <div className="flex justify-between font-mono text-[10px] text-[#777773]">
                        <span>0{i + 1}.{String(i + 1).padStart(2, '0')}</span>
                        <span>00:08</span>
                      </div>
                      <p className="mt-3 text-xs text-[#dddcd8]">{shot.prompt?.substring(0, 32) ?? `Shot ${i + 1}`}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <CanvasTimeline />
        </div>

        {/* Shot Inspector */}
        <ShotInspector
          shot={activeShot}
          index={selectedIndex}
          onRegenerate={() => onRegenerateShot(activeShot)}
          notify={notify}
        />
      </div>
    </>
  );
}

function CanvasTimeline() {
  const tracks = ['VIDEO', 'DIALOGUE', 'SFX', 'MUSIC'];
  return (
    <div className="p-5 md:p-8">
      <div className="mb-4 flex items-center justify-between">
        <SectionLabel>Timeline</SectionLabel>
        <span className="font-mono text-[10px] text-[#777773]">00:18:24</span>
      </div>
      <div className="relative flex flex-col gap-3">
        <div className="absolute bottom-0 left-[38%] top-0 w-px bg-[#a798c7]" />
        {tracks.map((track, i) => (
          <div key={track} className="flex items-center gap-4">
            <span className="w-14 text-[9px] tracking-[0.15em] text-[#666662]">{track}</span>
            <div className="relative flex h-7 flex-1 gap-1 bg-[#121213] p-1">
              {[0, 1, 2, 3].map((x) => (
                <span
                  key={x}
                  className={`h-full flex-1 ${x <= i ? 'bg-[#414143]' : 'bg-[#242426]'}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShotInspector({ shot, index, onRegenerate, notify }: any) {
  return (
    <aside className="border-t border-white/[0.09] xl:border-l xl:border-t-0">
      <div className="flex items-center justify-between border-b border-white/[0.09] px-5 py-4">
        <span className="text-xs">Shot inspector</span>
        <SlidersHorizontal className="size-3.5 text-[#777773]" />
      </div>
      <div className="p-5">
        {shot ? (
          <>
            <Eyebrow>0{index + 1}.{String(index + 1).padStart(2, '0')}</Eyebrow>
            <h3
              className="text-lg font-light"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {shot.prompt?.substring(0, 28) ?? `Shot ${index + 1}`}
            </h3>

            {[
              ['Framing',  'Wide'],
              ['Movement', 'Slow pan left'],
              ['Duration', '00:08'],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-white/[0.09] py-5">
                <p className="label-caps">{label}</p>
                <p className="mt-2 text-xs text-[#d0d0cc]">{value}</p>
              </div>
            ))}

            <div className="py-5">
              <p className="label-caps">References</p>
              <p className="mt-3 text-xs text-[#a5a5a2]">Ada Vale · Neon city / night</p>
            </div>

            <button
              onClick={onRegenerate}
              className="btn-primary w-full justify-between mt-2"
            >
              Re-roll this shot
              <RefreshCw className="size-3.5" />
            </button>

            <button
              onClick={() => notify('Storyboard generation queued')}
              className="mt-3 btn-primary w-full justify-between"
            >
              Generate storyboard
              <ArrowRight className="size-3.5" />
            </button>
          </>
        ) : (
          <p className="text-xs text-[#555552]">Select a shot to inspect.</p>
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

  const mockChars = ['Ada Vale', 'Milo Chen', 'The Broker', 'Background ensemble'];
  const display = chars.length > 0 ? chars : mockChars.map((name) => ({ name }));

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
      ) : (
        <div className="grid gap-px border border-white/[0.09] bg-white/[0.09] sm:grid-cols-2 lg:grid-cols-4">
          {display.map((char: any, i: number) => (
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
                <p className="mt-2 text-[10px] text-[#6f6f6b]">{i + 2} references · Updated today</p>
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
  const mockLocs = ['Neon city / night', 'The old orchard', 'Subway platform 09', 'Rain room'];

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

      <div className="grid gap-px border border-white/[0.09] bg-white/[0.09] sm:grid-cols-2 lg:grid-cols-4">
        {mockLocs.map((loc, i) => (
          <button
            key={loc}
            onClick={() => notify(`${loc} opened`)}
            className="bg-[#0b0b0c] text-left hover:bg-[#151516] transition-colors"
          >
            <div className={`h-44 grayscale ${['bg-[#484e4e]','bg-[#555755]','bg-[#484f4d]','bg-[#605751]'][i]}`} />
            <div className="p-4">
              <p className="text-sm text-[#e5e5e1]">{loc}</p>
              <p className="mt-2 text-[10px] text-[#6f6f6b]">Ambient phrases defined · Updated today</p>
            </div>
          </button>
        ))}
      </div>
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

// ─── Billing View ─────────────────────────────────────────────────────────────

function BillingView({ credits, onTopUp }: any) {
  const activity = [
    { label: 'Final cut estimate · Cyberpunk Heist', cost: 320 },
    { label: 'Storyboard generation · Scene 01',    cost: 48  },
    { label: 'Character reference · Ada Vale',       cost: 16  },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Credits"
        description="Production usage across this workspace."
        action="Add credits"
        onAction={onTopUp}
      />

      <div className="grid gap-12 border-b border-white/[0.09] pb-12 md:grid-cols-2">
        <div>
          <p
            className="text-5xl font-light"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            {credits.toLocaleString()}
          </p>
          <p className="mt-3 label-caps" style={{ color: '#6f6f6b' }}>Available credits</p>
        </div>
        <div>
          <p
            className="text-5xl font-light"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            62%
          </p>
          <p className="mt-3 label-caps" style={{ color: '#6f6f6b' }}>Monthly usage</p>
        </div>
      </div>

      <div className="mt-10">
        <SectionLabel>Recent activity</SectionLabel>
        {activity.map(({ label, cost }) => (
          <div key={label} className="flex justify-between border-b border-white/[0.09] py-4 text-xs">
            <span className="text-[#c0c0bb]">{label}</span>
            <span className="font-mono text-[#777773]">-{cost} CR</span>
          </div>
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

function StoryView({ go, notify, onProjectCreated }: any) {
  const [title,   setTitle]   = useState('Cyberpunk Heist');
  const [premise, setPremise] = useState('A courier steals a memory from the city that built her.');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await api.createProject({ title, premise });
      if (res.success && res.data) {
        onProjectCreated(res.data.id);
        notify('Project created!');
        go('canvas');
      } else {
        throw new Error((res as any).error || 'Unknown error');
      }
    } catch (err: any) {
      console.error('[story] create error:', err.message);
      notify(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Stage 01 / Pitch intake"
        title={<>Give the film<br /><span className="text-[#aaa7b4]">a north star.</span></>}
        description="Start with the feeling, conflict, and world. Build a living story bible from a clear seed."
        action="Save draft"
        onAction={() => notify('Story seed saved')}
      />

      <div className="max-w-2xl border border-white/[0.09] p-5 md:p-8">
        <Field label="Working title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-b border-white/15 bg-transparent py-3 text-sm text-[#f1f1ef] outline-none focus:border-[#aaa0bf] transition-colors"
          />
        </Field>

        <Field label="One-line premise">
          <textarea
            value={premise}
            onChange={(e) => setPremise(e.target.value)}
            className="min-h-32 w-full resize-none border-b border-white/15 bg-transparent py-3 text-sm leading-6 text-[#f1f1ef] outline-none focus:border-[#aaa0bf] transition-colors"
          />
        </Field>

        <Field label="Creative direction">
          <div className="flex flex-wrap gap-2">
            {['Moody', 'Kinetic', 'Character-led', 'Neon noir', '8–10 minutes'].map((tag) => (
              <button
                key={tag}
                className="border border-white/20 px-3 py-2 text-xs text-[#bbb9c5] hover:border-white/50 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </Field>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="mt-6 flex items-center gap-2 bg-white px-5 py-3 text-xs font-medium text-black hover:bg-[#d6d6d6] disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
          {loading ? 'Creating…' : 'Build story bible'}
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
        title={<>See the rhythm<br /><span className="text-[#aaa7b4]">before the render.</span></>}
        description="Review pacing, dialogue, and visual continuity as a sequence of frames."
        action="Render animatic"
        onAction={() => go('render')}
      />

      <div className="border border-white/[0.09] p-5 md:p-8">
        <div className="mb-8 flex justify-between">
          <div>
            <p className="text-sm text-[#e5e5e1]">{project?.title ?? 'Cyberpunk Heist'} · Animatic pass 01</p>
            <p className="mt-2 text-xs text-[#6f6f6b]">8 scenes · 01:04 total duration</p>
          </div>
          <button
            onClick={() => notify('Storyboard exported')}
            className="flex items-center gap-2 text-xs text-[#888884] hover:text-white transition-colors"
          >
            <Download className="size-3.5" /> Export
          </button>
        </div>

        <div className="grid gap-px border border-white/[0.09] bg-white/[0.09] sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="bg-[#111112]">
              <div className="h-28 bg-[#414346] p-3 grayscale">
                <span className="font-mono text-[10px] text-white/60">0{i + 1}</span>
              </div>
              <div className="p-3">
                <p className="text-xs text-[#dddcd8]">{['Wide establishing', 'Ada enters frame', 'The handoff', 'Neon pursuit'][i % 4]}</p>
                <p className="mt-2 text-[10px] text-[#6f6f6b]">00:08 · Dialogue ready</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => go('render')}
          className="mt-8 btn-primary"
        >
          Continue to quote & render
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
        eyebrow="Stage 06 / Quote & render"
        title={<>Choose<br /><span className="text-[#aaa7b4]">the finish.</span></>}
        description="Review the production quote, then send the final cut into the render queue."
      />

      <div className="max-w-2xl border border-white/[0.09] p-5 md:p-8">
        <div className="flex justify-between border-b border-white/[0.09] pb-6">
          <div>
            <p className="text-sm text-[#e5e5e1]">Final cut estimate</p>
            <p className="mt-2 text-xs text-[#6f6f6b]">
              {project?.title ?? 'Cyberpunk Heist'} · 01:04 · 4K delivery
            </p>
          </div>
          <p className="text-2xl font-light" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            320 <span className="text-xs text-[#777773]">CR</span>
          </p>
        </div>

        {[['Frames', '1,536'], ['Resolution', '3840 × 2160'], ['Audio mix', 'Stereo master']].map(([x, y]) => (
          <div key={x} className="flex justify-between border-b border-white/[0.09] py-4 text-xs">
            <span className="text-[#777773]">{x}</span>
            <span className="text-[#e5e5e1]">{y}</span>
          </div>
        ))}

        <button
          onClick={() => { notify('Render queued'); go('preview'); }}
          className="mt-8 btn-solid"
        >
          Queue final render
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
        eyebrow="Review / Final cut"
        title={project?.title ?? 'Cyberpunk Heist'}
        description="Final render · 01:04 · 4K delivery"
        action="Back to canvas"
        onAction={() => go('canvas')}
      />

      {/* Video player */}
      <div className="relative flex aspect-video max-w-4xl items-center justify-center overflow-hidden bg-[#303236]">
        <Play className="size-12 text-white/70" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
          <div className="h-full w-[34%] bg-[#aaa0bf]" />
        </div>
      </div>

      <div className="mt-5 flex max-w-4xl items-center justify-between text-xs text-[#777773]">
        <span>00:18 / 01:04</span>
        <div className="flex gap-4 items-center">
          <Pause className="size-4 cursor-pointer hover:text-white transition-colors" />
          <Download className="size-4 cursor-pointer hover:text-white transition-colors" />
          <button
            onClick={onPublish}
            className="btn-primary"
          >
            <Share2 className="size-3.5" />
            Publish
          </button>
        </div>
      </div>
    </>
  );
}
