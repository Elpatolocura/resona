import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Film, Heart, Music2, Pause, Play, SkipBack, SkipForward, Tv, Disc3, Clock, User, Share2, Flag, X, Check, ExternalLink } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { useMediaStore } from '../store/mediaStore';
import { toast } from '../store/toastStore';
import { formatTime, imageUrl } from '../utils/format';
import { cn } from '../utils/format';
import { mediaSubtitle } from '../utils/media';
import { audius } from '../services/audius';
import ProgressBar from '../components/ProgressBar';
import VolumeControl from '../components/VolumeControl';
import type { AudiusTrack } from '../types';

type FilterType = 'all' | 'artist' | 'trending' | 'underground';

const FILTERS: { id: FilterType; label: string; icon: typeof Disc3 }[] = [
  { id: 'all', label: 'Todos', icon: Disc3 },
  { id: 'artist', label: 'Mismo artista', icon: User },
  { id: 'trending', label: 'Tendencia', icon: Music2 },
  { id: 'underground', label: 'Underground', icon: Music2 },
];

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
  const playTrack = usePlayerStore((s) => s.playTrack);

  const favorites = useLibraryStore((s) => s.favorites);
  const toggleFavorite = useLibraryStore((s) => s.toggleFavorite);
  const isVodFav = useMediaStore((s) => s.isVodFavorite(currentMedia?.id ?? ''));
  const toggleVodFavorite = useMediaStore((s) => s.toggleVodFavorite);

  const [similarTracks, setSimilarTracks] = useState<AudiusTrack[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [copied, setCopied] = useState(false);

  const currentTrack = currentMedia?.kind === 'music' ? currentMedia.track : null;

  useEffect(() => {
    if (!currentTrack) return;
    
    const fetchSimilar = async () => {
      setLoadingSimilar(true);
      try {
        let tracks: AudiusTrack[] = [];
        
        switch (activeFilter) {
          case 'artist':
            if (currentTrack.user?.id) {
              tracks = await audius.getUserTracks(currentTrack.user.id);
              tracks = tracks.filter(t => t.id !== currentTrack.id);
            }
            break;
          case 'trending':
            tracks = await audius.trendingTracks('week');
            tracks = tracks.filter(t => t.id !== currentTrack.id);
            break;
          case 'underground':
            tracks = await audius.trendingUnderground();
            tracks = tracks.filter(t => t.id !== currentTrack.id);
            break;
          default:
            // Mix of artist tracks and trending
            const [artistTracks, trendingTracks] = await Promise.all([
              currentTrack.user?.id ? audius.getUserTracks(currentTrack.user.id) : Promise.resolve([]),
              audius.trendingTracks('week'),
            ]);
            const filtered = artistTracks.filter(t => t.id !== currentTrack.id);
            const trending = trendingTracks.filter(t => t.id !== currentTrack.id);
            tracks = [...filtered.slice(0, 5), ...trending.slice(0, 10)];
            break;
        }
        
        setSimilarTracks(tracks.slice(0, 15));
      } catch (err) {
        console.error('Error fetching similar tracks:', err);
        setSimilarTracks([]);
      } finally {
        setLoadingSimilar(false);
      }
    };

    fetchSimilar();
  }, [currentTrack?.id, activeFilter]);

  const shareTrack = async () => {
    if (!currentMedia) return;
    const url = window.location.href;
    const text = `${currentMedia.title} - ${subtitle} en Resona`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast('Enlace copiado al portapapeles', 'success');
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast('Error al copiar enlace', 'error');
      }
    }
  };

  const reportTrack = () => {
    if (!reportReason.trim()) return;
    setShowReportModal(false);
    setReportReason('');
    setReportDetails('');
    toast('Denuncia enviada. Gracias por reportar.', 'success');
  };

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
    <div className="flex h-full animate-fade-in">
      {/* Left side - Player */}
      <div
        className="flex h-full w-1/2 flex-col items-center justify-between p-6"
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
                  'h-56 w-56 overflow-hidden rounded-full shadow-2xl shadow-black/60 sm:h-64 sm:w-64',
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
              <div className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface shadow-inner" />
              {isPlaying && (
                <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-fuchsia-400/30 animate-pulse" />
              )}
            </div>
          )}

          <div className="text-center w-full px-4">
            <h1 className="text-xl font-bold text-white truncate drop-shadow-lg sm:text-2xl">{currentMedia.title}</h1>
            <p className="mt-2 text-sm text-white/60 truncate">{subtitle}</p>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="relative z-10 w-full max-w-lg space-y-5">
          <div className="flex items-center gap-3">
            <span className="w-10 text-right text-[11px] tabular-nums text-white/50">
              {formatTime(progress)}
            </span>
            <ProgressBar value={progress} max={duration} onChange={seek} />
            <span className="w-10 text-[11px] tabular-nums text-white/50">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-5">
            <button
              onClick={handleFavorite}
              aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              className="rounded-full p-2.5 text-white/60 transition hover:text-fuchsia-400"
            >
              <Heart className={cn('h-5 w-5', isFav && 'fill-fuchsia-400 text-fuchsia-400')} />
            </button>
            <button
              onClick={prev}
              aria-label="Anterior"
              className="rounded-full p-2.5 text-white/80 transition hover:text-white"
            >
              <SkipBack className="h-7 w-7 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-surface shadow-xl shadow-white/20 transition-all hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <div className="h-7 w-7 animate-spin rounded-full border-3 border-surface border-t-transparent" />
              ) : isPlaying ? (
                <Pause className="h-7 w-7 fill-current" />
              ) : (
                <Play className="ml-1 h-7 w-7 fill-current" />
              )}
            </button>
            <button
              onClick={next}
              aria-label="Siguiente"
              className="rounded-full p-2.5 text-white/80 transition hover:text-white"
            >
              <SkipForward className="h-7 w-7 fill-current" />
            </button>
            <div className="text-white/60">
              <VolumeControl />
            </div>
          </div>

          {/* Share and Report buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={shareTrack}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/20 hover:text-white"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Compartir'}
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/20 hover:text-white"
            >
              <Flag className="h-3.5 w-3.5" />
              Denunciar
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Similar tracks */}
      <div className="hidden w-1/2 flex-col border-l border-line bg-surface/30 xl:flex">
        {/* Header */}
        <div className="border-b border-line p-4">
          <h2 className="text-lg font-bold text-text">Canciones similares</h2>
          
          {/* Filters */}
          <div className="mt-3 flex gap-2">
            {FILTERS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveFilter(id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
                  activeFilter === id
                    ? 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300'
                    : 'border-line text-muted hover:border-fuchsia-400/30 hover:text-text',
                )}
              >
                <Icon className="h-3 w-3" /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Track list */}
        <div className="flex-1 overflow-y-auto p-2">
          {loadingSimilar ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl p-2">
                  <div className="h-12 w-12 animate-pulse rounded-lg bg-surface-2" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-surface-2" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-surface-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : similarTracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Music2 className="h-12 w-12 text-fuchsia-300/30" />
              <p className="mt-3 text-sm text-muted">No se encontraron canciones similares</p>
            </div>
          ) : (
            <div className="space-y-1">
              {similarTracks.map((track) => {
                const trackArt = imageUrl(track.artwork, '150x150');
                const isCurrentTrack = currentTrack?.id === track.id;
                
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl p-2 transition cursor-pointer',
                      isCurrentTrack
                        ? 'bg-fuchsia-500/15 border border-fuchsia-400/30'
                        : 'hover:bg-surface-2 border border-transparent',
                    )}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      {trackArt ? (
                        <img src={trackArt} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-surface-3">
                          <Music2 className="h-5 w-5 text-fuchsia-300/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                        <Play className="h-5 w-5 fill-white text-white" />
                      </div>
                      {isCurrentTrack && isPlaying && (
                        <div className="absolute bottom-1 right-1 flex gap-0.5">
                          <div className="h-2 w-0.5 animate-pulse bg-fuchsia-400" />
                          <div className="h-3 w-0.5 animate-pulse bg-fuchsia-400" style={{ animationDelay: '0.15s' }} />
                          <div className="h-2 w-0.5 animate-pulse bg-fuchsia-400" style={{ animationDelay: '0.3s' }} />
                        </div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        'truncate text-sm font-medium',
                        isCurrentTrack ? 'text-fuchsia-300' : 'text-text',
                      )}>
                        {track.title}
                      </p>
                      <p className="truncate text-xs text-muted">{track.user?.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-faint">
                      <Clock className="h-3 w-3" />
                      {formatTime(track.duration)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-line bg-surface p-6 shadow-2xl shadow-black/40">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-text">Denunciar canción</h3>
              <button onClick={() => { setShowReportModal(false); setReportReason(''); setReportDetails(''); }} className="text-faint transition hover:text-text">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-surface-2 p-3">
              {art && (
                <img src={art} alt="" className="h-12 w-12 rounded-lg object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text">{currentMedia.title}</p>
                <p className="truncate text-xs text-muted">{subtitle}</p>
              </div>
            </div>

            <div className="space-y-2">
              {['Contenido inapropiado', 'Violación de derechos de autor', 'Spam o fraude', 'Otro'].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setReportReason(reason)}
                  className={cn(
                    'w-full rounded-xl border px-4 py-2.5 text-left text-sm transition',
                    reportReason === reason
                      ? 'border-red-400/50 bg-red-500/15 text-red-300'
                      : 'border-line text-muted hover:border-red-400/30 hover:text-text',
                  )}
                >
                  {reason}
                </button>
              ))}
            </div>

            {reportReason && (
              <div className="mt-4">
                <label className="mb-1 block text-xs font-semibold text-muted">Detalles adicionales (opcional)</label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe el problema..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm text-text placeholder-faint outline-none transition focus:border-red-400/40"
                />
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => { setShowReportModal(false); setReportReason(''); setReportDetails(''); }}
                className="flex-1 rounded-full border border-line py-2.5 text-sm font-semibold text-muted transition hover:text-text"
              >
                Cancelar
              </button>
              <button
                onClick={reportTrack}
                disabled={!reportReason.trim()}
                className="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-30"
              >
                Denunciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
