import { Clapperboard } from 'lucide-react';
import type { MediaVod } from '../../types';
import MediaCard from './MediaCard';
import EmptyState from '../EmptyState';
import ErrorState from '../ErrorState';
import { cn } from '../../utils/format';

interface MediaGridProps {
  items?: MediaVod[];
  loading?: boolean;
  skeletonCount?: number;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  onRemove?: (media: MediaVod) => void;
  className?: string;
}

export function MediaCardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface/60 p-3">
      <div className="aspect-[2/3] animate-pulse rounded-xl bg-surface-2/70" />
      <div className="mt-3 h-4 w-3/4 animate-pulse rounded-lg bg-surface-2/70" />
      <div className="mt-2 h-3 w-1/2 animate-pulse rounded-lg bg-surface-2/70" />
    </div>
  );
}

export default function MediaGrid({
  items = [],
  loading,
  skeletonCount = 10,
  error,
  onRetry,
  emptyTitle = 'Sin resultados',
  emptyDescription,
  onRemove,
  className,
}: MediaGridProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
          className,
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <MediaCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} compact />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Clapperboard}
        title={emptyTitle}
        description={emptyDescription}
        compact
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
        className,
      )}
    >
      {items.map((media) => (
        <MediaCard key={media.id} media={media} onRemove={onRemove} />
      ))}
    </div>
  );
}
