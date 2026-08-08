import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, Clock3, Disc3, ListMusic, Play } from 'lucide-react';
import { audius } from '../services/audius';
import { useApi } from '../hooks/useApi';
import { usePlayerStore } from '../store/playerStore';
import TrackList from '../components/TrackList';
import ErrorState from '../components/ErrorState';
import { TrackRowSkeleton } from '../components/Skeleton';
import { imageUrl } from '../utils/format';

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();

  const collection = useApi(() => audius.getPlaylist(id ?? ''), [id]);
  const tracks = useApi(() => audius.getPlaylistTracks(id ?? ''), [id]);

  if (collection.loading || tracks.loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="h-40 w-40 animate-pulse rounded-2xl bg-surface-2/70 sm:h-48 sm:w-48" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-32 animate-pulse rounded-lg bg-surface-2/70" />
            <div className="h-9 w-2/3 animate-pulse rounded-lg bg-surface-2/70" />
            <div className="h-4 w-1/3 animate-pulse rounded-lg bg-surface-2/70" />
          </div>
        </div>
        <div className="flex flex-col">
          {Array.from({ length: 6 }).map((_, i) => (
            <TrackRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (collection.error || tracks.error) {
    return (
      <ErrorState
        message={collection.error ?? tracks.error ?? undefined}
        onRetry={() => {
          collection.refetch();
          tracks.refetch();
        }}
      />
    );
  }

  const data = collection.data;
  const trackList = tracks.data ?? [];

  if (!data) {
    return <ErrorState />;
  }

  const isAlbum = data.is_album;
  const art = imageUrl(data.artwork, '480x480');
  const totalDuration = trackList.reduce((sum, t) => sum + (t.duration || 0), 0);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-64 w-64 rounded-full bg-sky-600/15 blur-3xl" />

        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand/20 shadow-2xl shadow-black/50 sm:h-48 sm:w-48">
            {art ? (
              <img src={art} alt={data.playlist_name} className="h-full w-full object-cover" />
            ) : (
              <Disc3 className="h-16 w-16 text-fuchsia-300/60" />
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-emerald-300 sm:justify-start">
              {isAlbum ? (
                <>
                  <Disc3 className="h-3.5 w-3.5" /> Álbum
                </>
              ) : (
                <>
                  <ListMusic className="h-3.5 w-3.5" /> Playlist
                </>
              )}
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">
              {data.playlist_name}
            </h1>
            {data.description && (
              <p className="mt-2 line-clamp-2 text-sm text-muted">{data.description}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted sm:justify-start">
              <Link
                to={`/artist/${data.user.id}`}
                className="flex items-center gap-1 font-semibold text-text transition hover:text-fuchsia-300"
              >
                {data.user.name}
                {data.user.is_verified && (
                  <BadgeCheck className="h-4 w-4 fill-accent text-bg" />
                )}
              </Link>
              <span className="text-faint">·</span>
              <span>
                {trackList.length} {trackList.length === 1 ? 'canción' : 'canciones'}
              </span>
              <span className="text-faint">·</span>
              <span>{Math.floor(totalDuration / 60)} min</span>
            </div>
            <div className="mt-5 flex justify-center sm:justify-start">
              <button
                onClick={() => {
                  if (trackList.length) usePlayerStore.getState().playFrom(trackList, 0);
                }}
                disabled={trackList.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-emerald-500/30 transition hover:scale-[1.03] hover:opacity-90 active:scale-95 disabled:opacity-40"
              >
                <Play className="h-4.5 w-4.5 fill-current" /> Reproducir
              </button>
            </div>
          </div>
        </div>
      </div>

      {trackList.length > 0 && (
        <div className="flex items-center gap-2 border-b border-line px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-faint">
          <span className="w-8 text-center">#</span>
          <span className="flex-1">Título</span>
          <span className="hidden items-center gap-1 sm:flex">
            <Clock3 className="h-3.5 w-3.5" /> Duración
          </span>
        </div>
      )}

      <TrackList
        tracks={trackList}
        onPlay={(index) => usePlayerStore.getState().playFrom(trackList, index)}
        skeletonCount={6}
      />
    </div>
  );
}
