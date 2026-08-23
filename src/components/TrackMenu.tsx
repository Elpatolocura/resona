import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bookmark, CornerDownRight, Heart, ListPlus, MoreHorizontal, Plus, ListMusic, X } from 'lucide-react';
import type { AudiusTrack } from '../types';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import { toast } from '../store/toastStore';
import { cn } from '../utils/format';
import { trackToMedia } from '../utils/media';
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
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const favorites = useLibraryStore((s) => s.favorites);
  const playlists = useLibraryStore((s) => s.playlists);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const toggleMyList = useLibraryStore((s) => s.toggleMyList);
  const isInMyList = useLibraryStore((s) => s.isInMyList(track.id));
  const addToPlaylist = useLibraryStore((s) => s.addToPlaylist);
  const addNext = usePlayerStore((s) => s.addNext);
  const addToQueueEnd = usePlayerStore((s) => s.addToQueueEnd);

  const isFav = favorites.some((f) => f.id === track.id);
  const mediaTrack = trackToMedia(track);

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

  useEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const menuH = menuRef.current?.offsetHeight ?? 250;
    const menuW = 200;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.left;

    let top: number;
    if (spaceBelow > menuH + 8) {
      top = rect.bottom + 4;
    } else {
      top = rect.top - menuH - 4;
    }

    let left: number;
    if (align === 'left') {
      left = rect.left;
    } else {
      left = rect.right - menuW;
    }

    left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - menuH - 8));

    setMenuPos({ top, left });
  }, [open, align]);

  const handlePlaylist = (playlistId: string) => {
    const added = addToPlaylist(playlistId, track);
    toast(added ? 'Añadido a la playlist' : 'Ya está en esa playlist', added ? 'success' : 'info');
    setOpen(false);
    setShowPlaylists(false);
  };

  const menu = open ? createPortal(
    <div
      ref={menuRef}
      className="fixed z-[300] min-w-48 animate-fade-in rounded-xl border border-line bg-surface-2 p-1 shadow-2xl shadow-black/60"
      style={{ top: menuPos.top, left: menuPos.left }}
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
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-text transition hover:bg-surface-3"
      >
        <Heart className={cn('h-3.5 w-3.5', isFav && 'fill-accent-2 text-accent-2')} />
        {isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleMyList(mediaTrack);
          toast(
            isInMyList ? 'Quitado de Mi Lista' : 'Añadido a Mi Lista',
            isInMyList ? 'info' : 'success',
          );
          setOpen(false);
        }}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-text transition hover:bg-surface-3"
      >
        <Bookmark className={cn('h-3.5 w-3.5', isInMyList && 'fill-fuchsia-300 text-fuchsia-300')} />
        {isInMyList ? 'Quitar de Mi Lista' : 'Añadir a Mi Lista'}
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          addNext(track);
          toast('Se reproducirá a continuación', 'info');
          setOpen(false);
        }}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-text transition hover:bg-surface-3"
      >
        <CornerDownRight className="h-3.5 w-3.5" />
        Reproducir a continuación
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          addToQueueEnd(track);
          toast('Añadido a la cola', 'info');
          setOpen(false);
        }}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-text transition hover:bg-surface-3"
      >
        <ListPlus className="h-3.5 w-3.5" />
        Añadir a la cola
      </button>

      <div className="mx-2 my-0.5 h-px bg-line" />

      {!showPlaylists ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowPlaylists(true);
          }}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-text transition hover:bg-surface-3"
        >
          <ListMusic className="h-3.5 w-3.5" />
          Añadir a playlist
        </button>
      ) : (
        <div className="max-h-32 overflow-y-auto">
          <div className="flex items-center justify-between px-2 py-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-faint">
              Playlists
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPlaylists(false);
              }}
              className="rounded-full p-0.5 text-muted hover:bg-surface-3 hover:text-text"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          {playlists.length === 0 ? (
            <p className="px-2 py-1.5 text-[10px] text-faint">
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
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1 text-left text-xs font-medium text-text transition hover:bg-surface-3"
              >
                <span className="truncate">{p.name}</span>
              </button>
            ))
          )}
        </div>
      )}

      <div className="mx-2 my-0.5 h-px bg-line" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          const created = useLibraryStore.getState().createPlaylist(track.title);
          useLibraryStore.getState().addToPlaylist(created.id, track);
          toast('Playlist creada con la canción', 'success');
          setOpen(false);
          setShowPlaylists(false);
        }}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-text transition hover:bg-surface-3"
      >
        <Plus className="h-3.5 w-3.5" />
        Nueva playlist con esta canción
      </button>
    </div>,
    document.body,
  ) : null;

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

      {menu}

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
