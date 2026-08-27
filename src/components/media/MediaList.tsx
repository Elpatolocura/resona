import { useNavigate } from 'react-router-dom';
import { Film, Music2, Play, Star, Trash2, Tv } from 'lucide-react';
import type { AudiusTrack, Media, MediaVod } from '../../types';
import { usePlayerStore } from '../../store/playerStore';
import { formatTime, imageUrl, isPlayable } from '../../utils/format';
import { cn } from '../../utils/format';
import { formatRating, mediaSubtitle, vodMediaTypeLabel } from '../../utils/media';
import TrackMenu from '../TrackMenu';
import { TrackRowSkeleton } from '../Skeleton';
import EmptyState from '../EmptyState';

interface MediaListProps {
  items: Media[];
  loading?: boolean;
  skeletonCount?: number;
  onPlayMusic?: (musicIndex: number) => void;
  canRemove?: (media: Media) => void;
  removeTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export default function MediaList({
  items,
  loading,
  skeletonCount = 8,
  onPlayMusic,
  canRemove,
  removeTitle = 'Quitar',
  emptyTitle = 'Sin contenido',
  emptyDescription,
  className,
}: MediaListProps) {
  const navigate = useNavigate();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  if (loading) {
    return (
      <div className={cn('flex flex-col', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <TrackRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        compact
        className={className}
      />
    );
  }

  let musicCursor = -1;

  const musicQueue = (): AudiusTrack[] =>
    items
      .filter((m): m is Extract<Media, { kind: 'music' }> => m.kind === 'music')
      .map((m) => m.track);

  const playMusicFrom = (fullIndex: number) => {
    const before = items.slice(0, fullIndex).filter((m) => m.kind === 'music').length;
    const queue = musicQueue();
    if (onPlayMusic) {
      onPlayMusic(before);
    } else if (before < queue.length) {
      usePlayerStore.getState().playFrom(queue, before);
    }
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {items.map((media, index) => {
        if (media.kind === 'music') {
          musicCursor += 1;
          const track = media.track;
          const isCurrent = currentTrack?.id === track.id;
          const playable = isPlayable(track);
          const musicIndex = musicCursor;
          return (
            <div
              key={media.id}
              onClick={() => playable && playMusicFrom(index)}
              className={cn(
                'group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors',
                isCurrent ? 'bg-brand/15' : 'hover:bg-surface-2/70',
                !playable && 'cursor-default opacity-60',
              )}
            >
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
                {track.artwork ? (
                  <img
                    src={imageUrl(track.artwork, '150x150') ?? ''}
                    alt=""
                    loading="lazy"
                    className="h-11 w-11 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/20">
                    <Music2 className="h-5 w-5 text-fuchsia-300/60" />
                  </div>
                )}
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100',
                    isCurrent && 'opacity-100',
                  )}
                >
                  {isCurrent && isPlaying ? (
                    <div className="flex h-4 items-end gap-[3px]">
                      <span className="w-[3px] animate-eq rounded-full bg-white" style={{ animationDelay: '0s' }} />
                      <span className="w-[3px] animate-eq rounded-full bg-white" style={{ animationDelay: '0.25s' }} />
                      <span className="w-[3px] animate-eq rounded-full bg-white" style={{ animationDelay: '0.5s' }} />
                    </div>
                  ) : (
                    <Play className="h-4.5 w-4.5 fill-white text-white" />
                  )}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'truncate text-sm font-semibold',
                    isCurrent ? 'text-fuchsia-300' : 'text-text',
                  )}
                >
                  {media.title}
                </p>
                <p className="truncate text-xs text-muted">{media.subtitle}</p>
              </div>

              <span className="hidden shrink-0 text-xs tabular-nums text-faint sm:block">
                {formatTime(media.duration)}
              </span>

              <TrackMenu track={track} className="shrink-0" />

              {canRemove && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    canRemove(media);
                  }}
                  title={removeTitle}
                  aria-label={removeTitle}
                  className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-red-500/15 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          );
        }

        const vodMedia = media as MediaVod;
        const rating = formatRating(vodMedia.rating);
        return (
          <div
            key={media.id}
            className="group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-surface-2/70"
            onClick={() => navigate(`/watch/${media.kind}/${vodMedia.tmdbId}`)}
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              {media.poster ? (
                <img
                  src={media.poster}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand/20">
                  {media.kind === 'movie' ? (
                    <Film className="h-5 w-5 text-fuchsia-300/60" />
                  ) : (
                    <Tv className="h-5 w-5 text-fuchsia-300/60" />
                  )}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Play className="h-4.5 w-4.5 fill-white text-white" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-text">{media.title}</p>
              <p className="truncate text-xs text-muted">{mediaSubtitle(media)}</p>
            </div>

            {rating && (
              <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-amber-300 sm:flex">
                <Star className="h-3.5 w-3.5 fill-current" />
                {rating}
              </span>
            )}

            <span className="hidden shrink-0 rounded-full border border-line px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-faint sm:block">
              {vodMediaTypeLabel(vodMedia)}
            </span>

            {canRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  canRemove(media);
                }}
                title={removeTitle}
                aria-label={removeTitle}
                className="shrink-0 rounded-full p-1.5 text-muted transition hover:bg-red-500/15 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
