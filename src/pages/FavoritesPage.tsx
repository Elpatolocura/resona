import { useState } from 'react';
import { Film, Heart, Music2, Play, Tv } from 'lucide-react';
import { useLibraryStore } from '../store/libraryStore';
import { useMediaStore } from '../store/mediaStore';
import { usePlayerStore } from '../store/playerStore';
import TrackList from '../components/TrackList';
import MediaGrid from '../components/media/MediaGrid';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import type { AudiusTrack, MediaVod } from '../types';
import { cn } from '../utils/format';

type Filter = 'all' | 'music' | 'movie' | 'tv';

const FILTERS: { id: Filter; label: string; icon: typeof Heart }[] = [
  { id: 'all', label: 'Todo', icon: Heart },
  { id: 'music', label: 'Música', icon: Music2 },
  { id: 'movie', label: 'Películas', icon: Film },
  { id: 'tv', label: 'Series', icon: Tv },
];

export default function FavoritesPage() {
  const favorites = useLibraryStore((s) => s.favorites);
  const removeFavorite = useLibraryStore((s) => s.toggleFavorite);
  const vodFavorites = useMediaStore((s) => s.vodFavorites);
  const removeVodFavorite = useMediaStore((s) => s.toggleVodFavorite);

  const [filter, setFilter] = useState<Filter>('all');
  const [removeTrack, setRemoveTrack] = useState<AudiusTrack | null>(null);
  const [removeVod, setRemoveVod] = useState<MediaVod | null>(null);

  const total = favorites.length + vodFavorites.length;

  const play = (index: number, track: AudiusTrack) => {
    usePlayerStore.getState().playFrom(favorites, index);
  };

  const movies = vodFavorites.filter((v) => v.kind === 'movie');
  const series = vodFavorites.filter((v) => v.kind === 'tv');

  const showMusic = filter === 'all' || filter === 'music';
  const showVod = filter === 'all' || filter === 'movie' || filter === 'tv';
  const vodItems = filter === 'movie' ? movies : filter === 'tv' ? series : vodFavorites;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-rose-500/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/30 to-fuchsia-600/30 shadow-xl sm:h-36 sm:w-36">
            <Heart className="h-12 w-12 fill-rose-400 text-rose-400 sm:h-16 sm:w-16" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-rose-300">
              Tu biblioteca
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">Favoritos</h1>
            <p className="mt-1 text-sm text-muted">
              {total} {total === 1 ? 'elemento' : 'elementos'} guardados
            </p>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={() => play(0, favorites[0])}
              className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-rose-500/30 transition hover:scale-[1.03] hover:opacity-90 active:scale-95"
            >
              <Play className="h-4.5 w-4.5 fill-current" /> Reproducir canciones
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition',
              filter === id
                ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                : 'border-line bg-surface/70 text-muted hover:border-fuchsia-400/40 hover:text-fuchsia-300',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className="text-xs text-faint">
              {id === 'all'
                ? total
                : id === 'music'
                  ? favorites.length
                  : id === 'movie'
                    ? movies.length
                    : series.length}
            </span>
          </button>
        ))}
      </div>

      {total === 0 ? (
        <EmptyState
          icon={Heart}
          title="No tienes favoritos todavía"
          description="Toca el corazón en cualquier canción, película o serie para guardarla aquí."
        />
      ) : (
        <>
          {showMusic && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-faint">
                <Music2 className="h-4 w-4" /> Canciones
              </h2>
              {favorites.length === 0 ? (
                <p className="text-sm text-faint">Sin canciones favoritas.</p>
              ) : (
                <TrackList
                  tracks={favorites}
                  onPlay={play}
                  canRemove={(track) => setRemoveTrack(track)}
                  removeTitle="Quitar de favoritos"
                />
              )}
            </div>
          )}

          {showVod && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-faint">
                {filter === 'movie' ? <Film className="h-4 w-4" /> : filter === 'tv' ? <Tv className="h-4 w-4" /> : <Heart className="h-4 w-4" />}{' '}
                {filter === 'movie' ? 'Películas' : filter === 'tv' ? 'Series' : 'Películas y series'}
              </h2>
              {vodItems.length === 0 ? (
                <p className="text-sm text-faint">
                  {filter === 'all'
                    ? 'Aún no has guardado películas o series.'
                    : 'Sin contenido favorito en esta categoría.'}
                </p>
              ) : (
                <MediaGrid
                  items={vodItems}
                  onRemove={(vod) => setRemoveVod(vod)}
                  emptyTitle="Sin contenido"
                />
              )}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={removeTrack !== null}
        title="Quitar de favoritos"
        message={`¿Quitar «${removeTrack?.title}» de tus canciones favoritas?`}
        confirmLabel="Quitar"
        onClose={() => setRemoveTrack(null)}
        onConfirm={() => {
          if (removeTrack) removeFavorite(removeTrack);
        }}
      />

      <ConfirmDialog
        open={removeVod !== null}
        title="Quitar de favoritos"
        message={`¿Quitar «${removeVod?.title}» de tus favoritos?`}
        confirmLabel="Quitar"
        onClose={() => setRemoveVod(null)}
        onConfirm={() => {
          if (removeVod) removeVodFavorite(removeVod);
        }}
      />
    </div>
  );
}
