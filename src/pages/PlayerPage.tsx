import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, Heart, Music2, Pause, Play, SkipBack, SkipForward, Tv } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useMediaStore } from '../store/mediaStore';
import { toast } from '../store/toastStore';
import { formatTime, imageUrl } from '../utils/format';
import { cn } from '../utils/format';
import { mediaSubtitle } from '../utils/media';
import ProgressBar from '../components/ProgressBar';
import VolumeControl from '../components/VolumeControl';

export default function PlayerPage() {
  const navigate = useNavigate();
  const currentMedia = usePlayerStore((s) => s.currentMedia);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const progress = usePlayerStore((s) => s.progress);
  const duration = usePlayerStore((s) => s.duration);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const next = usePlayerStore((s) => s.next);
  const prev = usePlayerStore((s) => s.prev);
  const seek = usePlayerStore((s) => s.seek);

  const favorites = useLibraryStore((s) => s.favorites);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const isVodFav = useMediaStore((s) => s.isVodFavorite(currentMedia?.id ?? ''));
  const toggleVodFavorite = useMediaStore((s) => s.toggleVodFavorite);

  if (!currentMedia) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <Music2 className="h-20 w-20 text-fuchsia-300/30" />
        <h2 className="mt-4 text-xl font-bold text-text">No hay nada reproduciéndose</h2>
        <p className="mt-2 text-sm text-muted">Empieza a reproducir una canción para ver el reproductor aquí.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-5 py-2.5 text-sm font-semibold text-muted transition hover:border-fuchsia-400/40 hover:text-fuchsia-300"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
      </div>
    );
  }

  const isVideo = currentMedia.kind !== 'music';
  const art = currentMedia.kind === 'music'
    ? imageUrl(currentMedia.track.artwork, '1000x1000')
    : currentMedia.poster;
  const subtitle = currentMedia.kind === 'music' ? currentMedia.subtitle : mediaSubtitle(currentMedia);
  const isFav = currentMedia.kind === 'music'
    ? favorites.some((f) => f.id === currentMedia.track.id)
    : isVodFav;

  const handleFavorite = () => {
    if (currentMedia.kind === 'music') {
      toggleFavorite(currentMedia.track);
    } else {
      toggleVodFavorite(currentMedia);
    }
    toast(isFav ? 'Quitado de favoritos' : 'Añadido a favoritos', isFav ? 'info' : 'success');
  };

  return (
    <div
      className="flex h-full flex-col items-center justify-between p-6 animate-fade-in"
      style={{
        background: art && !isVideo
          ? `linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(30,10,40,0.9) 40%, rgba(15,5,20,1) 100%)`
          : 'linear-gradient(180deg, rgba(20,10,30,0.95) 0%, rgba(10,5,15,1) 100%)',
      }}
    >
      {/* Background glow */}
      {art && !isVideo && (
        <div
          className="pointer-events-none absolute inset-0 opacity-20 blur-[120px]"
          style={{ backgroundImage: `url(${art})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
      )}

      {/* Top bar */}
      <div className="relative z-10 flex w-full max-w-lg items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
          {isVideo ? (currentMedia.kind === 'movie' ? 'Película' : 'Serie') : 'Reproduciendo'}
        </span>
        <div className="h-10 w-10" />
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 w-full max-w-lg">
        {/* Album Art / Poster */}
        {isVideo ? (
          <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-2xl shadow-2xl shadow-black/60">
            {art ? (
              <img src={art} alt={currentMedia.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface-3">
                {currentMedia.kind === 'movie' ? (
                  <Film className="h-16 w-16 text-fuchsia-300/50" />
                ) : (
                  <Tv className="h-16 w-16 text-fuchsia-300/50" />
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="relative">
            <div
              className={cn(
                'h-64 w-64 overflow-hidden rounded-full shadow-2xl shadow-black/60 sm:h-72 sm:w-72',
                isPlaying && 'animate-[spin_20s_linear_infinite]',
              )}
              style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
            >
              {art ? (
                <img src={art} alt={currentMedia.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/40 to-surface-3">
                  <Music2 className="h-20 w-20 text-fuchsia-300/50" />
                </div>
              )}
            </div>
            <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface shadow-inner" />
            {isPlaying && (
              <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-fuchsia-400/30 animate-pulse" />
            )}
          </div>
        )}

        {/* Song info */}
        <div className="text-center w-full px-4">
          <h1 className="text-2xl font-bold text-white truncate drop-shadow-lg sm:text-3xl">{currentMedia.title}</h1>
          <p className="mt-2 text-base text-white/60 truncate sm:text-lg">{subtitle}</p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 w-full max-w-lg space-y-6 pb-4">
        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <span className="w-12 text-right text-xs tabular-nums text-white/50">
            {formatTime(progress)}
          </span>
          <ProgressBar value={progress} max={duration} onChange={seek} />
          <span className="w-12 text-xs tabular-nums text-white/50">
            {formatTime(duration)}
          </span>
        </div>

        {/* Main controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleFavorite}
            aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            className="rounded-full p-3 text-white/60 transition hover:text-fuchsia-400"
          >
            <Heart className={cn('h-6 w-6', isFav && 'fill-fuchsia-400 text-fuchsia-400')} />
          </button>
          <button
            onClick={prev}
            aria-label="Anterior"
            className="rounded-full p-3 text-white/80 transition hover:text-white"
          >
            <SkipBack className="h-8 w-8 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            className="flex h-18 w-18 items-center justify-center rounded-full bg-white text-surface shadow-xl shadow-white/20 transition-all hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-surface border-t-transparent" />
            ) : isPlaying ? (
              <Pause className="h-8 w-8 fill-current" />
            ) : (
              <Play className="ml-1 h-8 w-8 fill-current" />
            )}
          </button>
          <button
            onClick={next}
            aria-label="Siguiente"
            className="rounded-full p-3 text-white/80 transition hover:text-white"
          >
            <SkipForward className="h-8 w-8 fill-current" />
          </button>
          <div className="text-white/60">
            <VolumeControl />
          </div>
        </div>
      </div>
    </div>
  );
}
