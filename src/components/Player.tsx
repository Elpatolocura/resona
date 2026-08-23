import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Heart, ListMusic, Music2, Pause, Play, SkipBack, SkipForward, Tv, X, Volume2, Maximize2, Minimize2 } from 'lucide-react';
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
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const seek = usePlayerStore((s) => s.seek);
  const toggleQueue = usePlayerStore((s) => s.toggleQueue);
  const [showMobileVolume, setShowMobileVolume] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
    } else {
      toggleVodFavorite(currentMedia);
    }
    toast(isFav ? 'Quitado de favoritos' : 'Añadido a favoritos', isFav ? 'info' : 'success');
  };

  const goToWatch = () => {
    if (currentMedia.kind === 'movie' || currentMedia.kind === 'tv') {
      navigate(`/watch/${currentMedia.kind}/${currentMedia.tmdbId}`);
    }
  };

  const subtitle = currentMedia.kind === 'music' ? currentMedia.subtitle : mediaSubtitle(currentMedia);

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-line bg-surface/95 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:bottom-0">
      {!isVideo && (
        <div className="px-3 pt-2 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-faint">
              {formatTime(progress)}
            </span>
            <ProgressBar value={progress} max={duration} onChange={seek} />
            <span className="w-8 shrink-0 text-[10px] tabular-nums text-faint">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      )}

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-3 lg:h-20 lg:px-6">
        <div
          onClick={() => !isVideo && setExpanded(true)}
          className={cn(
            'relative h-11 w-11 shrink-0 overflow-hidden rounded-lg shadow-lg lg:h-14 lg:w-14',
            !isVideo && 'cursor-pointer transition hover:ring-2 hover:ring-fuchsia-400/50',
          )}
        >
          {art ? (
            <img src={art} alt={currentMedia.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand/25">
              {isVideo ? (
                currentMedia.kind === 'movie' ? (
                  <Film className="h-5 w-5 text-fuchsia-300/70" />
                ) : (
                  <Tv className="h-5 w-5 text-fuchsia-300/70" />
                )
              ) : (
                <Music2 className="h-5 w-5 text-fuchsia-300/70" />
              )}
            </div>
          )}
          {!isVideo && (
            <div
              className={cn(
                'absolute inset-0 rounded-lg ring-2 ring-inset ring-fuchsia-400/40 transition-opacity',
                isPlaying ? 'opacity-100' : 'opacity-0',
              )}
            />
          )}
        </div>

        <div className="min-w-0 flex-1 lg:max-w-56">
          <p className="truncate text-sm font-semibold text-text">{currentMedia.title}</p>
          <p className="truncate text-xs text-muted">{subtitle}</p>
        </div>

        {!isVideo && (
          <button
            onClick={() => setExpanded(true)}
            aria-label="Expandir reproductor"
            className="hidden shrink-0 rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-fuchsia-300 lg:block"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={handleFavorite}
          aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          className="shrink-0 rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-text"
        >
          <Heart className={cn('h-4.5 w-4.5', isFav && 'fill-accent-2 text-accent-2')} />
        </button>

        {isVideo ? (
          <div className="mx-auto hidden w-full max-w-2xl items-center justify-center lg:flex">
            <button
              onClick={goToWatch}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-bg/40 px-5 py-2 text-sm font-bold text-fuchsia-300 backdrop-blur transition hover:border-fuchsia-400/50 hover:bg-brand/10"
            >
              <Play className="h-4 w-4 fill-current" /> Ver en reproductor
            </button>
          </div>
        ) : (
          <div className="mx-auto hidden w-full max-w-2xl flex-col items-center gap-1.5 lg:flex">
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                aria-label="Anterior"
                className="rounded-full p-2 text-text transition hover:text-fuchsia-300"
              >
                <SkipBack className="h-5 w-5 fill-current" />
              </button>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-text text-bg transition-all hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-bg border-t-transparent" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5 fill-current" />
                ) : (
                  <Play className="ml-0.5 h-5 w-5 fill-current" />
                )}
              </button>
              <button
                onClick={next}
                aria-label="Siguiente"
                className="rounded-full p-2 text-text transition hover:text-fuchsia-300"
              >
                <SkipForward className="h-5 w-5 fill-current" />
              </button>
            </div>
            <div className="flex w-full items-center gap-2.5">
              <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-faint">
                {formatTime(progress)}
              </span>
              <ProgressBar value={progress} max={duration} onChange={seek} />
              <span className="w-9 shrink-0 text-[11px] tabular-nums text-faint">
                {formatTime(duration)}
              </span>
            </div>
          </div>
        )}

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
          {isVideo ? (
            <button
              onClick={goToWatch}
              aria-label="Abrir reproductor"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-fuchsia-500/40 transition hover:scale-105 active:scale-95"
            >
              <Play className="ml-0.5 h-4.5 w-4.5 fill-current" />
            </button>
          ) : (
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
          )}
          <button
            onClick={next}
            aria-label="Siguiente"
            className="rounded-full p-1.5 text-text transition hover:text-fuchsia-300"
          >
            <SkipForward className="h-4.5 w-4.5 fill-current" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMobileVolume(!showMobileVolume)}
              aria-label="Volumen"
              className="rounded-full p-1.5 text-text transition hover:text-fuchsia-300"
            >
              <Volume2 className="h-4.5 w-4.5" />
            </button>
            {showMobileVolume && (
              <div className="absolute bottom-full right-0 mb-2 rounded-2xl border border-line bg-surface/95 p-3 backdrop-blur-xl shadow-xl">
                <VolumeControl />
              </div>
            )}
          </div>
        </div>
      </div>

      {showQueue && <QueuePanel />}

      {expanded && !isVideo && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-surface via-surface to-bg p-6 backdrop-blur-xl">
          <button
            onClick={() => setExpanded(false)}
            className="absolute right-4 top-4 rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-text"
          >
            <Minimize2 className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="relative h-64 w-64 overflow-hidden rounded-3xl shadow-2xl shadow-black/50 sm:h-72 sm:w-72">
              {art ? (
                <img src={art} alt={currentMedia.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand/25">
                  <Music2 className="h-16 w-16 text-fuchsia-300/50" />
                </div>
              )}
              {isPlaying && (
                <div className="absolute inset-0 rounded-3xl ring-2 ring-inset ring-fuchsia-400/40" />
              )}
            </div>

            <div className="text-center w-full">
              <h2 className="text-xl font-bold text-text truncate">{currentMedia.title}</h2>
              <p className="mt-1 text-sm text-muted truncate">{subtitle}</p>
            </div>

            <div className="w-full">
              <div className="flex items-center gap-3">
                <span className="w-10 text-right text-xs tabular-nums text-faint">
                  {formatTime(progress)}
                </span>
                <ProgressBar value={progress} max={duration} onChange={seek} />
                <span className="w-10 text-xs tabular-nums text-faint">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleFavorite}
                aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                className="rounded-full p-3 text-muted transition hover:bg-surface-2 hover:text-text"
              >
                <Heart className={cn('h-6 w-6', isFav && 'fill-accent-2 text-accent-2')} />
              </button>
              <button
                onClick={prev}
                aria-label="Anterior"
                className="rounded-full p-3 text-text transition hover:text-fuchsia-300"
              >
                <SkipBack className="h-7 w-7 fill-current" />
              </button>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-text text-bg shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-bg border-t-transparent" />
                ) : isPlaying ? (
                  <Pause className="h-7 w-7 fill-current" />
                ) : (
                  <Play className="ml-1 h-7 w-7 fill-current" />
                )}
              </button>
              <button
                onClick={next}
                aria-label="Siguiente"
                className="rounded-full p-3 text-text transition hover:text-fuchsia-300"
              >
                <SkipForward className="h-7 w-7 fill-current" />
              </button>
              <VolumeControl />
            </div>
          </div>
        </div>
      )}
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
    media.kind === 'music' ? media.subtitle : vodMediaTypeLabel(media);

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
