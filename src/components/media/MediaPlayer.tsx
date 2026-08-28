import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Loader2, Play, Server } from 'lucide-react';
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

  useEffect(() => {
    setLoaded(false);
    if (providers.length === 0) {
      loadProviders(vod);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vod.id, vod.season, vod.episode]);

  const isCurrent = currentMedia?.id === vod.id;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
              toast(
                isFav ? 'Quitado de favoritos' : 'Añadido a favoritos',
                isFav ? 'info' : 'success',
              );
            }}
            aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            className={cn(
              'rounded-full p-2 text-muted transition hover:bg-surface-2 hover:text-text',
            )}
          >
            <Heart className={cn('h-5 w-5', isFav && 'fill-accent-2 text-accent-2')} />
          </button>

          {providers.length > 1 && (
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-muted" />
              <Select
                value={videoUrl ?? ''}
                onChange={(value) => {
                  setVideoUrl(value);
                  useMediaStore.getState().selectProvider(value);
                }}
                ariaLabel="Servidor"
                options={providers.map((p) => ({ value: p.url, label: p.name }))}
              />
            </div>
          )}
        </div>
      </div>

      {!isCurrent ? (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-surface/60 p-8 text-center">
          <p className="text-lg font-bold text-text">
            {vodMediaTypeLabel(vod)}: {vod.title}
          </p>
          <button
            onClick={() => usePlayerStore.getState().playVideo(vod)}
            className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-xl shadow-fuchsia-500/30 transition hover:scale-[1.03] hover:opacity-90 active:scale-95"
          >
            <Play className="h-4.5 w-4.5 fill-current" /> Ver ahora
          </button>
        </div>
      ) : (
        <div className="relative aspect-video w-full rounded-2xl border border-line bg-black shadow-2xl shadow-black/50">
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
              className="h-full w-full"
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
  );
}
