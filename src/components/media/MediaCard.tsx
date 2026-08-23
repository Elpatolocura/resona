import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Play, Star, Trash2 } from 'lucide-react';
import type { MediaVod } from '../../types';
import { formatRating, vodMediaTypeLabel } from '../../utils/media';
import { cn } from '../../utils/format';
import ImageWithFallback from '../ImageWithFallback';
import { useLibraryStore } from '../../store/libraryStore';
import { toast } from '../../store/toastStore';

interface MediaCardProps {
  media: MediaVod;
  className?: string;
  onRemove?: (media: MediaVod) => void;
}

export default function MediaCard({ media, className, onRemove }: MediaCardProps) {
  const navigate = useNavigate();
  const rating = formatRating(media.rating);
  const isMovie = media.kind === 'movie';
  const toggleMyList = useLibraryStore((s) => s.toggleMyList);
  const isInMyList = useLibraryStore((s) => s.isInMyList(media.id));

  return (
    <div
      className={cn(
        'group relative rounded-2xl bg-surface/70 p-3 transition-all duration-300 hover:bg-surface-2 hover:shadow-xl hover:shadow-black/40',
        className,
      )}
    >
      <Link to={`/media/${media.kind}/${media.tmdbId}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
          <ImageWithFallback
            src={media.poster}
            alt={media.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            fallbackType={media.kind === 'movie' ? 'movie' : 'tv'}
          />

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

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleMyList(media);
              toast(
                isInMyList ? 'Quitado de Mi Lista' : 'Añadido a Mi Lista',
                isInMyList ? 'info' : 'success',
              );
            }}
            aria-label={isInMyList ? 'Quitar de Mi Lista' : 'Añadir a Mi Lista'}
            className={cn(
              'absolute bottom-2 rounded-full p-1.5 backdrop-blur transition group-hover:opacity-100',
              onRemove ? 'left-10' : 'left-2',
              isInMyList
                ? 'bg-brand text-white opacity-100'
                : 'bg-black/50 text-white/80 opacity-0 hover:text-fuchsia-300',
            )}
          >
            <Bookmark className={cn('h-3.5 w-3.5', isInMyList && 'fill-current')} />
          </button>

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
