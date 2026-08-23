import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useToastStore } from '../store/toastStore';
import { cn } from '../utils/format';

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[120] flex flex-col items-center gap-2 px-4 lg:bottom-6 lg:left-64 lg:items-end lg:pr-6">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={cn(
              'pointer-events-auto flex max-w-sm animate-fade-in cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-2xl shadow-black/50 backdrop-blur',
              t.type === 'success' && 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200',
              t.type === 'error' && 'border-red-400/30 bg-red-500/15 text-red-200',
              t.type === 'info' && 'border-sky-400/30 bg-sky-500/15 text-sky-200',
            )}
          >
            <Icon className="h-4.5 w-4.5 shrink-0" />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
