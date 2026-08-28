import { Link } from 'react-router-dom';
import type { AudiusTrack } from '../types';
import { imageUrl, cn, isPlayable } from '../utils/format';
import { usePlayerStore } from '../store/playerStore';
import PlayButton from './PlayButton';
import TrackMenu from './TrackMenu';
import ImageWithFallback from './ImageWithFallback';

interface SongCardProps {
  track: AudiusTrack;
  onPlay?: (track: AudiusTrack) => void;
  className?: string;
}

export default function SongCard({ track, onPlay, className }: SongCardProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isCurrent = currentTrack?.id === track.id;
  const art = imageUrl(track.artwork, '480x480');

  return (
    <div
      className={cn(
        'group relative rounded-2xl bg-surface/70 p-3 transition-all duration-300 hover:bg-surface-2 hover:shadow-xl hover:shadow-black/40',
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl">
        <ImageWithFallback
          src={art}
          alt={track.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          fallbackType="music"
        />
        <div
          className={cn(
            'absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/40',
            isCurrent && 'bg-black/40',
          )}
        />
        <div className="absolute bottom-2 right-2 sm:opacity-0 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100">
          {isPlayable(track) && (
            <PlayButton
              track={track}
              onClick={() => onPlay?.(track)}
              size="lg"
              className="shadow-xl"
            />
          )}
        </div>
        {isCurrent && (
          <div className="absolute left-2 top-2 rounded-full bg-brand/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Sonando
          </div>
        )}
      </div>

      <div className="mt-3 flex items-start gap-1 px-0.5">
        <div className="min-w-0 flex-1">
          <p className="block truncate text-sm font-semibold text-text" title={track.title}>
            {track.title}
          </p>
          <Link
            to={`/artist/${track.user.id}`}
            className="mt-0.5 block truncate text-xs text-muted transition hover:text-text"
          >
            {track.user.name}
          </Link>
        </div>
        <TrackMenu track={track} />
      </div>
    </div>
  );
}
