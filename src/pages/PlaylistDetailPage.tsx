import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clapperboard, ListMusic, Music2, Play, Plus, Search } from 'lucide-react';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { audius } from '../services/audius';
import { tmdb } from '../services/tmdb';
import { toast } from '../store/toastStore';
import type { AudiusTrack, Media, MediaVod } from '../types';
import MediaList from '../components/media/MediaList';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { imageUrl } from '../utils/format';
import { cn } from '../utils/format';
import { vodMediaTypeLabel } from '../utils/media';

type AddTab = 'songs' | 'media';

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playlists = useLibraryStore((s) => s.playlists);
  const removeFromPlaylist = useLibraryStore((s) => s.removeFromPlaylist);

  const playlist = playlists.find((p) => p.id === id);

  const [adding, setAdding] = useState(false);
  const [addTab, setAddTab] = useState<AddTab>('songs');
  const [search, setSearch] = useState('');
  const [removeTarget, setRemoveTarget] = useState<Media | null>(null);
  const debounced = useDebounce(search, 400);
  const active = debounced.trim().length >= 2;

  const songResults = useApi(
    () => (active ? audius.searchTracks(debounced.trim()) : Promise.resolve([])),
    [debounced, addTab],
  );
  const mediaResults = useApi(
    () => (active ? tmdb.searchMulti(debounced.trim()) : Promise.resolve([])),
    [debounced, addTab],
  );

  const existingIds = useMemo(
    () => new Set(playlist?.tracks.map((t) => t.id) ?? []),
    [playlist?.tracks],
  );

  if (!playlist) {
    return (
      <div className="animate-fade-in">
        <EmptyState
          icon={ListMusic}
          title="Playlist no encontrada"
          description="Es posible que se haya eliminado."
          action={
            <button
              onClick={() => navigate('/playlists')}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              <ArrowLeft className="h-4 w-4" /> Ir a playlists
            </button>
          }
        />
      </div>
    );
  }

  const musicTracks: AudiusTrack[] = playlist.tracks
    .filter((m): m is Extract<Media, { kind: 'music' }> => m.kind === 'music')
    .map((m) => m.track);

  const play = (musicIndex: number) => {
    if (musicTracks.length) usePlayerStore.getState().playFrom(musicTracks, musicIndex);
  };

  const duration = playlist.tracks.reduce(
    (sum, m) => sum + (m.kind === 'music' ? m.duration : 0),
    0,
  );
  const firstMusic = playlist.tracks.find((m) => m.kind === 'music');
  const firstVod = playlist.tracks.find((m) => m.kind !== 'music');
  const cover = firstMusic
    ? (imageUrl(firstMusic.track.artwork) as string | null)
    : (firstVod as MediaVod | undefined)?.poster ?? null;

  return (
    <div className="animate-fade-in space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-fuchsia-600/20 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand/20 shadow-2xl shadow-black/50 sm:h-48 sm:w-48">
            {cover ? (
              <img src={cover} alt="" className="h-full w-full object-cover" />
            ) : (
              <ListMusic className="h-16 w-16 text-fuchsia-300/60" />
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-300">
              Playlist local
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="mt-2 text-sm text-muted">{playlist.description}</p>
            )}
            <p className="mt-2 text-xs text-faint">
              {playlist.tracks.length} {playlist.tracks.length === 1 ? 'elemento' : 'elementos'}
              {duration > 0 ? ` · ${Math.floor(duration / 60)} min de música` : ''}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <button
                onClick={() => play(0)}
                disabled={musicTracks.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-xl shadow-fuchsia-500/30 transition hover:scale-[1.03] hover:opacity-90 active:scale-95 disabled:opacity-40"
              >
                <Play className="h-4.5 w-4.5 fill-current" /> Reproducir canciones
              </button>
              <button
                onClick={() => setAdding((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-bg/40 px-5 py-3 text-sm font-semibold text-muted backdrop-blur transition hover:border-fuchsia-400/40 hover:text-fuchsia-300"
              >
                <Plus className="h-4 w-4" /> Añadir contenido
              </button>
            </div>
          </div>
        </div>
      </div>

      {adding && (
        <section className="space-y-4 rounded-3xl border border-line bg-surface/60 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAddTab('songs')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition',
                addTab === 'songs'
                  ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                  : 'border-line bg-surface/70 text-muted hover:border-fuchsia-400/40 hover:text-fuchsia-300',
              )}
            >
              <Music2 className="h-4 w-4" /> Canciones
            </button>
            <button
              onClick={() => setAddTab('media')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition',
                addTab === 'media'
                  ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                  : 'border-line bg-surface/70 text-muted hover:border-fuchsia-400/40 hover:text-fuchsia-300',
              )}
            >
              <Clapperboard className="h-4 w-4" /> Películas y series
            </button>
          </div>

          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                addTab === 'songs'
                  ? 'Escribe el nombre de una canción…'
                  : 'Escribe el nombre de una película o serie…'
              }
              className="w-full rounded-full border border-line bg-bg py-3 pl-11 pr-4 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
            />
          </div>

          {addTab === 'songs' ? (
            <SongResults
              results={songResults}
              active={active}
              existingIds={existingIds}
              playlistId={playlist.id}
            />
          ) : (
            <MediaResults
              results={mediaResults}
              active={active}
              existingIds={existingIds}
              playlistId={playlist.id}
            />
          )}
        </section>
      )}

      <div>
        {playlist.tracks.length === 0 ? (
          <EmptyState
            icon={ListMusic}
            title="Esta playlist está vacía"
            description="Usa «Añadir contenido» para incluir canciones, películas o series."
            compact
          />
        ) : (
          <MediaList
            items={playlist.tracks}
            onPlayMusic={(i) => play(i)}
            canRemove={(media) => setRemoveTarget(media)}
            removeTitle="Quitar de la playlist"
            emptyTitle="Esta playlist está vacía"
          />
        )}
      </div>

      <ConfirmDialog
        open={removeTarget !== null}
        title="Quitar elemento"
        message={`¿Quitar «${removeTarget?.title}» de la playlist «${playlist.name}»?`}
        confirmLabel="Quitar"
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget && playlist) {
            removeFromPlaylist(playlist.id, removeTarget.id);
            toast('Elemento eliminado', 'info');
          }
        }}
      />
    </div>
  );
}

function SongResults({
  results,
  active,
  existingIds,
  playlistId,
}: {
  results: { data: AudiusTrack[] | null; loading: boolean; error: string | null; refetch: () => void };
  active: boolean;
  existingIds: Set<string>;
  playlistId: string;
}) {
  if (results.error) {
    return <ErrorState message={results.error} onRetry={results.refetch} compact />;
  }
  if (results.loading) {
    return (
      <div className="flex flex-col">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-2/70" />
        ))}
      </div>
    );
  }
  if ((results.data ?? []).length === 0) {
    return (
      <p className="text-sm text-faint">
        {active ? 'Sin resultados.' : 'Escribe al menos 2 caracteres para buscar.'}
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      {(results.data ?? []).slice(0, 8).map((track) => {
        const added = existingIds.has(`track:${track.id}`);
        return (
          <div
            key={track.id}
            className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-surface-2"
          >
            {track.artwork ? (
              <img
                src={imageUrl(track.artwork, '150x150') ?? ''}
                alt=""
                className="h-9 w-9 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/20">
                <ListMusic className="h-4 w-4 text-fuchsia-300/60" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">{track.title}</p>
              <p className="truncate text-xs text-muted">{track.user?.name}</p>
            </div>
            <button
              onClick={() => {
                if (added) return;
                useLibraryStore.getState().addToPlaylist(playlistId, track);
                toast('Canción añadida a la playlist');
              }}
              disabled={added}
              className="shrink-0 rounded-full border border-line px-3 py-1.5 text-xs font-semibold transition hover:border-fuchsia-400/50 hover:text-fuchsia-300 disabled:opacity-40"
            >
              {added ? 'Añadida' : 'Añadir'}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function MediaResults({
  results,
  active,
  existingIds,
  playlistId,
}: {
  results: { data: MediaVod[] | null; loading: boolean; error: string | null; refetch: () => void };
  active: boolean;
  existingIds: Set<string>;
  playlistId: string;
}) {
  if (results.error) {
    return <ErrorState message={results.error} onRetry={results.refetch} compact />;
  }
  if (results.loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-surface-2/70" />
        ))}
      </div>
    );
  }
  if ((results.data ?? []).length === 0) {
    return (
      <p className="text-sm text-faint">
        {active ? 'Sin resultados.' : 'Escribe al menos 2 caracteres para buscar.'}
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {(results.data ?? []).slice(0, 10).map((media) => {
        const added = existingIds.has(media.id);
        return (
          <div
            key={media.id}
            className="group flex flex-col rounded-2xl bg-surface/70 p-2.5 transition hover:bg-surface-2"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-brand/20">
              {media.poster ? (
                <img src={media.poster} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Clapperboard className="h-8 w-8 text-fuchsia-300/60" />
                </div>
              )}
            </div>
            <p className="mt-2 truncate px-0.5 text-sm font-semibold text-text" title={media.title}>
              {media.title}
            </p>
            <p className="truncate px-0.5 text-[11px] text-muted">
              {media.year ?? '—'} · {vodMediaTypeLabel(media)}
            </p>
            <button
              onClick={() => {
                if (added) return;
                useLibraryStore.getState().addMediaToPlaylist(playlistId, media);
                toast('Añadido a la playlist');
              }}
              disabled={added}
              className="mt-2 rounded-full border border-line px-3 py-1.5 text-xs font-semibold transition hover:border-fuchsia-400/50 hover:text-fuchsia-300 disabled:opacity-40"
            >
              {added ? 'Añadido' : 'Añadir'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
