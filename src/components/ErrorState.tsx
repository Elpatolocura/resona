import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export default function ErrorState({ message, onRetry, compact }: ErrorStateProps) {
  return (
    <div
      className={
        compact
          ? 'flex flex-col items-center gap-3 rounded-2xl border border-line/60 bg-surface/50 px-4 py-8 text-center'
          : 'flex flex-col items-center justify-center gap-3 rounded-3xl border border-line/60 bg-surface/50 px-6 py-16 text-center'
      }
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <p className="text-sm text-muted">
        {message ?? 'No se pudo conectar con el servicio de música. Inténtalo de nuevo.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 transition hover:opacity-90 active:scale-95"
        >
          <RotateCw className="h-4 w-4" />
          Reintentar
        </button>
      )}
    </div>
  );
}
