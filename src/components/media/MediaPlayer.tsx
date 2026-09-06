import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2, Maximize, Minimize, Play, Server } from 'lucide-react';
import type { MediaVod } from '../../types';
import { usePlayerStore } from '../../store/playerStore';
import { useMediaStore } from '../../store/mediaStore';
import { toast } from '../../store/toastStore';
import Select from '../Select';
import { cn } from '../../utils/format';
import { vodMediaTypeLabel } from '../../utils/media';

interface MediaPlayerProps {
  vod: MediaVod;
}

export default function MediaPlayer({ vod }: MediaPlayerProps) {
  const navigate = useNavigate();
  const currentMedia = usePlayerStore((s) => s.currentMedia);
  const videoUrl = usePlayerStore((s) => s.videoUrl);
  const setVideoUrl = usePlayerStore((s) => s.setVideoUrl);
  const providers = useMediaStore((s) => s.providers);
  const loadProviders = useMediaStore((s) => s.loadProviders);
  const isFav = useMediaStore((s) => s.isVodFavorite(vod.id));
  const toggleVodFavorite = useMediaStore((s) => s.toggleVodFavorite);
  const [loaded, setLoaded] = useState(false);
  const [fs, setFs] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const toggleFs = useCallback(() => {
    setFs((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!fs) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFs(false); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    const prevPos = document.body.style.position;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'relative';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPos;
    };
  }, [fs]);

  useEffect(() => {
    setLoaded(false);
    if (providers.length === 0) loadProviders(vod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vod.id, vod.season, vod.episode]);

  const isCurrent = currentMedia?.id === vod.id;

  const showBtn = loaded && !!videoUrl && isCurrent;

  return (
    <>
      <div className="space-y-4">
        <div className={cn('flex flex-wrap items-center justify-between gap-3', fs && 'invisible')}>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-2 text-sm font-semibold text-muted backdrop-blur transition hover:border-fuchsia-400/40 hover:text-fuchsia-300"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={() => {
                toggleVodFavorite(vod);
                toast(isFav ? 'Quitado de favoritos' : 'Añadido a favoritos', isFav ? 'info' : 'success');
              }}
              aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              className="rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-text"
            >
              <Heart className={cn('h-5 w-5', isFav && 'fill-accent-2 text-accent-2')} />
            </button>
            {providers.length > 1 && (
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted" />
                <Select
                  value={videoUrl ?? ''}
                  onChange={(value) => { setVideoUrl(value); useMediaStore.getState().selectProvider(value); }}
                  ariaLabel="Servidor"
                  options={providers.map((p) => ({ value: p.url, label: p.name }))}
                />
              </div>
            )}
          </div>
        </div>

        {!isCurrent ? (
          <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-surface/60 p-8 text-center">
            <p className="text-lg font-bold text-text">{vodMediaTypeLabel(vod)}: {vod.title}</p>
            <button
              onClick={() => usePlayerStore.getState().playVideo(vod)}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-xl shadow-fuchsia-500/30 transition hover:scale-[1.03] hover:opacity-90 active:scale-95"
            >
              <Play className="h-4.5 w-4.5 fill-current" /> Ver ahora
            </button>
          </div>
        ) : (
          <div
            ref={boxRef}
            className={cn(
              'relative bg-black',
              !fs && 'aspect-video w-full rounded-2xl border border-line shadow-2xl shadow-black/50',
            )}
            style={fs ? {
              position: 'fixed' as const,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100vh',
              borderRadius: 0,
              border: 'none',
              margin: 0,
              padding: 0,
              zIndex: 2147483647,
              overflow: 'hidden',
            } : undefined}
          >
            {!loaded && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black">
                <Loader2 className="h-8 w-8 animate-spin text-fuchsia-300" />
                <p className="text-sm text-muted">Cargando reproductor…</p>
              </div>
            )}
            {videoUrl ? (
              <iframe
                key={videoUrl}
                src={videoUrl}
                title={vod.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="origin"
                className="h-full w-full border-0"
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-sm text-muted">Selecciona un servidor para ver el contenido.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showBtn && createPortal(
        <button
          onClick={toggleFs}
          style={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 2147483647,
            width: 48,
            height: 48,
            borderRadius: 12,
            background: fs ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.6)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            touchAction: 'manipulation',
          }}
          aria-label={fs ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {fs ? <Minimize size={22} /> : <Maximize size={22} />}
        </button>,
        document.body,
      )}
    </>
  );
}
