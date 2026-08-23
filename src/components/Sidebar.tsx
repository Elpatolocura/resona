import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Clapperboard,
  Heart,
  Home,
  Library,
  ListMusic,
  MessageSquare,
  Plus,
  Search,
  Disc3,
  Tv,
  Settings,
} from 'lucide-react';
import { useLibraryStore } from '../store/libraryStore';
import { useContent } from './ContentProvider';
import { cn } from '../utils/format';
import CreatePlaylistModal from './CreatePlaylistModal';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
  requires?: 'music' | 'movies' | 'series';
}

const NAV: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home, end: true, requires: 'music' },
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/library', label: 'Biblioteca', icon: Library },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/playlists', label: 'Playlists', icon: ListMusic },
  { to: '/forum', label: 'Foro', icon: MessageSquare },
  { to: '/settings', label: 'Configuración', icon: Settings },
];

const MEDIA_NAV: NavItem[] = [
  { to: '/movies', label: 'Películas', icon: Clapperboard, requires: 'movies' },
  { to: '/tv', label: 'Series', icon: Tv, requires: 'series' },
];

export default function Sidebar() {
  const playlists = useLibraryStore((s) => s.playlists);
  const [createOpen, setCreateOpen] = useState(false);
  const { content } = useContent();

  const isDisabled = (requires?: 'music' | 'movies' | 'series') => {
    if (!requires) return false;
    if (requires === 'music') return !content.showMusic;
    if (requires === 'movies') return !content.showMovies;
    if (requires === 'series') return !content.showSeries;
    return false;
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface/40 lg:flex">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand shadow-lg shadow-fuchsia-500/30">
          <Disc3 className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-extrabold tracking-tight">
          Resona<span className="text-gradient">.</span>
        </span>
      </div>

      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-faint">
          Principal
        </p>
        {NAV.map(({ to, label, icon: Icon, end, requires }) => {
          const disabled = isDisabled(requires);
          return (
            <NavLink
              key={to}
              to={disabled ? '#' : to}
              end={end}
              onClick={(e) => disabled && e.preventDefault()}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  disabled
                    ? 'cursor-not-allowed opacity-40'
                    : isActive
                      ? 'bg-brand/15 text-fuchsia-300'
                      : 'text-muted hover:bg-surface-2 hover:text-text',
                )
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
              {disabled && <span className="ml-auto text-[10px] text-faint">OFF</span>}
            </NavLink>
          );
        })}

        <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-widest text-faint">
          Películas y series
        </p>
        {MEDIA_NAV.map(({ to, label, icon: Icon, requires }) => {
          const disabled = isDisabled(requires);
          return (
            <NavLink
              key={to}
              to={disabled ? '#' : to}
              onClick={(e) => disabled && e.preventDefault()}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  disabled
                    ? 'cursor-not-allowed opacity-40'
                    : isActive
                      ? 'bg-brand/15 text-fuchsia-300'
                      : 'text-muted hover:bg-surface-2 hover:text-text',
                )
              }
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
              {disabled && <span className="ml-auto text-[10px] text-faint">OFF</span>}
            </NavLink>
          );
        })}

        <div className="pt-5">
          <div className="flex items-center justify-between px-3 pb-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-faint">
              Tus playlists
            </p>
            <button
              onClick={() => setCreateOpen(true)}
              aria-label="Crear playlist"
              title="Crear playlist"
              className="rounded-full p-1 text-muted transition hover:bg-surface-2 hover:text-fuchsia-300"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {playlists.length === 0 ? (
            <p className="px-3 py-2 text-xs text-faint">
              Crea tu primera playlist para guardar canciones.
            </p>
          ) : (
            playlists.slice(0, 20).map((p) => (
              <NavLink
                key={p.id}
                to={`/playlist/${p.id}`}
                className={({ isActive }) =>
                  cn(
                    'block truncate rounded-xl px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-brand/15 font-medium text-fuchsia-300'
                      : 'text-muted hover:bg-surface-2 hover:text-text',
                  )
                }
              >
                {p.name}
              </NavLink>
            ))
          )}
        </div>
      </nav>

      <div className="shrink-0 border-t border-line px-5 py-4">
        <p className="text-[11px] leading-relaxed text-faint">
          Resona · Música, películas y series.
          <br />
          Catálogo musical vía Audius.
          <br />
          Datos de películas y series proporcionados por TMDB.
        </p>
      </div>

      <CreatePlaylistModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </aside>
  );
}
