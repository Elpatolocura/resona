import { useState } from 'react';
import { Music2, Film, Tv } from 'lucide-react';
import { cn } from '../utils/format';

type FallbackType = 'music' | 'movie' | 'tv';

interface ImageWithFallbackProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackType?: FallbackType;
}

const fallbackColors: Record<FallbackType, string> = {
  music: 'bg-gradient-to-br from-violet-600/40 to-fuchsia-600/40',
  movie: 'bg-gradient-to-br from-blue-600/40 to-purple-600/40',
  tv: 'bg-gradient-to-br from-emerald-600/40 to-teal-600/40',
};

const fallbackIcons: Record<FallbackType, typeof Music2> = {
  music: Music2,
  movie: Film,
  tv: Tv,
};

export default function ImageWithFallback({
  src,
  alt,
  className,
  fallbackType = 'music',
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    const Icon = fallbackIcons[fallbackType];
    return (
      <div className={cn('flex items-center justify-center', fallbackColors[fallbackType], className)}>
        <Icon className="h-1/3 w-1/3 text-white/50" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
