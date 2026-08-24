import { useNavigate } from 'react-router-dom';
import { Flame, ClipboardCheck, LayoutDashboard, LucideIcon } from 'lucide-react';

interface AppTile {
  name: string;
  description: string;
  icon: LucideIcon;
  path: string;
  available: boolean;
  external?: boolean;
}

const apps: AppTile[] = [
  {
    name: 'Welder',
    description: 'Weld task queue, setup, arc tracking, and sign-off',
    icon: Flame,
    path: '/welder',
    available: true,
  },
  {
    name: 'Inspector',
    description: 'Accept or reject welds on the shop floor, raise NCRs and NDT reports',
    icon: ClipboardCheck,
    path: '/inspector.html',
    available: true,
    external: true,
  },
  {
    name: 'Supervisor',
    description: 'Floor-wide status, station heatmap, and crew oversight',
    icon: LayoutDashboard,
    path: '/welder?view=supervisor',
    available: true,
  },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--c-root)] flex flex-col items-center px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-[var(--text-hi)] tracking-tight">
          Weld<span className="text-yellow-500">Cloud</span>Link
        </h1>
        <p className="mt-2 text-sm text-[var(--text-lo)]">Select an app to launch</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {apps.map((app) => {
          const Icon = app.icon;
          return (
            <button
              key={app.name}
              onClick={() => (app.external ? (window.location.href = app.path) : navigate(app.path))}
              className="group relative flex flex-col items-start gap-4 rounded-xl border border-[var(--c-border)] bg-[var(--c-raised)] p-6 text-left transition-colors hover:border-yellow-500/60 hover:bg-[var(--c-hover)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-hi)]">{app.name}</h2>
                <p className="mt-1 text-sm text-[var(--text-lo)]">{app.description}</p>
              </div>
              {!app.available && (
                <span className="absolute top-4 right-4 rounded-full border border-[var(--c-border)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--text-lo)]">
                  Coming soon
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
