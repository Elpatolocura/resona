import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Clock, Film, Heart, Play, Star, Tv } from 'lucide-react';
import type { MediaVod } from '../types';
import type { TmdbKind } from '../services/tmdb';
import { useMediaStore } from '../store/mediaStore';
import { usePlayerStore } from '../store/playerStore';
import { toast } from '../store/toastStore';
import MediaGrid from '../components/media/MediaGrid';
import ErrorState from '../components/ErrorState';
import Select from '../components/Select';
import { Skeleton } from '../components/Skeleton';
import { cn } from '../utils/format';
import { formatRating, formatRuntime } from '../utils/media';

export default function MediaDetailPage() {
  const { kind, id } = useParams<{ kind: string; id: string }>();
  const navigate = useNavigate();
  const k = (kind === 'tv' ? 'tv' : 'movie') as TmdbKind;
  const numId = Number(id);

  const currentMedia = useMediaStore((s) => s.currentMedia);
  const similar = useMediaStore((s) => s.similar);
  const loading = useMediaStore((s) => s.loading);
  const error = useMediaStore((s) => s.error);
  const getDetails = useMediaStore((s) => s.getDetails);
  const getSimilar = useMediaStore((s) => s.getSimilar);
  const isFav = useMediaStore((s) => s.isVodFavorite(`${k}:${numId}`));
  const toggleVodFavorite = useMediaStore((s) => s.toggleVodFavorite);
  const selectedSeason = useMediaStore((s) => s.selectedSeason);
  const selectedEpisode = useMediaStore((s) => s.selectedEpisode);
  const setSelectedSeason = useMediaStore((s) => s.setSelectedSeason);
  const setSelectedEpisode = useMediaStore((s) => s.setSelectedEpisode);

  useEffect(() => {
    if (!numId) return;
    getDetails(k, numId)
      .then((media) => {
        getSimilar(k, numId);
        if (media.kind === 'tv' && media.seasons && media.seasons > 0) {
          setSelectedSeason(1);
          setSelectedEpisode(1);
        }
      })
      .catch(() => {
        /* error shown by store */
      });
  }, [k, numId, getDetails, getSimilar, setSelectedSeason, setSelectedEpisode]);

  if (!numId) return <ErrorState message="Identificador no válido." />;

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="h-64 animate-pulse rounded-3xl bg-surface-2/70 sm:h-80" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => getDetails(k, numId)} />;
  }

  if (!currentMedia || currentMedia.id !== `${k}:${numId}`) {
    return <ErrorState message="No se pudo cargar el contenido." />;
  }

  const media = currentMedia;
  const isMovie = media.kind === 'movie';
  const rating = formatRating(media.rating);

  const handleWatch = () => {
    const vod: MediaVod = {
      ...media,
      season: isMovie ? undefined : selectedSeason,
      episode: isMovie ? undefined : selectedEpisode,
    };
    usePlayerStore.getState().playVideo(vod);
    navigate(`/watch/${media.kind}/${media.tmdbId}`);
  };

  return (
    <div className="animate-fade-in space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface">
        {media.backdrop && (
          <img
            src={media.backdrop}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-surface/30" />

        <div className="relative flex flex-col items-center gap-6 px-6 py-8 sm:flex-row sm:items-end sm:px-8 sm:py-10">
          <div className="relative shrink-0">
            <div className="h-52 w-36 overflow-hidden rounded-2xl bg-brand/20 shadow-2xl shadow-black/50 sm:h-60 sm:w-40">
              {media.poster ? (
                <img src={media.poster} alt={media.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {isMovie ? (
                    <Film className="h-10 w-10 text-fuchsia-300/60" />
                  ) : (
                    <Tv className="h-10 w-10 text-fuchsia-300/60" />
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-300">
              {isMovie ? 'Película' : 'Serie de televisión'}
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">{media.title}</h1>

            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted sm:justify-start">
              {media.year && <span>{media.year}</span>}
              {rating && (
                <span className="flex items-center gap-1 font-semibold text-amber-300">
                  <Star className="h-3.5 w-3.5 fill-current" /> {rating}
                </span>
              )}
              {media.certification && (
                <span className="rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  +18
                </span>
              )}
              {media.runtime ? (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {formatRuntime(media.runtime)}
                </span>
              ) : media.seasons ? (
                <span>{media.seasons} temporada{media.seasons > 1 ? 's' : ''}</span>
              ) : null}
              {media.status && <span className="text-faint">{media.status}</span>}
            </div>

            {media.genres && media.genres.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                {media.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-line px-2.5 py-0.5 text-[11px] text-muted"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <button
                onClick={handleWatch}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-xl shadow-fuchsia-500/30 transition hover:scale-[1.03] hover:opacity-90 active:scale-95"
              >
                <Play className="h-4.5 w-4.5 fill-current" />
                {isMovie ? 'Ver película' : `Ver T${selectedSeason} E${selectedEpisode}`}
              </button>
              <button
                onClick={() => {
                  toggleVodFavorite(media);
                  toast(
                    isFav ? 'Quitado de favoritos' : 'Añadido a favoritos',
                    isFav ? 'info' : 'success',
                  );
                }}
                aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-bg/40 text-muted backdrop-blur transition hover:border-fuchsia-400/40 hover:text-fuchsia-300"
              >
                <Heart className={cn('h-5 w-5', isFav && 'fill-accent-2 text-accent-2')} />
              </button>
            </div>

            {!isMovie && media.seasons && media.seasons > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Select
                  value={String(selectedSeason)}
                  onChange={(v) => setSelectedSeason(Number(v))}
                  ariaLabel="Temporada"
                  options={Array.from({ length: Math.min(media.seasons, 30) }).map((_, i) => ({
                    value: String(i + 1),
                    label: `Temporada ${i + 1}`,
                  }))}
                />
                <Select
                  value={String(selectedEpisode)}
                  onChange={(v) => setSelectedEpisode(Number(v))}
                  ariaLabel="Episodio"
                  options={Array.from({ length: 24 }).map((_, i) => ({
                    value: String(i + 1),
                    label: `Episodio ${i + 1}`,
                  }))}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {media.overview && (
        <section className="space-y-2">
          <h2 className="text-lg font-extrabold tracking-tight">Sinopsis</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-muted">{media.overview}</p>
        </section>
      )}

      {(media.cast?.length || media.director) && (
        <section className="space-y-2">
          <h2 className="text-lg font-extrabold tracking-tight">Elenco</h2>
          <div className="flex flex-wrap items-center gap-2">
            {media.director && (
              <span className="rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-semibold text-text">
                Dir: {media.director}
              </span>
            )}
            {media.cast?.slice(0, 12).map((actor) => (
              <span
                key={actor}
                className="rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs text-muted"
              >
                {actor}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <Tv className="h-5 w-5 text-fuchsia-300" /> Contenido similar
        </h2>
        {similar.length === 0 ? (
          <p className="text-sm text-faint">No hay contenido similar disponible.</p>
        ) : (
          <MediaGrid items={similar} skeletonCount={8} />
        )}
      </section>
    </div>
  );
}
