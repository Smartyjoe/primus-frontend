'use client';

import { useState, useEffect } from 'react';
import {
  Aperture, ArrowRight, Bell, Check, ChevronDown, Clapperboard, Clock3, Download,
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
        }
      } catch (err: any) {
        console.warn('API load fallback (backend starting):', err.message);
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
      {/* Top Header */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.09] bg-[#0b0b0c]/90 backdrop-blur-md px-4 md:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileNav(!mobileNav)} className="text-[#a5a5a2] md:hidden">
            <Menu className="size-5" />
          </button>
          <button onClick={() => go('projects')} className="flex items-center gap-2.5">
            <span className="grid size-6 place-items-center border border-purple-500/40 bg-purple-500/10 text-purple-400">
              <Aperture className="size-3.5" />
            </span>
            <span className="text-[13px] tracking-[-0.01em] font-medium">
              Primus <span className="text-purple-400">Director AI</span>
            </span>
          </button>
          <span className="hidden h-4 w-px bg-white/15 sm:block" />
          <button onClick={() => go('canvas')} className="hidden items-center gap-2 text-xs text-[#b5b5b1] sm:flex hover:text-white">
            <span>{currentProject?.title || 'Cyberpunk Heist'}</span>
            <ChevronDown className="size-3 text-[#777773]" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <button
            onClick={() => setPaystackOpen(true)}
            className="flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-purple-300 hover:bg-purple-500/20 font-mono transition-all"
          >
            <span>{credits.toLocaleString()} CR</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">+ Add</span>
          </button>
          <button onClick={() => setPublishProject(currentProject || { title: 'Cyberpunk Heist' })} className="hidden md:flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1 text-xs text-gray-300 hover:bg-white/10">
            <Share2 className="size-3.5 text-blue-400" />
            <span>Publish</span>
          </button>
          <Bell className="hidden size-4 text-gray-400 md:block" />
          <div className="grid size-7 place-items-center rounded-full border border-purple-500/30 bg-purple-500/20 text-[10px] font-bold text-purple-300">
            PA
          </div>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <aside className={`${mobileNav ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-30 w-60 border-r border-white/[0.09] bg-[#0b0b0c] px-3 pb-6 pt-20 transition-transform md:block md:translate-x-0`}>
        <div className="mb-6 px-3 text-[10px] uppercase tracking-[0.2em] text-[#656562]">Workspace</div>
        <nav className="flex flex-col gap-0.5">
          {navPrimary.map(({ id, label, icon: Icon }) => (
            <NavItem key={id} active={screen === id} label={label} icon={Icon} onClick={() => go(id)} />
          ))}
        </nav>
        <div className="my-6 border-t border-white/[0.08]" />
        <nav className="flex flex-col gap-0.5">
          {navSecondary.map(({ id, label, icon: Icon }) => (
            <NavItem key={id} active={screen === id} label={label} icon={Icon} onClick={() => go(id)} />
          ))}
        </nav>
        <div className="absolute bottom-6 left-6 right-6 border-t border-white/[0.08] pt-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-purple-400 font-semibold">Engine Status</p>
          <p className="mt-1 text-xs text-[#a5a5a2]">SnapGen Veo 3.1 Ready</p>
        </div>
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
      className={`relative flex items-center gap-3 px-3 py-2.5 text-left text-xs transition-colors rounded-lg ${
        active ? 'text-white bg-white/[0.06] font-medium' : 'text-[#858582] hover:text-[#d1d1cc] hover:bg-white/[0.02]'
      }`}
    >
      {active && <span className="absolute -left-3 h-4 w-0.5 bg-purple-400 rounded-r" />}
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function PageHeader({ eyebrow, title, description, action, onAction }: any) {
  return (
    <header className="mb-10 flex flex-col justify-between gap-6 border-b border-white/[0.09] pb-8 md:flex-row md:items-end">
      <div>
        <p className="mb-2 text-[10px] uppercase tracking-[0.22em] font-semibold text-purple-400">{eyebrow}</p>
        <h1 className="max-w-3xl text-3xl font-light tracking-[-0.045em] md:text-5xl text-white">{title}</h1>
        {description && <p className="mt-3 max-w-xl text-sm leading-6 text-[#8e8e8a]">{description}</p>}
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex w-fit items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-4 py-2.5 text-xs font-semibold text-purple-300 transition-colors hover:bg-purple-500 hover:text-white"
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
  const defaultProjects = [
    { id: 'prj_1', title: 'Cyberpunk Heist', meta: 'Stage 04 · 8 shots · Veo 3.1 Fast', progress: '65%', status: 'In production' },
    { id: 'prj_2', title: 'The Last Orchard', meta: 'Stage 02 · Story bible · Claude 3.5', progress: '22%', status: 'Draft' },
    { id: 'prj_3', title: 'Northbound', meta: 'Stage 06 · Rendering · Omni Flash', progress: '88%', status: 'Rendering' },
  ];

  const list = projects && projects.length > 0 ? projects : defaultProjects;

  return (
    <>
      <PageHeader
        eyebrow="Projects Library"
        title={<>Make the impossible <span className="text-purple-400">watchable.</span></>}
        description="A backend-connected workstation for long-form films with character consistency and control."
        action="New Project"
        onAction={onCreateNew}
      />

      <div className="mb-10 grid gap-6 border-b border-white/[0.09] pb-8 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#121420] p-4">
          <p className="text-2xl font-light">{list.length}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Active Projects</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#121420] p-4">
          <p className="text-2xl font-light">18h 42m</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Rendered This Month</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#121420] p-4">
          <p className="text-2xl font-light text-purple-400">1,250 CR</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">Wallet Credits Available</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((proj: any) => (
          <button
            key={proj.id}
            onClick={() => onSelectProject(proj.id)}
            className="group rounded-2xl border border-white/10 bg-[#10121d] text-left transition-all hover:border-purple-500/50 overflow-hidden"
          >
            <div className="h-40 bg-gradient-to-br from-purple-900/30 to-black p-4 relative flex flex-col justify-between">
              <span className="w-fit rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-purple-300 uppercase tracking-wider">
                {proj.status || 'Draft'}
              </span>
              <Film className="size-6 text-purple-400/40 absolute bottom-4 right-4 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-5">
              <p className="text-base font-semibold text-white group-hover:text-purple-300">{proj.title}</p>
              <p className="mt-1 text-xs text-gray-400">{proj.meta || proj.premise?.substring(0, 45) + '...'}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: proj.progress || '50%' }} />
                </div>
                <span className="font-mono text-[10px] text-gray-400">{proj.progress || '50%'}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

// ─── Director Canvas View ──────────────────────────────────────────────────────

function CanvasView({ project, selectedIndex, onSelectIndex, onRegenerateShot, notify }: any) {
  const mockShots = [
    { id: 'sht_1', shot_index: 0, shot_number: '01.01', scene_number: 1, title: 'Wide establishing', flow_type: 'CUT', duration: '00:08', status: 'Completed', videoUrl: '' },
    { id: 'sht_2', shot_index: 1, shot_number: '01.02', scene_number: 1, title: 'Ada enters frame', flow_type: 'CUT', duration: '00:08', status: 'Completed', videoUrl: '' },
    { id: 'sht_3', shot_index: 2, shot_number: '01.03', scene_number: 1, title: 'The handoff', flow_type: 'EXTEND', duration: '00:08', status: 'Completed', videoUrl: '' },
    { id: 'sht_4', shot_index: 3, shot_number: '01.04', scene_number: 1, title: 'Neon pursuit', flow_type: 'EXTEND', duration: '00:06', status: 'Pending', videoUrl: '' },
  ];

  const shotList = project?.shots && project.shots.length > 0 ? project.shots : mockShots;
  const activeShot = shotList[selectedIndex] || shotList[0];

  return (
    <>
      <PageHeader
        eyebrow="Director Canvas / Node Graph"
        title={<>Shape the story <span className="text-purple-400">in motion.</span></>}
        description="Direct every shot with precision. Character consistency & extend continuity sequence nodes."
        action="Add Scene"
        onAction={() => notify('Scene added to canvas')}
      />

      <div className="grid border border-white/10 rounded-2xl bg-[#0e1019] overflow-hidden xl:grid-cols-[1fr_320px]">
        <div className="min-w-0 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-purple-400" />
              <span className="text-xs font-semibold text-white">Scene 01 — Neon Alleyway</span>
            </div>
            <span className="font-mono text-[11px] text-gray-400">4 SHOTS / 00:30</span>
          </div>

          {/* Shots Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shotList.map((shot: any, i: number) => {
              const isSel = selectedIndex === i;
              const isExtend = shot.flow_type === 'EXTEND';

              return (
                <button
                  key={shot.id || i}
                  onClick={() => onSelectIndex(i)}
                  className={`group relative rounded-xl border p-3 text-left transition-all bg-[#121420] ${
                    isSel ? 'border-purple-500 ring-1 ring-purple-500' : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="aspect-video w-full rounded-lg bg-black/60 p-2 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="bg-black/60 px-1.5 py-0.5 rounded text-gray-300">{shot.shot_number || `01.0${i+1}`}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isExtend ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-300'}`}>
                        {isExtend ? 'EXTEND' : 'CUT (Ingr.)'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-medium text-white truncate">{shot.title || shot.intent || `Shot ${i+1}`}</p>
                    <p className="text-[10px] text-gray-400 mt-1">Status: <span className="text-emerald-400">{shot.status || 'Completed'}</span></p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Shot Inspector */}
        <aside className="border-t border-white/10 xl:border-l xl:border-t-0 p-6 bg-[#0c0e17] space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-semibold text-white">Shot Inspector</span>
            <SlidersHorizontal className="size-3.5 text-gray-400" />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">{activeShot.shot_number || '01.01'}</p>
            <h3 className="text-base font-semibold text-white mt-1">{activeShot.title || 'Wide establishing'}</h3>
          </div>

          <div className="space-y-3 text-xs border-y border-white/10 py-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Shot Type</span>
              <span className="text-purple-300 font-mono">{activeShot.flow_type || 'CUT'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Framing & Move</span>
              <span className="text-gray-200">Wide · Slow Pan Left</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Duration</span>
              <span className="text-gray-200">{activeShot.duration || '00:08'}</span>
            </div>
          </div>

          <button
            onClick={() => onRegenerateShot(activeShot)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-xs font-semibold text-white hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/30"
          >
            <RefreshCw className="size-3.5" />
            <span>Re-Roll Shot Only</span>
          </button>
        </aside>
      </div>
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
        {['Ada Vale — Lead Hacker', 'Detective Milo', 'The Broker'].map((name) => (
          <div key={name} className="rounded-2xl border border-white/10 bg-[#10121d] p-5 space-y-3">
            <p className="text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-gray-400">Attached references: Front view, Side 3/4 view, Cyber Outfit.</p>
            <button onClick={() => notify(`Character ${name} DNA registered`)} className="rounded-lg bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 text-xs text-purple-300">
              Register DNA Prompt
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function LocationsView({ notify }: any) {
  return <PageHeader eyebrow="World Locations" title="Environment Ambience" description="Fixed ambience phrases for background sound continuity." />;
}

function TemplatesView({ go }: any) {
  return <PageHeader eyebrow="Templates" title="Production Starters" description="Pre-configured multi-act genre blueprints." />;
}

function BillingView({ credits, onTopUp }: any) {
  return (
    <>
      <PageHeader
        eyebrow="Paystack Wallet"
        title={<>Credit Balance: <span className="text-purple-400">{credits.toLocaleString()} CR</span></>}
        description="Paystack secured top-ups for SnapGen video generation."
        action="+ Add Credits"
        onAction={onTopUp}
      />
    </>
  );
}

function SettingsView({ notify }: any) {
  return <PageHeader eyebrow="Workspace Settings" title="Production Preferences" description="Default resolution, aspect ratio, and safety policies." />;
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
