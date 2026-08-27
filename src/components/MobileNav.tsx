import { NavLink } from 'react-router-dom';
import { Bookmark, Clapperboard, Heart, Home, Library, MessageSquare, Search, Settings, Tv, Swords } from 'lucide-react';
import { useContent } from './ContentProvider';
import { cn } from '../utils/format';

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  end?: boolean;
  requires?: 'music' | 'movies' | 'series' | 'anime';
}

const NAV: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home, end: true, requires: 'music' },
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/my-list', label: 'Mi Lista', icon: Bookmark },
  { to: '/library', label: 'Biblioteca', icon: Library },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/movies', label: 'Películas', icon: Clapperboard, requires: 'movies' },
  { to: '/tv', label: 'Series', icon: Tv, requires: 'series' },
  { to: '/anime', label: 'Anime', icon: Swords, requires: 'anime' },
  { to: '/settings', label: 'Config', icon: Settings },
];

export default function MobileNav() {
  const { content } = useContent();

  const isDisabled = (requires?: 'music' | 'movies' | 'series' | 'anime') => {
    if (!requires) return false;
    if (requires === 'music') return !content.showMusic;
    if (requires === 'movies') return !content.showMovies;
    if (requires === 'series') return !content.showSeries;
    if (requires === 'anime') return !content.showAnime;
    return false;
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden">
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
                'flex flex-1 flex-col items-center gap-0.5 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 text-[10px] font-medium transition-colors',
                disabled
                  ? 'cursor-not-allowed opacity-30'
                  : isActive
                    ? 'text-fuchsia-300'
                    : 'text-muted',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex items-center justify-center rounded-full px-3 py-1 transition-colors',
                    isActive && !disabled && 'bg-brand/15',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
