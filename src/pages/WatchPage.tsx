import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ListVideo, Loader2 } from 'lucide-react';
import type { MediaVod } from '../types';
import type { TmdbKind } from '../services/tmdb';
import { useMediaStore } from '../store/mediaStore';
import { usePlayerStore } from '../store/playerStore';
import MediaPlayer from '../components/media/MediaPlayer';
import Select from '../components/Select';
import ErrorState from '../components/ErrorState';
import { cn } from '../utils/format';

export default function WatchPage() {
  const { kind, id } = useParams<{ kind: string; id: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const k = (kind === 'tv' ? 'tv' : 'movie') as TmdbKind;
  const numId = Number(id);

  const currentMedia = useMediaStore((s) => s.currentMedia);
  const loading = useMediaStore((s) => s.loading);
  const error = useMediaStore((s) => s.error);
  const getDetails = useMediaStore((s) => s.getDetails);
  const loadProviders = useMediaStore((s) => s.loadProviders);
  const addToHistory = useMediaStore((s) => s.addToHistory);
  const selectedSeason = useMediaStore((s) => s.selectedSeason);
  const selectedEpisode = useMediaStore((s) => s.selectedEpisode);
  const setSelectedSeason = useMediaStore((s) => s.setSelectedSeason);
  const setSelectedEpisode = useMediaStore((s) => s.setSelectedEpisode);

  const [ready, setReady] = useState(false);

  const querySeason = Number(params.get('s')) || undefined;
  const queryEpisode = Number(params.get('e')) || undefined;

  const vod: MediaVod | null = useMemo(() => {
    if (!currentMedia || currentMedia.id !== `${k}:${numId}`) return null;
    const season = querySeason ?? selectedSeason;
    const episode = queryEpisode ?? selectedEpisode;
    return {
      ...currentMedia,
      season: currentMedia.kind === 'tv' ? season : undefined,
      episode: currentMedia.kind === 'tv' ? episode : undefined,
    };
  }, [currentMedia, k, numId, querySeason, queryEpisode, selectedSeason, selectedEpisode]);

  useEffect(() => {
    if (!numId) return;
    setReady(false);
    getDetails(k, numId)
      .then((media) => {
        if (media.kind === 'tv') {
          setSelectedSeason(querySeason ?? 1);
          setSelectedEpisode(queryEpisode ?? 1);
        }
        return media;
      })
      .then((media) => {
        const target: MediaVod = {
          ...media,
          season: media.kind === 'tv' ? querySeason ?? 1 : undefined,
          episode: media.kind === 'tv' ? queryEpisode ?? 1 : undefined,
        };
        usePlayerStore.getState().playVideo(target);
        addToHistory(target);
        loadProviders(target);
        setReady(true);
      })
      .catch(() => {
        /* error shown by store */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k, numId]);

  const changeSeason = (season: number) => {
    setSelectedSeason(season);
    setSelectedEpisode(1);
    if (vod) {
      const target = { ...vod, season, episode: 1 };
      usePlayerStore.getState().playVideo(target);
      addToHistory(target);
      loadProviders(target);
    }
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('s', String(season));
        next.set('e', '1');
        return next;
      },
      { replace: true },
    );
  };

  const changeEpisode = (episode: number) => {
    setSelectedEpisode(episode);
    if (vod) {
      const target = { ...vod, episode };
      usePlayerStore.getState().playVideo(target);
      addToHistory(target);
      loadProviders(target);
    }
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('e', String(episode));
        return next;
      },
      { replace: true },
    );
  };

  if (!numId) return <ErrorState message="Identificador no válido." />;

  if (error) {
    return <ErrorState message={error} onRetry={() => getDetails(k, numId)} />;
  }

  return (
    <div className="animate-fade-in space-y-5">
      {!ready || !vod ? (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface/60">
          <Loader2 className="h-8 w-8 animate-spin text-fuchsia-300" />
          <p className="text-sm text-muted">Preparando reproductor…</p>
        </div>
      ) : (
        <>
          <MediaPlayer vod={vod} />

          {vod.kind === 'tv' && vod.seasons && vod.seasons > 0 && (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface/60 p-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <ListVideo className="h-4.5 w-4.5 text-fuchsia-300" />
                Episodio
              </div>
              <Select
                value={String(selectedSeason)}
                onChange={(v) => changeSeason(Number(v))}
                ariaLabel="Temporada"
                options={Array.from({ length: Math.min(vod.seasons, 30) }).map((_, i) => ({
                  value: String(i + 1),
                  label: `Temporada ${i + 1}`,
                }))}
              />
              <Select
                value={String(selectedEpisode)}
                onChange={(v) => changeEpisode(Number(v))}
                ariaLabel="Episodio"
                options={Array.from({ length: 24 }).map((_, i) => ({
                  value: String(i + 1),
                  label: `Episodio ${i + 1}`,
                }))}
              />
              <button
                onClick={() => navigate(`/media/${vod.kind}/${vod.tmdbId}`)}
                className={cn(
                  'ml-auto inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-fuchsia-400/40 hover:text-fuchsia-300',
                )}
              >
                <ArrowLeft className="h-4 w-4" /> Ficha
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
