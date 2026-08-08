import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  Heart,
  Library,
  ListMusic,
  Mic2,
  Plus,
  Search,
  Trash2,
  Play,
  UserRound,
} from 'lucide-react';
import { useLibraryStore } from '../store/libraryStore';
import { useMediaStore } from '../store/mediaStore';
import { usePlayerStore } from '../store/playerStore';
import { toast } from '../store/toastStore';
import { useApi } from '../hooks/useApi';
import { useDebounce } from '../hooks/useDebounce';
import { audius } from '../services/audius';
import { formatCount, imageUrl } from '../utils/format';
import type { AudiusTrack, AudiusUser, LocalPlaylist, MusicMedia } from '../types';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import FollowButton from '../components/FollowButton';
import WatchHistory from '../components/media/WatchHistory';

function playPlaylist(playlist: LocalPlaylist) {
  const tracks: AudiusTrack[] = playlist.tracks
    .filter((m): m is MusicMedia => m.kind === 'music')
    .map((m) => m.track);
  if (tracks.length) usePlayerStore.getState().playFrom(tracks, 0);
}

export default function LibraryPage() {
  const playlists = useLibraryStore((s) => s.playlists);
  const favorites = useLibraryStore((s) => s.favorites);
  const artists = useLibraryStore((s) => s.artists);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);
  const vodFavorites = useMediaStore((s) => s.vodFavorites);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LocalPlaylist | null>(null);

  const [artistQuery, setArtistQuery] = useState('');
  const debouncedArtistQuery = useDebounce(artistQuery, 400);
  const activeArtistSearch = debouncedArtistQuery.trim().length >= 2;
  const artistResults = useApi(
    () =>
      activeArtistSearch
        ? audius.searchUsers(debouncedArtistQuery.trim())
        : Promise.resolve([]),
    [debouncedArtistQuery],
  );

  const scrollToArtists = () => {
    document.getElementById('artistas')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Tu biblioteca</h1>
        <p className="mt-1 text-sm text-muted">
          Tus favoritos, artistas, playlists e historial se guardan en este dispositivo.
        </p>
      </div>

      <WatchHistory />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/favorites"
          className="group relative flex h-40 flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-400/40 hover:shadow-xl hover:shadow-fuchsia-500/10"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-500/20 blur-2xl transition-opacity group-hover:opacity-100" />
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold">Canciones favoritas</p>
            <p className="text-xs text-muted">
              {favorites.length} canciones
              {vodFavorites.length > 0 ? ` · ${vodFavorites.length} videos` : ''}
            </p>
          </div>
        </Link>

        <button
          onClick={scrollToArtists}
          className="group relative flex h-40 flex-col justify-between overflow-hidden rounded-3xl border border-line bg-surface p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-400/40 hover:shadow-xl hover:shadow-fuchsia-500/10"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-fuchsia-500/15 blur-2xl transition-opacity group-hover:opacity-100" />
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500/15 text-fuchsia-300">
            <Mic2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold">Artistas</p>
            <p className="text-xs text-muted">{artists.length} seguidos</p>
          </div>
        </button>

        <div
          onClick={() => setCreateOpen(true)}
          className="group relative flex h-40 cursor-pointer flex-col justify-between rounded-3xl border border-dashed border-line bg-surface/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-400/40 hover:bg-surface hover:shadow-xl hover:shadow-fuchsia-500/10"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/15 text-fuchsia-300">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold">Nueva playlist</p>
            <p className="text-xs text-muted">Organiza tu música favorita</p>
          </div>
        </div>
      </div>

      <section id="artistas" className="scroll-mt-24 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Mic2 className="h-5 w-5 text-fuchsia-300" /> Artistas
          </h2>
          <span className="text-xs text-muted">{artists.length} seguidos</span>
        </div>

        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={artistQuery}
            onChange={(e) => setArtistQuery(e.target.value)}
            placeholder="Buscar artistas para seguir…"
            className="w-full rounded-full border border-line bg-surface/80 py-3 pl-11 pr-4 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50 focus:bg-surface focus:ring-2 focus:ring-fuchsia-500/20"
          />
        </div>

        {activeArtistSearch && (
          <div className="space-y-1">
            {artistResults.loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-surface-2/70" />
              ))
            ) : artistResults.error ? (
              <p className="text-sm text-red-300">{artistResults.error}</p>
            ) : (artistResults.data ?? []).length === 0 ? (
              <p className="text-sm text-faint">No se encontraron artistas.</p>
            ) : (
              (artistResults.data ?? []).slice(0, 8).map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-surface-2"
                >
                  <Link to={`/artist/${artist.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <ArtistAvatar artist={artist} />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1 truncate text-sm font-semibold text-text">
                        <span className="truncate">{artist.name}</span>
                        {artist.is_verified && (
                          <BadgeCheck className="h-4 w-4 shrink-0 fill-accent text-bg" />
                        )}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {formatCount(artist.follower_count)} seguidores
                      </p>
                    </div>
                  </Link>
                  <FollowButton artist={artist} size="sm" />
                </div>
              ))
            )}
          </div>
        )}

        {artists.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="Aún no sigues a ningún artista"
            description="Busca artistas arriba y toca «Seguir» para guardarlos aquí."
            compact
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface/60 p-3 transition-colors hover:bg-surface-2"
              >
                <Link to={`/artist/${artist.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <ArtistAvatar artist={artist} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate text-sm font-semibold text-text">
                      <span className="truncate">{artist.name}</span>
                      {artist.is_verified && (
                        <BadgeCheck className="h-4 w-4 shrink-0 fill-accent text-bg" />
                      )}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {formatCount(artist.follower_count)} seguidores
                    </p>
                  </div>
                </Link>
                <FollowButton artist={artist} size="sm" />
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <ListMusic className="h-5 w-5 text-fuchsia-300" /> Tus playlists
          </h2>
          {playlists.length > 0 && (
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-90 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva
            </button>
          )}
        </div>

        {playlists.length === 0 ? (
          <EmptyState
            icon={Library}
            title="Aún no tienes playlists"
            description="Crea una playlist y añade canciones desde cualquier parte de la app."
            action={
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90 active:scale-95"
              >
                <Plus className="h-4 w-4" /> Crear playlist
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-surface/60 p-3 transition-colors hover:bg-surface-2"
              >
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand/20">
                  <ListMusic className="h-6 w-6 text-fuchsia-300/70" />
                  {playlist.tracks.length > 0 && (
                    <button
                      onClick={() => playPlaylist(playlist)}
                      aria-label="Reproducir playlist"
                      className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition group-hover:opacity-100"
                    >
                      <Play className="h-5 w-5 fill-white text-white" />
                    </button>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/playlist/${playlist.id}`}
                    className="block truncate text-sm font-bold text-text transition hover:text-fuchsia-300"
                  >
                    {playlist.name}
                  </Link>
                  <p className="truncate text-xs text-muted">
                    {playlist.tracks.length}{' '}
                    {playlist.tracks.length === 1 ? 'elemento' : 'elementos'}
                    {playlist.description ? ` · ${playlist.description}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => setDeleteTarget(playlist)}
                  aria-label="Eliminar playlist"
                  className="rounded-full p-2 text-muted transition hover:bg-red-500/15 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreatePlaylistModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar playlist"
        message={`¿Seguro que quieres eliminar la playlist «${deleteTarget?.name}»? Esta acción no se puede deshacer.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deletePlaylist(deleteTarget.id);
            toast('Playlist eliminada', 'info');
          }
        }}
      />
    </div>
  );
}

function ArtistAvatar({ artist }: { artist: AudiusUser }) {
  const avatar = imageUrl(artist.profile_picture, '150x150');
  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-brand/20">
      {avatar ? (
        <img src={avatar} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <UserRound className="h-5 w-5 text-fuchsia-300/60" />
        </div>
      )}
    </div>
  );
}
