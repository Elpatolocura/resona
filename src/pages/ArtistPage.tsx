import { useParams } from 'react-router-dom';
import {
  BadgeCheck,
  Music2,
  User,
  Disc3,
  Play,
  Globe2,
  MapPin,
} from 'lucide-react';
import { audius } from '../services/audius';
import { useApi } from '../hooks/useApi';
import { usePlayerStore } from '../store/playerStore';
import TrackList from '../components/TrackList';
import ErrorState from '../components/ErrorState';
import { TrackRowSkeleton, CardGridSkeleton } from '../components/Skeleton';
import CollectionCard from '../components/CollectionCard';
import FollowButton from '../components/FollowButton';
import { formatCount, imageUrl } from '../utils/format';

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();

  const user = useApi(() => audius.getUser(id ?? ''), [id]);
  const tracks = useApi(() => audius.getUserTracks(id ?? ''), [id]);
  const albums = useApi(() => audius.getUserAlbums(id ?? ''), [id]);

  if (user.loading || tracks.loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end">
          <div className="h-40 w-40 animate-pulse rounded-full bg-surface-2/70 sm:h-44 sm:w-44" />
          <div className="flex-1 space-y-3">
            <div className="mx-auto h-6 w-32 animate-pulse rounded-lg bg-surface-2/70 sm:mx-0" />
            <div className="mx-auto h-10 w-64 animate-pulse rounded-lg bg-surface-2/70 sm:mx-0" />
            <div className="mx-auto h-4 w-40 animate-pulse rounded-lg bg-surface-2/70 sm:mx-0" />
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

  if (user.error) {
    return <ErrorState message={user.error} onRetry={user.refetch} />;
  }

  const artist = user.data;
  if (!artist) return <ErrorState />;

  const avatar = imageUrl(artist.profile_picture, '480x480');
  const cover = imageUrl(artist.cover_photo, '1000x1000');
  const trackList = tracks.data ?? [];
  const artistAlbums = albums.data ?? [];

  return (
    <div className="animate-fade-in space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="relative h-36 w-full overflow-hidden sm:h-48">
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-violet-900/60 via-fuchsia-900/50 to-amber-900/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
        </div>

        <div className="relative -mt-14 flex flex-col items-center gap-5 px-6 pb-8 sm:flex-row sm:items-end sm:px-8">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-brand/20 ring-4 ring-surface sm:h-32 sm:w-32">
            {avatar ? (
              <img src={avatar} alt={artist.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User className="h-10 w-10 text-fuchsia-300/60" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-300">
              Artista
            </p>
            <h1 className="mt-1 flex items-center justify-center gap-2 text-2xl font-black tracking-tight sm:justify-start sm:text-4xl">
              {artist.name}
              {artist.is_verified && <BadgeCheck className="h-7 w-7 fill-accent text-bg" />}
            </h1>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted sm:justify-start">
              <span>
                <span className="font-bold text-text">{formatCount(artist.follower_count)}</span>{' '}
                seguidores
              </span>
              {typeof artist.track_count === 'number' && (
                <>
                  <span className="text-faint">·</span>
                  <span>{artist.track_count} canciones</span>
                </>
              )}
              {artist.location && (
                <>
                  <span className="text-faint">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {artist.location}
                  </span>
                </>
              )}
            </div>
            {artist.bio && (
              <p className="mt-3 line-clamp-3 text-sm text-muted">{artist.bio}</p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-center gap-3 sm:items-end">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
              <button
                onClick={() => {
                  if (trackList.length) usePlayerStore.getState().playFrom(trackList, 0);
                }}
                disabled={trackList.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-xl shadow-fuchsia-500/30 transition hover:scale-[1.03] hover:opacity-90 active:scale-95 disabled:opacity-40"
              >
                <Play className="h-4.5 w-4.5 fill-current" /> Reproducir
              </button>
              <FollowButton artist={artist} />
            </div>
            <a
              href={`https://audius.co/${artist.handle}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-faint transition hover:text-fuchsia-300"
            >
              <Globe2 className="h-3.5 w-3.5" /> @{artist.handle}
            </a>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <Music2 className="h-5 w-5 text-fuchsia-300" /> Canciones
        </h2>
        {tracks.error ? (
          <ErrorState message={tracks.error} onRetry={tracks.refetch} compact />
        ) : trackList.length === 0 ? (
          <p className="text-sm text-faint">Este artista aún no ha publicado canciones.</p>
        ) : (
          <TrackList
            tracks={trackList}
            onPlay={(index) => usePlayerStore.getState().playFrom(trackList, index)}
            skeletonCount={6}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <Disc3 className="h-5 w-5 text-fuchsia-300" /> Álbumes
        </h2>
        {albums.loading ? (
          <CardGridSkeleton count={6} />
        ) : albums.error ? (
          <ErrorState message={albums.error} onRetry={albums.refetch} compact />
        ) : artistAlbums.length === 0 ? (
          <p className="text-sm text-faint">
            Este artista aún no ha publicado álbumes en Audius.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {artistAlbums.slice(0, 12).map((album) => (
              <CollectionCard key={album.id} collection={album} kind="album" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
