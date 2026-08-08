import { useCallback, useRef, useState } from 'react';
import { cn } from '../utils/format';

interface ProgressBarProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
}

export default function ProgressBar({ value, max, onChange, className }: ProgressBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const safeMax = Number.isFinite(max) && max > 0 ? max : 0;
  const ratio = safeMax > 0 ? Math.min(1, Math.max(0, value / safeMax)) : 0;

  const computeFromEvent = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || safeMax <= 0) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onChange(ratio * safeMax);
    },
    [onChange, safeMax],
  );

  return (
    <div
      ref={trackRef}
      className={cn(
        'group relative flex h-4 w-full cursor-pointer items-center touch-none select-none',
        className,
      )}
      onPointerDown={(e) => {
        setDragging(true);
        computeFromEvent(e.clientX);
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (dragging) computeFromEvent(e.clientX);
      }}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-surface-3 transition-all group-hover:h-2">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-brand"
          style={{ width: `${ratio * 100}%` }}
        />
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          style={{ left: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}
