import { useState } from 'react';
import { Flame, ShieldAlert, Star, TrendingUp, LayoutGrid, List } from 'lucide-react';
import type { TmdbCategory, TmdbKind } from '../../services/tmdb';
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

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 36, 48];

export default function CategoryGrid({ kind }: { kind: TmdbKind }) {
  const [category, setCategory] = useState<TmdbCategory>('trending');
  const [genreId, setGenreId] = useState<number | null>(null);
  const [adult, setAdult] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);

  const genres = useApi(() => tmdb.genres(kind), [kind]);
  const genreList = genres.data ?? [];

  const data = useApi(
    () => {
      if (genreId !== null || adult) {
        return tmdb.discover(kind, {
          genreId: genreId ?? undefined,
          adult,
          category,
        });
      }
      return tmdb.list(kind, category);
    },
    [kind, category, genreId, adult],
  );

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

  const selectGenre = (id: number | null) => {
    setGenreId(id);
    setCurrentPage(1);
    if (id !== null) setAdult(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => { setCategory(c.id); setCurrentPage(1); }}
            className={chip(category === c.id && genreId === null && !adult)}
          >
            <c.icon className="h-4 w-4" />
            {c.label}
          </button>
        ))}

        <span className="mx-1 hidden h-6 w-px bg-line sm:block" />

        <button
          onClick={() => {
            if (!adult) setGenreId(null);
            setAdult(!adult);
            setCurrentPage(1);
          }}
          aria-pressed={adult}
          className={cn(
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-bold transition',
            adult
              ? 'border-red-400/60 bg-red-500/15 text-red-300'
              : 'border-line bg-surface/70 text-muted hover:border-red-400/40 hover:text-red-300',
          )}
        >
          <ShieldAlert className="h-4 w-4" />
          +18
        </button>
      </div>

      <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
        <button
          onClick={() => selectGenre(null)}
          className={cn(
            chip(genreId === null && !adult),
            'shrink-0',
          )}
        >
          Todos
        </button>
        {genres.loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-surface-2/70"
            />
          ))}
        {!genres.loading &&
          genreList.map((g) => (
            <button
              key={g.id}
              onClick={() => selectGenre(g.id)}
              className={cn(chip(genreId === g.id), 'shrink-0')}
            >
              {g.name}
            </button>
          ))}
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
        emptyDescription="No encontramos contenido con estos filtros."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
