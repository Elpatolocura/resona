import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListMusic, Plus, Play } from 'lucide-react';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { toast } from '../store/toastStore';
import type { AudiusTrack, LocalPlaylist, MusicMedia } from '../types';
import CreatePlaylistModal from '../components/CreatePlaylistModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';

function playPlaylist(playlist: LocalPlaylist) {
  const tracks: AudiusTrack[] = playlist.tracks
    .filter((m): m is MusicMedia => m.kind === 'music')
    .map((m) => m.track);
  if (tracks.length) usePlayerStore.getState().playFrom(tracks, 0);
}

export default function PlaylistsPage() {
  const playlists = useLibraryStore((s) => s.playlists);
  const deletePlaylist = useLibraryStore((s) => s.deletePlaylist);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LocalPlaylist | null>(null);

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Tus playlists</h1>
          <p className="mt-1 text-sm text-muted">
            Colecciones locales que se guardan en este navegador.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/25 transition hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Crear playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <EmptyState
          icon={ListMusic}
          title="Aún no hay playlists"
          description="Crea tu primera playlist y añade canciones desde los menús de cada canción."
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="group relative rounded-2xl bg-surface/70 p-3 transition-all duration-300 hover:bg-surface-2 hover:shadow-xl hover:shadow-black/40"
            >
              <Link to={`/playlist/${playlist.id}`} className="block">
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-brand/20">
                  <ListMusic className="h-12 w-12 text-fuchsia-300/60" />
                  {playlist.tracks.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          playPlaylist(playlist);
                        }}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-brand text-white shadow-xl"
                      >
                        <Play className="ml-0.5 h-5 w-5 fill-current" />
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-3 truncate px-0.5 text-sm font-semibold text-text">
                  {playlist.name}
                </p>
                <p className="truncate px-0.5 text-xs text-muted">
                  {playlist.tracks.length} {playlist.tracks.length === 1 ? 'elemento' : 'elementos'}
                </p>
              </Link>
              <button
                onClick={() => setDeleteTarget(playlist)}
                aria-label="Eliminar playlist"
                className="absolute right-4 top-4 rounded-full bg-black/50 p-1.5 text-white/80 opacity-0 backdrop-blur transition hover:text-red-400 group-hover:opacity-100"
              >
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>
          ))}
        </div>
      )}

      <CreatePlaylistModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Eliminar playlist"
        message={`¿Seguro que quieres eliminar la playlist «${deleteTarget?.name}»? Se quitarán sus ${deleteTarget?.tracks.length ?? 0} elementos. Esta acción no se puede deshacer.`}
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
