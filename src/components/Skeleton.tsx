import { cn } from '../utils/format';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-surface-2/70', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface/60 p-4">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="mt-4 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}

export function TrackRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl px-3 py-2.5">
      <Skeleton className="h-11 w-11 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="hidden h-3 w-10 sm:block" />
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
