'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  ArrowRight, Bell, Check, ChevronDown, Clock3, Download,
  Film, FolderOpen, Gauge, Layers3, MapPin, Menu, MoreHorizontal, Pause, Play,
  Plus, RefreshCw, Search, Settings2, Share2, Shield, SlidersHorizontal, UserRound, Wand2, X, Code
} from 'lucide-react';
import { api } from '@/lib/api';
import { PaystackModal } from '@/components/modals/PaystackModal';
import { ShotRegenerationDrawer } from '@/components/modals/ShotRegenerationDrawer';
import { PublishDrawer } from '@/components/modals/PublishDrawer';
import { DeveloperConsoleView } from '@/components/views/DeveloperConsoleView';

type Screen = 'projects' | 'canvas' | 'characters' | 'locations' | 'templates' | 'billing' | 'settings' | 'story' | 'storyboard' | 'render' | 'preview' | 'developer';

const navPrimary = [
  { id: 'projects' as Screen, label: 'Projects', icon: FolderOpen },
  { id: 'canvas' as Screen, label: 'Director Canvas', icon: Film },
  { id: 'characters' as Screen, label: 'Characters', icon: UserRound },
  { id: 'locations' as Screen, label: 'Locations', icon: MapPin },
  { id: 'templates' as Screen, label: 'Templates', icon: Layers3 },
];

const navSecondary = [
  { id: 'billing' as Screen, label: 'Paystack Wallet', icon: Gauge },
  { id: 'developer' as Screen, label: 'API Keys & Webhooks', icon: Code },
  { id: 'settings' as Screen, label: 'Settings', icon: Settings2 },
];

export default function Page() {
  const [screen, setScreen] = useState<Screen>('projects');
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [credits, setCredits] = useState(1250);

  // Active Project & Shot States
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [selectedShotIndex, setSelectedShotIndex] = useState(0);

  // Modals & Drawers
  const [paystackOpen, setPaystackOpen] = useState(false);
  const [regenShot, setRegenShot] = useState<any | null>(null);
  const [publishProject, setPublishProject] = useState<any | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const go = (next: Screen) => {
    setScreen(next);
    setMobileNav(false);
  };

  // Fetch projects on load
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await api.getProjects();
        if (res.success && res.data) {
          setProjectsList(res.data);
          if (res.data.length > 0 && !activeProjectId) {
            setActiveProjectId(res.data[0].id);
          }
        } else {
          setProjectsList([]);
        }
      } catch (err: any) {
        setProjectsList([]);
        console.error('Failed to load projects:', err.message);
      }
    }
    loadProjects();
  }, []);

  // Fetch active project details when activeProjectId changes
  useEffect(() => {
    if (!activeProjectId) return;
    async function loadProjectDetails() {
      try {
        const res = await api.getProjectDetails(activeProjectId!);
        if (res.success && res.data) {
          setCurrentProject(res.data);
        }
      } catch (err: any) {
        console.warn('Could not load project details:', err.message);
      }
    }
    loadProjectDetails();
  }, [activeProjectId]);

  return (
    <main className="min-h-screen bg-[#0b0b0c] text-[#f1f1ef] selection:bg-[#7566a5]/40 font-sans">
      // Top Header Update (Part of Page component)
{/* Top Header */}
<header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-black bg-white/90 backdrop-blur-md px-4 md:px-6">
  <div className="flex items-center gap-3">
    <button onClick={() => setMobileNav(!mobileNav)} className="text-black md:hidden">
      <Menu className="size-5" />
    </button>
    <button onClick={() => go('projects')} className="flex items-center gap-2.5">
      <Image src="/logo.png" alt="Logo" width={32} height={32} />
      <span className="text-[13px] tracking-[-0.01em] font-medium uppercase">
        Primus <span className="font-bold">Director AI</span>
      </span>
    </button>
  </div>

  <div className="flex items-center gap-4 text-xs">
    <button
      onClick={() => setPaystackOpen(true)}
      className="flex items-center gap-2 rounded-sm border border-black px-3 py-1 text-black hover:bg-black hover:text-white transition-all font-mono"
    >
      <span>{credits.toLocaleString()} CR</span>
      <span className="text-[10px] font-bold uppercase tracking-wider">+</span>
    </button>
  </div>
</header>

{/* Navigation Sidebar Update */}
<aside className={`${mobileNav ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-60 border-r border-black bg-white px-3 pb-6 pt-20 transition-transform md:block md:translate-x-0`}>
  <div className="mb-6 px-3 text-[10px] uppercase tracking-[0.2em] text-black/60 font-bold">Workspace</div>
  <nav className="flex flex-col gap-0.5">
    {navPrimary.map(({ id, label, icon: Icon }) => (
      <NavItem key={id} active={screen === id} label={label} icon={Icon} onClick={() => go(id)} />
    ))}
  </nav>
  <div className="my-6 border-t border-black" />
  <nav className="flex flex-col gap-0.5">
    {navSecondary.map(({ id, label, icon: Icon }) => (
      <NavItem key={id} active={screen === id} label={label} icon={Icon} onClick={() => go(id)} />
    ))}
  </nav>
</aside>

      {/* Main View Area */}
      <section className="min-h-screen pt-14 md:ml-60">
        <div className="mx-auto max-w-[1440px] px-5 py-9 pb-24 md:px-10 md:py-12 md:pb-12">
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
              notify={notify}
            />
          )}

          {screen === 'characters' && (
            <CharactersView projectId={activeProjectId} notify={notify} />
          )}

          {screen === 'locations' && (
            <LocationsView projectId={activeProjectId} notify={notify} />
          )}

          {screen === 'templates' && <TemplatesView go={go} />}

          {screen === 'billing' && (
            <BillingView
              credits={credits}
              onTopUp={() => setPaystackOpen(true)}
            />
          )}

          {screen === 'developer' && <DeveloperConsoleView />}

          {screen === 'settings' && <SettingsView notify={notify} />}

          {screen === 'story' && <StoryView go={go} notify={notify} onProjectCreated={(id: string) => setActiveProjectId(id)} />}

          {screen === 'storyboard' && <StoryboardView project={currentProject} go={go} notify={notify} />}

          {screen === 'render' && <RenderView project={currentProject} go={go} notify={notify} />}

          {screen === 'preview' && <PreviewView project={currentProject} go={go} onPublish={() => setPublishProject(currentProject)} />}
        </div>
      </section>

      {/* Modals & Drawers */}
      <PaystackModal
        isOpen={paystackOpen}
        onClose={() => setPaystackOpen(false)}
        onSuccess={(added) => {
          setCredits((c) => c + added);
          notify(`Successfully added ${added} Credits via Paystack!`);
        }}
      />

      <ShotRegenerationDrawer
        isOpen={!!regenShot}
        shot={regenShot}
        onClose={() => setRegenShot(null)}
        onShotRegenerated={(shotId, taskId) => {
          notify(`Shot queued for re-roll (Task: ${taskId.substring(0, 8)})`);
        }}
      />

      <PublishDrawer
        isOpen={!!publishProject}
        project={publishProject}
        onClose={() => setPublishProject(null)}
      />

      {mobileNav && <button onClick={() => setMobileNav(false)} className="fixed inset-0 z-20 bg-black/60 md:hidden" />}

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-purple-500/30 bg-[#181819] px-4 py-3 text-xs text-white shadow-2xl">
          <Check className="size-3.5 text-purple-400" /> {toast}
        </div>
      )}
    </main>
  );
}

// ─── Sub-Components ────────────────────────────────────────────────────────────

function NavItem({ active, label, icon: Icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`relative flex w-full items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors rounded-sm ${
        active ? 'bg-black text-white font-medium' : 'text-black/60 hover:text-black hover:bg-black/5'
      }`}
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function PageHeader({ eyebrow, title, description, action, onAction }: any) {
  return (
    <header className="mb-10 flex flex-col justify-between gap-6 border-b border-black pb-8 md:flex-row md:items-end">
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.22em] font-bold text-black">{eyebrow}</p>
        <h1 className="max-w-3xl text-3xl font-light tracking-[-0.045em] text-black md:text-5xl">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-sm leading-6 text-black/60">{description}</p>}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex w-fit items-center gap-2 rounded-sm border border-black px-4 py-2.5 text-xs font-semibold text-black transition-colors hover:bg-black hover:text-white"
        >
          {action}
          <ArrowRight className="size-3.5" />
        </button>
      )}
    </header>
  );
}

// ─── Projects View ─────────────────────────────────────────────────────────────

function ProjectsView({ projects, onSelectProject, onCreateNew, notify }: any) {
  const list = projects || [];

  return (
    <>
      <PageHeader
        eyebrow="Projects Library"
        title={<>Make the impossible <span className="font-bold">watchable.</span></>}
        description="A backend-connected workstation for long-form films with character consistency and control."
        action="New Project"
        onAction={onCreateNew}
      />

      {list.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-black/20 text-sm text-black/50">
          No projects found. Create your first one.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((proj: any) => (
            <button
              key={proj.id}
              onClick={() => onSelectProject(proj.id)}
              className="group rounded-xl border border-black/10 text-left transition-all hover:border-black p-5"
            >
              <p className="text-base font-semibold text-black">{proj.title}</p>
              <p className="mt-1 text-xs text-black/60">{proj.premise?.substring(0, 45) + '...'}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1 flex-1 bg-black/10 rounded-full overflow-hidden">
                  <div className="h-full bg-black" style={{ width: proj.progress || '50%' }} />
                </div>
                <span className="font-mono text-[10px] text-black/60">{proj.progress || '50%'}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Director Canvas View ──────────────────────────────────────────────────────

function CanvasView({ project, selectedIndex, onSelectIndex, onRegenerateShot, notify }: any) {
  const shotList = project?.shots || [];
  const activeShot = shotList[selectedIndex];

  if (!project) return <div className="text-sm text-black/50">Select a project to start directing.</div>;

  return (
    <>
      <PageHeader
        eyebrow="Director Canvas"
        title={project.title}
        description="Direct every shot with precision."
        action="Add Scene"
        onAction={() => notify('Scene added to canvas')}
      />

      {shotList.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-black/20 text-sm text-black/50">
          No shots in this project.
        </div>
      ) : (
        // ... (rest of the grid rendering, just update styles to black/white)
        <div className="grid border border-black rounded-xl overflow-hidden xl:grid-cols-[1fr_320px]">
          {/* ... (update classNames for black/white: bg-[#0e1019] -> bg-white, border-white/10 -> border-black) */}
        </div>
      )}
    </>
  );
}

// ─── Additional View Stubs ─────────────────────────────────────────────────────

function CharactersView({ projectId, notify }: any) {
  return (
    <>
      <PageHeader
        eyebrow="Character & Location Vault"
        title="Visual DNA Consistency"
        description="Character reference sheets attached directly to SnapGen ingredient mode."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Replace with actual API data mapping */}
        <div className="flex h-32 items-center justify-center rounded-xl border border-black/10 text-sm text-black/50">
          Connect backend to load character registry.
        </div>
      </div>
    </>
  );
}

function LocationsView({ notify }: any) {
  return (
    <>
      <PageHeader eyebrow="World Locations" title="Environment Ambience" description="Fixed ambience phrases for background sound continuity." />
      <div className="flex h-32 items-center justify-center rounded-xl border border-black/10 text-sm text-black/50">
          Connect backend to load location registry.
      </div>
    </>
  );
}

function TemplatesView({ go }: any) {
  return <PageHeader eyebrow="Templates" title="Production Starters" description="Pre-configured multi-act genre blueprints." />;
}

function BillingView({ credits, onTopUp }: any) {
  return (
    <>
      <PageHeader
        eyebrow="Paystack Wallet"
        title={<>Credit Balance: <span className="font-bold">{credits.toLocaleString()} CR</span></>}
        description="Paystack secured top-ups for SnapGen video generation."
        action="+ Add Credits"
        onAction={onTopUp}
      />
    </>
  );
}

function SettingsView({ notify }: any) {
  return (
    <>
      <PageHeader eyebrow="Workspace Settings" title="Production Preferences" description="Default resolution, aspect ratio, and safety policies." />
      <div className="max-w-md space-y-6">
        <div className="flex items-center justify-between border-b border-black py-4">
          <span className="text-sm">Default Aspect Ratio</span>
          <span className="text-sm font-mono">16:9</span>
        </div>
        <div className="flex items-center justify-between border-b border-black py-4">
          <span className="text-sm">Safety Filter</span>
          <span className="text-sm font-mono">Strict</span>
        </div>
      </div>
    </>
  );
}

function StoryView({ go, notify, onProjectCreated }: any) {
  const [premise, setPremise] = useState('A courier steals a memory from the city that built her.');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await api.createProject({ title: 'Cyberpunk Heist', premise });
      if (res.success && res.data) {
        onProjectCreated(res.data.id);
        notify('Project created successfully!');
        go('canvas');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader eyebrow="Stage 01" title="New Film Idea" description="Turn raw premise into full script and shot list." />
      <textarea
        value={premise}
        onChange={(e) => setPremise(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-white/10 bg-[#121420] p-4 text-xs text-white focus:border-purple-500 focus:outline-none"
      />
      <button onClick={handleCreate} disabled={loading} className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-xs font-semibold text-white hover:bg-purple-500">
        <span>{loading ? 'Creating...' : 'Create Project & Generate Script'}</span>
        <ArrowRight className="size-4" />
      </button>
    </div>
  );
}

function StoryboardView({ project, go }: any) {
  return <PageHeader eyebrow="Stage 05" title="Free Animatic Preview" description="Review pacing before spending video credits." />;
}

function RenderView({ project, go }: any) {
  return <PageHeader eyebrow="Stage 06" title="Render Queue" description="Live rendering execution log." />;
}

function PreviewView({ project, go, onPublish }: any) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Final Cut" title={project?.title || 'Cyberpunk Heist'} action="Publish Video" onAction={onPublish} />
    </div>
  );
}
