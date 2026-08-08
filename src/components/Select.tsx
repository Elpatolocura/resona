import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/format';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  ariaLabel?: string;
}

export default function Select({ value, onChange, options, className, ariaLabel }: SelectProps) {
  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="w-full cursor-pointer appearance-none rounded-full border border-line bg-surface-2 py-2 pl-4 pr-9 text-sm font-semibold text-text outline-none transition hover:border-fuchsia-400/40 focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface-2 text-text">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-muted" />
    </div>
  );
}
