import { useState } from 'react';
import { ChevronRight, Film, Heart, Play, Sparkles, TrendingUp, Tv, UserRound, Disc3, ListMusic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { audius } from '../services/audius';
import { tmdb } from '../services/tmdb';
import { useApi } from '../hooks/useApi';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { toast } from '../store/toastStore';
import { imageUrl, uniqueBy, formatTime, isPlayable } from '../utils/format';
import SongCard from '../components/SongCard';
import ArtistCard from '../components/ArtistCard';
import CollectionCard from '../components/CollectionCard';
import MediaGrid from '../components/media/MediaGrid';
import { CardGridSkeleton } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';
import { cn } from '../utils/format';
import type { AudiusTrack, AudiusUser } from '../types';

export default function HomePage() {
  const trending = useApi(() => audius.trendingTracks('week'), []);
  const underground = useApi(() => audius.trendingUnderground(), []);
  const albums = useApi(() => audius.trendingPlaylists('album'), []);
  const playlists = useApi(() => audius.trendingPlaylists('playlist'), []);
  const movies = useApi(() => tmdb.list('movie', 'trending'), []);
  const series = useApi(() => tmdb.list('tv', 'trending'), []);

  const recommended = trending.data ?? [];
  const heroTrack = trending.data?.[0];
  const artists: AudiusUser[] = uniqueBy(
    [...recommended, ...(underground.data ?? [])].map((t) => t.user).filter(Boolean),
    (u) => u.id,
  ).slice(0, 12);

  const playList = (tracks: AudiusTrack[]) => {
    if (tracks.length) usePlayerStore.getState().playFrom(tracks, 0);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <Hero
        track={heroTrack}
        loading={trending.loading}
        onPlay={() => playList(recommended)}
      />

      <Section
        title="Canciones recomendadas"
        subtitle="Lo más escuchado esta semana en la red Audius"
        icon={TrendingUp}
        action={
          recommended.length > 0 ? (
            <button
              onClick={() => playList(recommended)}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-90 active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Reproducir todas
            </button>
          ) : undefined
        }
      >
        {trending.loading ? (
          <CardGridSkeleton count={12} />
        ) : trending.error ? (
          <ErrorState message={trending.error} onRetry={trending.refetch} compact />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {recommended.map((track) => (
              <SongCard
                key={track.id}
                track={track}
                onPlay={(t) => {
                  const idx = recommended.findIndex((x) => x.id === t.id);
                  usePlayerStore.getState().playFrom(recommended, Math.max(0, idx));
                }}
              />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Artistas populares"
        subtitle="Creadores que están dando que hablar"
        icon={UserRound}
        action={
          artists.length > 0 ? (
            <Link
              to="/search"
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-muted transition hover:text-fuchsia-300"
            >
              Ver todos <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : undefined
        }
      >
        {trending.loading && underground.loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 w-40 shrink-0 animate-pulse rounded-2xl bg-surface-2/70" />
            ))}
          </div>
        ) : (
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
            {artists.map((artist) => (
              <ArtistCard key={artist.id} user={artist} />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Películas en tendencia"
        subtitle="Lo más visto esta semana en TMDB"
        icon={Film}
        action={
          <Link
            to="/movies"
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-muted transition hover:text-fuchsia-300"
          >
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <MediaGrid
          items={movies.data ?? []}
          loading={movies.loading}
          error={movies.error}
          onRetry={movies.refetch}
          skeletonCount={6}
          emptyTitle="Sin películas"
        />
      </Section>

      <Section
        title="Series en tendencia"
        subtitle="Lo más visto esta semana en TMDB"
        icon={Tv}
        action={
          <Link
            to="/tv"
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-muted transition hover:text-fuchsia-300"
          >
            Ver todas <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <MediaGrid
          items={series.data ?? []}
          loading={series.loading}
          error={series.error}
          onRetry={series.refetch}
          skeletonCount={6}
          emptyTitle="Sin series"
        />
      </Section>

      <Section
        title="Álbumes en tendencia"
        subtitle="Colecciones destacadas de la comunidad"
        icon={Disc3}
      >
        {albums.loading ? (
          <CardGridSkeleton count={8} />
        ) : albums.error ? (
          <ErrorState message={albums.error} onRetry={albums.refetch} compact />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {(albums.data ?? []).slice(0, 12).map((album) => (
              <CollectionCard key={album.id} collection={album} kind="album" />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Playlists destacadas"
        subtitle="Mezclas curadas por la comunidad"
        icon={ListMusic}
      >
        {playlists.loading ? (
          <CardGridSkeleton count={8} />
        ) : playlists.error ? (
          <ErrorState message={playlists.error} onRetry={playlists.refetch} compact />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {(playlists.data ?? []).slice(0, 12).map((playlist) => (
              <CollectionCard key={playlist.id} collection={playlist} kind="playlist" />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: typeof TrendingUp;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight sm:text-xl">
            <Icon className="h-5 w-5 text-fuchsia-300" />
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted sm:text-sm">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Hero({
  track,
  loading,
  onPlay,
}: {
  track?: AudiusTrack;
  loading: boolean;
  onPlay: () => void;
}) {
  const isPlaying = usePlayerStore((s) => s.isPlaying && s.currentTrack?.id === track?.id);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const favorites = useLibraryStore((s) => s.favorites);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const [ready, setReady] = useState(false);
  const art = track ? imageUrl(track.artwork, '1000x1000') : null;
  const isFav = track ? favorites.some((f) => f.id === track.id) : false;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-600/40 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <div className="h-40 w-40 overflow-hidden rounded-2xl shadow-2xl shadow-black/50 sm:h-48 sm:w-48">
            {loading || !track ? (
              <div className="h-full w-full animate-pulse bg-surface-3" />
            ) : art ? (
              <img
                src={art}
                alt={track.title}
                onLoad={() => setReady(true)}
                className={cn('h-full w-full object-cover transition-all duration-700', ready ? 'scale-100 blur-0' : 'scale-105 blur-md')}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-brand/25">
                <Sparkles className="h-12 w-12 text-fuchsia-300/70" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-3 -right-3 rounded-2xl bg-brand px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-fuchsia-500/40">
            Destacado
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-300">
            Bienvenido a Resona
          </p>
          {loading || !track ? (
            <div className="mt-3 space-y-3">
              <div className="h-8 w-3/4 animate-pulse rounded-lg bg-surface-3" />
              <div className="h-4 w-1/3 animate-pulse rounded-lg bg-surface-3" />
            </div>
          ) : (
            <>
              <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight sm:text-4xl">
                {track.title}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                <Link to={`/artist/${track.user.id}`} className="transition hover:text-fuchsia-300">
                  {track.user.name}
                </Link>
                <span className="text-faint">·</span>
                <span className="tabular-nums">{formatTime(track.duration)}</span>
                {track.genre && (
                  <>
                    <span className="text-faint">·</span>
                    <span className="rounded-full border border-line px-2 py-0.5 text-[11px] capitalize">
                      {track.genre}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-5 flex items-center gap-3">
                {isPlayable(track) && (
                  <button
                    onClick={() => (isPlaying ? togglePlay() : onPlay())}
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-xl shadow-fuchsia-500/30 transition hover:scale-[1.03] hover:opacity-90 active:scale-95"
                  >
                    <Play className="h-4.5 w-4.5 fill-current" />
                    {isPlaying ? 'Pausar' : 'Reproducir'}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!track) return;
                    toggleFavorite(track);
                    toast(
                      isFav ? 'Quitado de favoritos' : 'Añadido a favoritos',
                      isFav ? 'info' : 'success',
                    );
                  }}
                  aria-label="Añadir a favoritos"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bg/40 text-muted backdrop-blur transition hover:border-fuchsia-400/40 hover:text-fuchsia-300"
                >
                  <Heart className={cn('h-5 w-5', isFav && 'fill-accent-2 text-accent-2')} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
