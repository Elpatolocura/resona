import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Clapperboard,
  Heart,
  Home,
  Library,
  Menu,
  Search,
  Settings,
  Tv,
  Swords,
  Radio,
  X,
  LogOut,
  MessageSquare,
} from 'lucide-react';
import { useContent } from './ContentProvider';
import { useAuthStore } from '../store/authStore';
import { cn } from '../utils/format';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  requires?: 'music' | 'movies' | 'series' | 'anime';
}

const MENU_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home, requires: 'music' },
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/my-list', label: 'Mi Lista', icon: Bookmark },
  { to: '/library', label: 'Biblioteca', icon: Library },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/movies', label: 'Películas', icon: Clapperboard, requires: 'movies' },
  { to: '/tv', label: 'Series', icon: Tv, requires: 'series' },
  { to: '/anime', label: 'Anime', icon: Swords, requires: 'anime' },
  { to: '/live-tv', label: 'TV en Vivo', icon: Radio },
  { to: '/forum', label: 'Foro', icon: MessageSquare },
  { to: '/settings', label: 'Configuración', icon: Settings },
];

export default function MobileNav() {
  const { content } = useContent();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  const isDisabled = (requires?: 'music' | 'movies' | 'series' | 'anime') => {
    if (!requires) return false;
    if (requires === 'music') return !content.showMusic;
    if (requires === 'movies') return !content.showMovies;
    if (requires === 'series') return !content.showSeries;
    if (requires === 'anime') return !content.showAnime;
    return false;
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 max-h-[85vh] border-t border-line bg-surface/95 backdrop-blur-xl transition-all duration-300 lg:hidden',
          open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none',
        )}
      >
        <div className="max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20 text-sm font-bold text-fuchsia-300">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">{user.name}</p>
                    <p className="text-xs text-muted">{user.email}</p>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => { navigate('/login'); setOpen(false); }}
                  className="text-sm font-semibold text-fuchsia-300"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-text"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="p-2">
            {MENU_ITEMS.map(({ to, label, icon: Icon, requires }) => {
              const disabled = isDisabled(requires);
              return (
                <NavLink
                  key={to}
                  to={disabled ? '#' : to}
                  onClick={(e) => {
                    if (disabled) { e.preventDefault(); return; }
                    setOpen(false);
                  }}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                      disabled
                        ? 'cursor-not-allowed opacity-30'
                        : isActive
                          ? 'bg-brand/15 text-fuchsia-300'
                          : 'text-text hover:bg-surface-2',
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </NavLink>
              );
            })}
          </nav>

          {user && (
            <div className="border-t border-line p-2">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-center border-t border-line bg-surface/95 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors',
            open ? 'text-fuchsia-300' : 'text-muted',
          )}
        >
          <span
            className={cn(
              'flex items-center justify-center rounded-full px-3 py-1 transition-colors',
              open && 'bg-brand/15',
            )}
          >
            <Menu className="h-5 w-5" />
          </span>
          Menú
        </button>
      </nav>
    </>
  );
}
