import { Play, Music2, Trash2 } from 'lucide-react';
import type { AudiusTrack } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { formatTime, imageUrl, isPlayable } from '../utils/format';
import { cn } from '../utils/format';
import TrackMenu from './TrackMenu';
import { TrackRowSkeleton } from './Skeleton';
import EmptyState from './EmptyState';

interface TrackListProps {
  tracks: AudiusTrack[];
  loading?: boolean;
  skeletonCount?: number;
  onPlay?: (index: number, track: AudiusTrack) => void;
  canRemove?: (track: AudiusTrack) => void;
  removeTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export default function TrackList({
  tracks,
  loading,
  skeletonCount = 8,
  onPlay,
  canRemove,
  removeTitle = 'Quitar',
  emptyTitle = 'Sin canciones',
  emptyDescription,
  className,
}: TrackListProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playFrom = usePlayerStore((s) => s.playFrom);

  if (loading) {
    return (
      <div className={cn('flex flex-col', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <TrackRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        compact
        className={className}
      />
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {tracks.map((track, index) => {
        const isCurrent = currentTrack?.id === track.id;
        const playable = isPlayable(track);
        return (
          <div
            key={track.id}
            onClick={() => {
              if (playable) {
                if (onPlay) onPlay(index, track);
                else playFrom(tracks, index);
              }
            }}
            className={cn(
              'group flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition-colors',
              isCurrent ? 'bg-brand/15' : 'hover:bg-surface-2/70',
              !playable && 'cursor-default opacity-60',
            )}
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
              {track.artwork ? (
                <img
                  src={imageUrl(track.artwork, '150x150') ?? imageUrl(track.artwork, '480x480') ?? ''}
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
                {track.title}
              </p>
              <p className="truncate text-xs text-muted">{track.user?.name}</p>
            </div>

            {typeof track.duration === 'number' && (
              <span className="hidden shrink-0 text-xs tabular-nums text-faint sm:block">
                {formatTime(track.duration)}
              </span>
            )}

            <TrackMenu track={track} className="shrink-0" />

            {canRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  canRemove(track);
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
