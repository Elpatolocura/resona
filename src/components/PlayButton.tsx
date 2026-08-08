import { Loader2, Pause, Play } from 'lucide-react';
import type { AudiusTrack } from '../types';
import { usePlayerStore } from '../store/playerStore';
import { isPlayable } from '../utils/format';
import { cn } from '../utils/format';

interface PlayButtonProps {
  track?: AudiusTrack;
  playing?: boolean;
  loading?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PlayButton({
  track,
  playing,
  loading,
  onClick,
  size = 'md',
  className,
}: PlayButtonProps) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const disabled = track ? !isPlayable(track) : false;
  const isCurrent = Boolean(track && currentTrack?.id === track.id);
  const showPlaying = playing ?? (isCurrent && isPlaying);
  const showLoading = loading ?? (isCurrent && isLoading);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
      return;
    }
    if (track) {
      if (isCurrent) {
        togglePlay();
      } else {
        playTrack(track);
      }
    }
  };

  const sizeClass =
    size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-13 w-13' : 'h-11 w-11';
  const iconClass =
    size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

  if (disabled) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      aria-label={showPlaying ? 'Pausar' : 'Reproducir'}
      className={cn(
        'flex items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-fuchsia-500/30 transition-all hover:scale-105 hover:shadow-fuchsia-500/50 active:scale-95',
        sizeClass,
        className,
      )}
    >
      {showLoading ? (
        <Loader2 className={cn(iconClass, 'animate-spin')} />
      ) : showPlaying ? (
        <Pause className={cn(iconClass, 'fill-current')} />
      ) : (
        <Play className={cn(iconClass, 'ml-0.5 fill-current')} />
      )}
    </button>
  );
}
