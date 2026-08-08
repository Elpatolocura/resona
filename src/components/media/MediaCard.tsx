import { Link, useNavigate } from 'react-router-dom';
import { Film, Play, Star, Trash2, Tv } from 'lucide-react';
import type { MediaVod } from '../../types';
import { formatRating, vodMediaTypeLabel } from '../../utils/media';
import { cn } from '../../utils/format';

interface MediaCardProps {
  media: MediaVod;
  className?: string;
  onRemove?: (media: MediaVod) => void;
}

export default function MediaCard({ media, className, onRemove }: MediaCardProps) {
  const navigate = useNavigate();
  const rating = formatRating(media.rating);
  const isMovie = media.kind === 'movie';

  return (
    <div
      className={cn(
        'group relative rounded-2xl bg-surface/70 p-3 transition-all duration-300 hover:bg-surface-2 hover:shadow-xl hover:shadow-black/40',
        className,
      )}
    >
      <Link to={`/media/${media.kind}/${media.tmdbId}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
          {media.poster ? (
            <img
              src={media.poster}
              alt={media.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand/20">
              {isMovie ? (
                <Film className="h-10 w-10 text-fuchsia-300/60" />
              ) : (
                <Tv className="h-10 w-10 text-fuchsia-300/60" />
              )}
            </div>
          )}

          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
              {vodMediaTypeLabel(media)}
            </span>
            {media.certification && (
              <span
                title={`Clasificación ${media.certification}`}
                className="rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-red-900/40"
              >
                +18
              </span>
            )}
          </div>

          {onRemove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRemove(media);
              }}
              aria-label="Quitar de favoritos"
              className="absolute bottom-2 left-2 rounded-full bg-black/50 p-1.5 text-white/80 opacity-0 backdrop-blur transition hover:text-red-400 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}

          {rating && (
            <div className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-amber-300 backdrop-blur">
              <Star className="h-3 w-3 fill-current" />
              {rating}
            </div>
          )}

          <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/watch/${media.kind}/${media.tmdbId}`);
              }}
              aria-label={`Ver ${media.title}`}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-xl shadow-fuchsia-500/40 transition hover:scale-105 active:scale-95"
            >
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex min-w-0 flex-col gap-0.5 px-0.5">
          <p className="truncate text-sm font-semibold text-text" title={media.title}>
            {media.title}
          </p>
          <p className="truncate text-xs text-muted">
            {media.year ?? '—'} {media.runtime ? `· ${Math.floor(media.runtime / 60)} h` : ''}
          </p>
        </div>
      </Link>
    </div>
  );
}
