import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Film, ListMusic, Music2, Search, TrendingUp, Tv, Swords, UserRound, Disc3 } from 'lucide-react';
import { audius } from '../services/audius';
import { tmdb } from '../services/tmdb';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { usePlayerStore } from '../store/playerStore';
import SearchBar from '../components/SearchBar';
import TrackList from '../components/TrackList';
import ArtistCard from '../components/ArtistCard';
import CollectionCard from '../components/CollectionCard';
import MediaGrid from '../components/media/MediaGrid';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import type { AudiusTrack } from '../types';

const SUGGESTIONS = [
  'electronic',
  'hip hop',
  'lofi',
  'rock',
  'ambient',
  'house',
  'jazz',
  'trap',
  'r&b',
  'techno',
];

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get('q') ?? '';
  const [input, setInput] = useState(query);
  const debounced = useDebounce(input, 400);

  useEffect(() => {
    setInput(query);
  }, [query]);

  useEffect(() => {
    const clean = debounced.trim();
    const current = query;
    if (clean === current) return;
    if (clean) {
      navigate(`/search?q=${encodeURIComponent(clean)}`, { replace: true });
    } else {
      navigate('/search', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const active = query.trim().length >= 2;

  const tracks = useApi(
    () => (active ? audius.searchTracks(query.trim()) : Promise.resolve([])),
    [query],
  );
  const users = useApi(
    () => (active ? audius.searchUsers(query.trim()) : Promise.resolve([])),
    [query],
  );
  const collections = useApi(
    () => (active ? audius.searchPlaylists(query.trim()) : Promise.resolve([])),
    [query],
  );
  const mediaResults = useApi(
    () => (active ? tmdb.searchMulti(query.trim()) : Promise.resolve([])),
    [query],
  );

  const albums = (collections.data ?? []).filter((c) => c.is_album);
  const playlists = (collections.data ?? []).filter((c) => !c.is_album);
  const mediaItems = mediaResults.data ?? [];
  const movieResults = mediaItems.filter((m) => m.kind === 'movie');
  const tvResults = mediaItems.filter((m) => m.kind === 'tv');
  const animeResults = mediaItems.filter((m) => m.kind === 'anime');

  const playSearch = (index: number, track: AudiusTrack) => {
    usePlayerStore.getState().playFrom(tracks.data ?? [], index);
  };

  if (!active) {
    return (
      <div className="mx-auto max-w-2xl animate-fade-in space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
            ¿Qué quieres escuchar hoy?
          </h1>
          <p className="mt-2 text-sm text-muted">
            Busca canciones, artistas, álbumes, playlists, películas y series en un solo lugar.
          </p>
        </div>
        <SearchBar
          large
          autoFocus
          defaultValue={input}
          onSearch={(q) => setInput(q)}
        />
        <div>
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-faint">
            <TrendingUp className="h-3.5 w-3.5" /> Tendencias
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setInput(s);
                  navigate(`/search?q=${encodeURIComponent(s)}`);
                }}
                className="rounded-full border border-line bg-surface/70 px-4 py-2 text-sm font-medium text-muted transition hover:border-fuchsia-400/50 hover:text-fuchsia-300"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tracksLoading = tracks.loading || tracks.data === null;

  return (
    <div className="animate-fade-in space-y-10">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-black tracking-tight sm:text-2xl">
          <Search className="h-5 w-5 text-fuchsia-300" />
          Resultados para «{query.trim()}»
        </h1>
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-faint">
          <Music2 className="h-4 w-4" /> Canciones
        </h2>
        {tracks.error ? (
          <ErrorState message={tracks.error} onRetry={tracks.refetch} compact />
        ) : (
          <TrackList
            tracks={tracks.data ?? []}
            loading={tracksLoading}
            onPlay={playSearch}
            emptyTitle="Sin resultados"
            emptyDescription="No encontramos canciones con ese nombre."
            skeletonCount={6}
          />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-faint">
          <Film className="h-4 w-4" /> Películas
        </h2>
        {mediaResults.error ? (
          <ErrorState message={mediaResults.error} onRetry={mediaResults.refetch} compact />
        ) : mediaResults.loading ? (
          <MediaGrid loading skeletonCount={6} />
        ) : movieResults.length === 0 ? (
          <p className="text-sm text-faint">Sin películas coincidentes.</p>
        ) : (
          <MediaGrid items={movieResults.slice(0, 12)} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-faint">
          <Tv className="h-4 w-4" /> Series
        </h2>
        {mediaResults.error ? (
          <ErrorState message={mediaResults.error} onRetry={mediaResults.refetch} compact />
        ) : mediaResults.loading ? (
          <MediaGrid loading skeletonCount={6} />
        ) : tvResults.length === 0 ? (
          <p className="text-sm text-faint">Sin series coincidentes.</p>
        ) : (
          <MediaGrid items={tvResults.slice(0, 12)} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-faint">
          <Swords className="h-4 w-4" /> Anime
        </h2>
        {mediaResults.error ? (
          <ErrorState message={mediaResults.error} onRetry={mediaResults.refetch} compact />
        ) : mediaResults.loading ? (
          <MediaGrid loading skeletonCount={6} />
        ) : animeResults.length === 0 ? (
          <p className="text-sm text-faint">Sin anime coincidentes.</p>
        ) : (
          <MediaGrid items={animeResults.slice(0, 12)} />
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-faint">
          <UserRound className="h-4 w-4" /> Artistas
        </h2>
        {users.error ? (
          <ErrorState message={users.error} onRetry={users.refetch} compact />
        ) : users.loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 w-40 shrink-0 animate-pulse rounded-2xl bg-surface-2/70" />
            ))}
          </div>
        ) : (users.data ?? []).length === 0 ? (
          <p className="text-sm text-faint">Sin artistas coincidentes.</p>
        ) : (
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
            {(users.data ?? []).map((user) => (
              <ArtistCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-faint">
          <Disc3 className="h-4 w-4" /> Álbumes
        </h2>
        {collections.error ? (
          <ErrorState message={collections.error} onRetry={collections.refetch} compact />
        ) : collections.loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-surface-2/70" />
            ))}
          </div>
        ) : albums.length === 0 ? (
          <p className="text-sm text-faint">Sin álbumes coincidentes.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {albums.slice(0, 10).map((album) => (
              <CollectionCard key={album.id} collection={album} kind="album" />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-faint">
          <ListMusic className="h-4 w-4" /> Playlists
        </h2>
        {collections.error ? (
          <ErrorState message={collections.error} onRetry={collections.refetch} compact />
        ) : collections.loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-surface-2/70" />
            ))}
          </div>
        ) : playlists.length === 0 ? (
          <p className="text-sm text-faint">Sin playlists coincidentes.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {playlists.slice(0, 10).map((playlist) => (
              <CollectionCard key={playlist.id} collection={playlist} kind="playlist" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
