import { useEffect, useRef, useState } from 'react';
import { CornerDownRight, Heart, ListPlus, MoreHorizontal, Plus, ListMusic, X } from 'lucide-react';
import type { AudiusTrack } from '../types';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { toast } from '../store/toastStore';
import { cn } from '../utils/format';
import ConfirmDialog from './ConfirmDialog';

interface TrackMenuProps {
  track: AudiusTrack;
  align?: 'left' | 'right';
  className?: string;
}

export default function TrackMenu({ track, align = 'right', className }: TrackMenuProps) {
  const [open, setOpen] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [confirmFavRemove, setConfirmFavRemove] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const favorites = useLibraryStore((s) => s.favorites);
  const playlists = useLibraryStore((s) => s.playlists);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const addToPlaylist = useLibraryStore((s) => s.addToPlaylist);
  const addNext = usePlayerStore((s) => s.addNext);
  const addToQueueEnd = usePlayerStore((s) => s.addToQueueEnd);

  const isFav = favorites.some((f) => f.id === track.id);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setShowPlaylists(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const handlePlaylist = (playlistId: string) => {
    const added = addToPlaylist(playlistId, track);
    toast(added ? 'Añadido a la playlist' : 'Ya está en esa playlist', added ? 'success' : 'info');
    setOpen(false);
    setShowPlaylists(false);
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-label="Más opciones"
        className="rounded-full p-1.5 text-muted transition hover:bg-surface-2 hover:text-text"
      >
        <MoreHorizontal className="h-4.5 w-4.5" />
      </button>

      {open && (
        <div
          className={cn(
            'absolute bottom-full z-50 mb-2 min-w-56 origin-bottom animate-fade-in rounded-2xl border border-line bg-surface-2 p-1.5 shadow-2xl shadow-black/60',
            align === 'left' ? 'left-0' : 'right-0',
          )}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isFav) {
                setOpen(false);
                setConfirmFavRemove(true);
              } else {
                toggleFavorite(track);
                toast('Añadido a favoritos', 'success');
                setOpen(false);
              }
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-text transition hover:bg-surface-3"
          >
            <Heart className={cn('h-4 w-4', isFav && 'fill-accent-2 text-accent-2')} />
            {isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addNext(track);
              toast('Se reproducirá a continuación', 'info');
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-text transition hover:bg-surface-3"
          >
            <CornerDownRight className="h-4 w-4" />
            Reproducir a continuación
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToQueueEnd(track);
              toast('Añadido a la cola', 'info');
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-text transition hover:bg-surface-3"
          >
            <ListPlus className="h-4 w-4" />
            Añadir a la cola
          </button>

          <div className="mx-3 my-1 h-px bg-line" />

          {!showPlaylists ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPlaylists(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-text transition hover:bg-surface-3"
            >
              <ListMusic className="h-4 w-4" />
              Añadir a playlist
            </button>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-faint">
                  Playlists
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylists(false);
                  }}
                  className="rounded-full p-1 text-muted hover:bg-surface-3 hover:text-text"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {playlists.length === 0 ? (
                <p className="px-3 py-2 text-xs text-faint">
                  Crea una playlist en la sección Playlists.
                </p>
              ) : (
                playlists.map((p) => (
                  <button
                    key={p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlaylist(p.id);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-text transition hover:bg-surface-3"
                  >
                    <span className="truncate">{p.name}</span>
                  </button>
                ))
              )}
            </div>
          )}

          <div className="mx-3 my-1 h-px bg-line" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              const created = useLibraryStore.getState().createPlaylist(track.title);
              useLibraryStore.getState().addToPlaylist(created.id, track);
              toast('Playlist creada con la canción', 'success');
              setOpen(false);
              setShowPlaylists(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-text transition hover:bg-surface-3"
          >
            <Plus className="h-4 w-4" />
            Nueva playlist con esta canción
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmFavRemove}
        title="Quitar de favoritos"
        message={`¿Quitar «${track.title}» de tus canciones favoritas?`}
        confirmLabel="Quitar"
        onClose={() => setConfirmFavRemove(false)}
        onConfirm={() => {
          toggleFavorite(track);
          toast('Quitado de favoritos', 'info');
        }}
      />
    </div>
  );
}
