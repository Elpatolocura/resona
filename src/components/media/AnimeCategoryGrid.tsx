import { useState } from 'react';
import { Flame, Star, TrendingUp, Globe } from 'lucide-react';
import type { TmdbCategory } from '../../services/tmdb';
import { tmdb } from '../../services/tmdb';
import { useApi } from '../../hooks/useApi';
import MediaGrid from './MediaGrid';
import Pagination from '../Pagination';
import { cn } from '../../utils/format';

const CATEGORIES: { id: TmdbCategory; label: string; icon: typeof Flame }[] = [
  { id: 'trending', label: 'Tendencias', icon: Flame },
  { id: 'popular', label: 'Populares', icon: TrendingUp },
  { id: 'top_rated', label: 'Mejor valoradas', icon: Star },
];

const LANGUAGES = [
  { id: 'all', label: 'Todos', flag: '🌐' },
  { id: 'ja', label: 'Japonés', flag: '🇯🇵' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
];

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 36, 48];

export default function AnimeCategoryGrid() {
  const [category, setCategory] = useState<TmdbCategory>('trending');
  const [language, setLanguage] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  const data = useApi(() => tmdb.animeList(category, language), [category, language]);

  const allItems = data.data ?? [];
  const totalPages = Math.ceil(allItems.length / itemsPerPage);
  const items = allItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const chip = (active: boolean) =>
    cn(
      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition',
      active
        ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
        : 'border-line bg-surface/70 text-muted hover:border-fuchsia-400/40 hover:text-fuchsia-300',
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => { setCategory(c.id); setCurrentPage(1); }}
            className={chip(category === c.id && language === 'all')}
          >
            <c.icon className="h-4 w-4" />
            {c.label}
          </button>
        ))}

        <span className="mx-1 hidden h-6 w-px bg-line sm:block" />

        <div className="flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-muted" />
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => { setLanguage(lang.id); setCurrentPage(1); }}
              className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                language === lang.id
                  ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                  : 'border-line bg-surface/70 text-muted hover:border-fuchsia-400/40 hover:text-fuchsia-300',
              )}
            >
              <span>{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          {allItems.length} resultados · Página {currentPage} de {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Mostrar:</span>
          {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => { setItemsPerPage(opt); setCurrentPage(1); }}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-semibold transition',
                itemsPerPage === opt
                  ? 'bg-brand text-white'
                  : 'bg-surface-2 text-muted hover:text-text',
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <MediaGrid
        items={items}
        loading={data.loading}
        error={data.error}
        onRetry={data.refetch}
        emptyTitle="Sin resultados"
        emptyDescription="No encontramos anime con estos filtros."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
