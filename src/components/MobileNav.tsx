import { NavLink } from 'react-router-dom';
import { Clapperboard, Heart, Home, Library, Search, Tv } from 'lucide-react';
import { cn } from '../utils/format';

const NAV = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/search', label: 'Buscar', icon: Search },
  { to: '/library', label: 'Biblioteca', icon: Library },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/movies', label: 'Películas', icon: Clapperboard },
  { to: '/tv', label: 'Series', icon: Tv },
];

export default function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface/95 backdrop-blur-xl lg:hidden">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center gap-0.5 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 text-[10px] font-medium transition-colors',
              isActive ? 'text-fuchsia-300' : 'text-muted',
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'flex items-center justify-center rounded-full px-3 py-1 transition-colors',
                  isActive && 'bg-brand/15',
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
