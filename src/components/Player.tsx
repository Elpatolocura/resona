import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Heart, ListMusic, Music2, Pause, Play, SkipBack, SkipForward, Tv, X, Volume2, Maximize2 } from 'lucide-react';
import type { Media } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useMediaStore } from '../store/mediaStore';
import { toast } from '../store/toastStore';
import { formatTime, imageUrl } from '../utils/format';
import { cn } from '../utils/format';
import { mediaSubtitle, vodMediaTypeLabel } from '../utils/media';
import ProgressBar from './ProgressBar';
import VolumeControl from './VolumeControl';

export default function Player() {
  const navigate = useNavigate();
  const currentMedia = usePlayerStore((s) => s.currentMedia);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const showQueue = usePlayerStore((s) => s.showQueue);
  const queue = usePlayerStore((s) => s.queue);
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const seek = usePlayerStore((s) => s.seek);
  const toggleQueue = usePlayerStore((s) => s.toggleQueue);

  const favorites = useLibraryStore((s) => s.favorites);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const isVodFav = useMediaStore((s) => s.isVodFavorite(currentMedia?.id ?? ''));
  const toggleVodFavorite = useMediaStore((s) => s.toggleVodFavorite);

  const isVideo = !!currentMedia && currentMedia.kind !== 'music';
  const art = currentMedia
    ? currentMedia.kind === 'music'
      ? imageUrl(currentMedia.track.artwork, '150x150')
      : currentMedia.poster
    : null;
  const isFav = currentMedia
    ? currentMedia.kind === 'music'
      ? favorites.some((f) => f.id === currentMedia.track.id)
      : isVodFav
    : false;

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const initPos = useCallback(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    setPos({ x: w - 80, y: h - 200 });
    setInitialized(true);
  }, []);

  useEffect(() => {
    initPos();
    window.addEventListener('resize', initPos);
    return () => window.removeEventListener('resize', initPos);
  }, [initPos]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    start.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const newX = Math.max(0, Math.min(w - 64, start.current.px + dx));
    const newY = Math.max(0, Math.min(h - 64, start.current.py + dy));
    setPos({ x: newX, y: newY });
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    if (!currentMedia) return;
    const title = currentMedia.title;
    const artist = currentMedia.kind === 'music' ? currentMedia.subtitle : mediaSubtitle(currentMedia);
    document.title = `${title} · ${artist} — Resona`;
    if (currentMedia.kind === 'music' && 'mediaSession' in navigator) {
      const ms = navigator.mediaSession;
      ms.metadata = new MediaMetadata({
        title,
        artist,
        album: 'Resona',
        artwork: art ? [{ src: art, sizes: '150x150', type: 'image/jpeg' }] : [],
      });
      const store = usePlayerStore;
      ms.setActionHandler('play', () => store.getState().togglePlay());
      ms.setActionHandler('pause', () => store.getState().togglePlay());
      ms.setActionHandler('previoustrack', () => store.getState().prev());
      ms.setActionHandler('nexttrack', () => store.getState().next());
    }
  }, [currentMedia, art]);

  if (!currentMedia) return null;

  const handleFavorite = () => {
    if (currentMedia.kind === 'music') {
      toggleFavorite(currentMedia.track);
    } else if (currentMedia.kind !== 'forum') {
      toggleVodFavorite(currentMedia);
    }
    toast(isFav ? 'Quitado de favoritos' : 'Añadido a favoritos', isFav ? 'info' : 'success');
  };

  const goToWatch = () => {
    if (currentMedia.kind === 'movie' || currentMedia.kind === 'tv' || currentMedia.kind === 'anime') {
      navigate(`/watch/${currentMedia.kind}/${currentMedia.tmdbId}`);
    }
  };

  const subtitle = currentMedia.kind === 'music' ? currentMedia.subtitle : mediaSubtitle(currentMedia);

  if (!isVideo && art) {
    return (
      <>
        <div
          ref={dragRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={() => { if (!dragging.current) navigate('/player'); }}
          className={cn(
            'fixed z-50 h-16 w-16 rounded-full shadow-2xl shadow-black/60 touch-none select-none lg:hidden',
            isPlaying && 'shadow-[0_0_20px_rgba(139,92,246,0.5),0_0_40px_rgba(236,72,153,0.3)]',
          )}
          style={{ left: pos.x, top: pos.y, opacity: initialized ? 1 : 0 }}
        >
          <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="30" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="2.5" />
            <circle
              cx="32" cy="32" r="30" fill="none" stroke="url(#mp-gradient)" strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 30}`}
              strokeDashoffset={`${2 * Math.PI * 30 * (1 - (duration > 0 ? progress / duration : 0))}`}
              className="transition-[stroke-dashoffset] duration-300"
            />
            <defs>
              <linearGradient id="mp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className={cn(
            'absolute inset-[3px] overflow-hidden rounded-full',
            isPlaying && 'animate-[spin_4s_linear_infinite]',
          )} style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
            <img src={art} alt="" className="h-full w-full object-cover" />
          </div>
        </div>

        <div className="hidden lg:block lg:bottom-0 lg:left-64 lg:fixed lg:inset-x-0 lg:z-40 lg:border-t lg:border-line lg:bg-surface/95 lg:shadow-[0_-8px_30px_rgba(0,0,0,0.4)] lg:backdrop-blur-xl">
          <div className="mx-auto flex h-20 max-w-7xl items-center gap-3 px-6">
            <div className="min-w-0 flex-1 max-w-56">
              <p className="truncate text-sm font-semibold text-text">{currentMedia.title}</p>
              <p className="truncate text-xs text-muted">{subtitle}</p>
            </div>

            <div className="ml-auto flex items-center gap-1">
              <VolumeControl />
              <button
                onClick={toggleQueue}
                aria-label="Cola de reproducción"
                className={cn(
                  'rounded-full p-2 transition hover:bg-surface-2',
                  showQueue ? 'text-fuchsia-300' : 'text-muted hover:text-text',
                )}
              >
                <ListMusic className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-line bg-surface/95 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:bottom-0 lg:left-64">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:gap-4 lg:h-20 lg:px-6">
        <div
          onClick={() => goToWatch()}
          className={cn(
            'relative h-11 w-11 shrink-0 overflow-hidden rounded-full shadow-lg lg:h-14 lg:w-14',
            'cursor-pointer transition hover:ring-2 hover:ring-fuchsia-400/50',
          )}
        >
          {art ? (
            <img src={art} alt={currentMedia.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand/25">
              {currentMedia.kind === 'movie' ? (
                <Film className="h-5 w-5 text-fuchsia-300/70" />
              ) : (
                <Tv className="h-5 w-5 text-fuchsia-300/70" />
              )}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 overflow-hidden lg:max-w-56">
          <p className="truncate text-sm font-semibold text-text">{currentMedia.title}</p>
          <p className="truncate text-xs text-muted">{subtitle}</p>
        </div>

        <div className="mx-auto hidden w-full max-w-2xl items-center justify-center lg:flex">
          <button
            onClick={goToWatch}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-bg/40 px-5 py-2 text-sm font-bold text-fuchsia-300 backdrop-blur transition hover:border-fuchsia-400/50 hover:bg-brand/10"
          >
            <Play className="h-4 w-4 fill-current" /> Ver en reproductor
          </button>
        </div>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          <VolumeControl />
          <button
            onClick={toggleQueue}
            aria-label="Cola de reproducción"
            className={cn(
              'rounded-full p-2 transition hover:bg-surface-2',
              showQueue ? 'text-fuchsia-300' : 'text-muted hover:text-text',
            )}
          >
            <ListMusic className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-1 lg:hidden">
          <button
            onClick={prev}
            aria-label="Anterior"
            className="rounded-full p-1.5 text-text transition hover:text-fuchsia-300"
          >
            <SkipBack className="h-4.5 w-4.5 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-text text-bg transition-all hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-bg border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-4.5 w-4.5 fill-current" />
            ) : (
              <Play className="ml-0.5 h-4.5 w-4.5 fill-current" />
            )}
          </button>
          <button
            onClick={next}
            aria-label="Siguiente"
            className="rounded-full p-1.5 text-text transition hover:text-fuchsia-300"
          >
            <SkipForward className="h-4.5 w-4.5 fill-current" />
          </button>
        </div>
      </div>

      {showQueue && <QueuePanel />}
    </div>
  );
}

function QueuePanel() {
  const queue = usePlayerStore((s) => s.queue);
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const playMediaList = usePlayerStore((s) => s.playMediaList);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const toggleQueue = usePlayerStore((s) => s.toggleQueue);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const subtitle = (media: Media) =>
    media.kind === 'music' ? media.subtitle : media.kind === 'forum' ? media.subtitle : vodMediaTypeLabel(media);

  return (
    <div className="absolute bottom-full right-0 max-h-72 w-full max-w-sm overflow-y-auto border-t border-line bg-surface/95 backdrop-blur-xl sm:right-3 sm:rounded-t-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface/95 px-4 py-3">
        <span className="text-sm font-bold text-text">
          Cola de reproducción{' '}
          <span className="font-normal text-faint">({queue.length})</span>
        </span>
        <button
          onClick={toggleQueue}
          aria-label="Cerrar cola"
          className="rounded-full p-1 text-muted transition hover:bg-surface-3 hover:text-text"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {queue.length === 0 ? (
        <p className="px-4 py-6 text-center text-sm text-faint">La cola está vacía.</p>
      ) : (
        queue.map((media: Media, index) => (
          <button
            key={`${media.id}-${index}`}
            onClick={() => playMediaList(queue, index)}
            className={cn(
              'flex w-full items-center gap-3 px-4 py-2 text-left transition hover:bg-surface-2',
              index === queueIndex && 'bg-brand/15',
            )}
          >
            <span className="w-5 shrink-0 text-center text-xs tabular-nums text-faint">
              {index === queueIndex && isPlaying && media.kind === 'music' ? (
                <span className="flex h-3.5 items-end justify-center gap-[2px]">
                  <span className="w-[2px] animate-eq rounded-full bg-fuchsia-300" />
                  <span className="w-[2px] animate-eq rounded-full bg-fuchsia-300" style={{ animationDelay: '0.2s' }} />
                  <span className="w-[2px] animate-eq rounded-full bg-fuchsia-300" style={{ animationDelay: '0.4s' }} />
                </span>
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                'min-w-0 flex-1 truncate text-sm',
                index === queueIndex ? 'font-semibold text-fuchsia-300' : 'text-text',
              )}
            >
              {media.title}
            </span>
            <span className="shrink-0 text-xs text-muted">{subtitle(media)}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                removeFromQueue(index);
              }}
              className="shrink-0 rounded p-1 text-faint transition hover:text-red-400"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          </button>
        ))
      )}
    </div>
  );
}
