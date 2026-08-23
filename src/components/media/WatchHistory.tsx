import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, Play, Trash2, X } from 'lucide-react';
import { useMediaStore } from '../../store/mediaStore';
import { toast } from '../../store/toastStore';
import { vodMediaTypeLabel } from '../../utils/media';
import ConfirmDialog from '../ConfirmDialog';
import EmptyState from '../EmptyState';

export default function WatchHistory() {
  const history = useMediaStore((s) => s.watchHistory);
  const clearHistory = useMediaStore((s) => s.clearHistory);
  const removeFromHistory = useMediaStore((s) => s.removeFromHistory);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{ id: string; title: string } | null>(null);
  const navigate = useNavigate();

  if (history.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <History className="h-5 w-5 text-fuchsia-300" /> Continuar viendo
        </h2>
        <button
          onClick={() => setConfirmClear(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-red-400/40 hover:text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" /> Limpiar todo
        </button>
      </div>

      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
        {history.map(({ media }) => (
          <div
            key={media.id}
            className="group relative w-36 shrink-0 cursor-pointer rounded-2xl bg-surface/70 p-2 transition-all duration-300 hover:bg-surface-2 hover:shadow-xl hover:shadow-black/40"
            onClick={() => navigate(`/watch/${media.kind}/${media.tmdbId}`)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setConfirmRemove({ id: media.id, title: media.title });
              }}
              className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
              aria-label="Eliminar del historial"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl">
              {media.poster ? (
                <img
                  src={media.poster}
                  alt={media.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand/20">
                  <History className="h-8 w-8 text-fuchsia-300/60" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-xl">
                  <Play className="ml-0.5 h-4.5 w-4.5 fill-current" />
                </span>
              </div>
            </div>
            <p className="mt-2 truncate px-0.5 text-sm font-semibold text-text" title={media.title}>
              {media.title}
            </p>
            <p className="px-0.5 text-[11px] text-muted">
              {vodMediaTypeLabel(media)}
              {media.year ? ` · ${media.year}` : ''}
            </p>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Limpiar historial"
        message="¿Seguro que quieres borrar todo tu historial de visualización?"
        confirmLabel="Borrar"
        onClose={() => setConfirmClear(false)}
        onConfirm={() => {
          clearHistory();
          toast('Historial borrado', 'info');
        }}
      />

      <ConfirmDialog
        open={confirmRemove !== null}
        title="Eliminar del historial"
        message={confirmRemove ? `¿Quitar "${confirmRemove.title}" de continuar viendo?` : ''}
        confirmLabel="Quitar"
        onClose={() => setConfirmRemove(null)}
        onConfirm={() => {
          if (confirmRemove) {
            removeFromHistory(confirmRemove.id);
            toast('Eliminado del historial', 'info');
          }
          setConfirmRemove(null);
        }}
      />
    </section>
  );
}
