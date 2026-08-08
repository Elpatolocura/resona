import type { LucideIcon } from 'lucide-react';
import { Music2 } from 'lucide-react';
import { cn } from '../utils/format';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export default function EmptyState({
  icon: Icon = Music2,
  title,
  description,
  action,
  compact,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-line bg-surface/40 text-center',
        compact ? 'px-4 py-10' : 'px-6 py-16',
        className,
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-fuchsia-400">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-text">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
