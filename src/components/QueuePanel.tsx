import { useNavigate } from 'react-router-dom';
import { Music2, Play, Pause, X, GripVertical, ListMusic, Trash2 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { imageUrl, cn, formatTime } from '../utils/format';
import { mediaSubtitle } from '../utils/media';
import type { Media } from '../types';
import ConfirmDialog from './ConfirmDialog';
import Pagination from './Pagination';
import ImageWithFallback from './ImageWithFallback';
import { useState } from 'react';

const QUEUE_PER_PAGE = 8;

interface QueuePanelProps {
  className?: string;
  onClose?: () => void;
}

export default function QueuePanel({ className, onClose }: QueuePanelProps) {
  const queue = usePlayerStore((s) => s.queue);
  const queueIndex = usePlayerStore((s) => s.queueIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playMediaList = usePlayerStore((s) => s.playMediaList);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);
  const [confirmClear, setConfirmClear] = useState(false);
  const [queuePage, setQueuePage] = useState(1);

  const subtitle = (media: Media) =>
    media.kind === 'music' ? media.subtitle : mediaSubtitle(media);

  const art = (media: Media) => {
    if (media.kind === 'music') return imageUrl(media.track.artwork, '150x150');
    return media.poster;
  };

  const clearQueue = () => {
    const store = usePlayerStore.getState();
    for (let i = queue.length - 1; i > queueIndex; i--) {
      store.removeFromQueue(i);
    }
    setConfirmClear(false);
  };

  const totalQueuePages = Math.ceil(queue.length / QUEUE_PER_PAGE);
  const paginatedQueue = queue.slice((queuePage - 1) * QUEUE_PER_PAGE, queuePage * QUEUE_PER_PAGE);

  return (
    <div className={cn('flex h-full flex-col bg-surface/95 backdrop-blur-xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <ListMusic className="h-5 w-5 text-fuchsia-300" />
          <h2 className="text-lg font-bold text-text">Cola de reproducción</h2>
          <span className="rounded-full bg-fuchsia-500/15 px-2 py-0.5 text-[11px] font-bold text-fuchsia-300">
            {queue.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted transition hover:border-red-400/40 hover:text-red-300"
            >
              <Trash2 className="h-3 w-3" /> Limpiar
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-muted transition hover:bg-surface-2 hover:text-text"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Now playing */}
      {queue[queueIndex] && (
        <div className="border-b border-line bg-brand/10 px-4 py-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-300">
            Reproduciendo ahora
          </p>
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
              {art(queue[queueIndex]) ? (
                <img src={art(queue[queueIndex]) ?? undefined} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-3">
                  <Music2 className="h-5 w-5 text-fuchsia-300/50" />
                </div>
              )}
              {isPlaying && (
                <div className="absolute bottom-1 right-1 flex gap-0.5">
                  <div className="h-2 w-0.5 animate-pulse bg-fuchsia-400" />
                  <div className="h-3 w-0.5 animate-pulse bg-fuchsia-400" style={{ animationDelay: '0.15s' }} />
                  <div className="h-2 w-0.5 animate-pulse bg-fuchsia-400" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-fuchsia-300">
                {queue[queueIndex].title}
              </p>
              <p className="truncate text-xs text-muted">{subtitle(queue[queueIndex])}</p>
            </div>
          </div>
        </div>
      )}

      {/* Up next */}
      <div className="flex-1 overflow-y-auto">
        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Music2 className="h-12 w-12 text-fuchsia-300/30" />
            <p className="mt-3 text-sm text-muted">La cola está vacía</p>
            <p className="mt-1 text-xs text-faint">Añade canciones desde cualquier parte de la app</p>
          </div>
        ) : (
          <>
            <div className="px-4 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
                Cola ({queue.length} canciones)
              </p>
            </div>
            <div className="space-y-0.5 px-2">
              {paginatedQueue.map((media, i) => {
                const index = (queuePage - 1) * QUEUE_PER_PAGE + i;
                const isCurrent = index === queueIndex;
                const isPast = index < queueIndex;

                return (
                  <div
                    key={`${media.id}-${index}`}
                    onClick={() => playMediaList(queue, index)}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2 transition cursor-pointer',
                      isCurrent
                        ? 'bg-brand/15 border border-fuchsia-400/30'
                        : isPast
                          ? 'opacity-50 hover:bg-surface-2'
                          : 'hover:bg-surface-2 border border-transparent',
                    )}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      <ImageWithFallback
                        src={art(media)}
                        alt=""
                        className="h-full w-full object-cover"
                        fallbackType={media.kind === 'music' ? 'music' : media.kind === 'movie' ? 'movie' : 'tv'}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                        {isCurrent && isPlaying ? (
                          <Pause className="h-4 w-4 fill-white text-white" />
                        ) : (
                          <Play className="h-4 w-4 fill-white text-white" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className={cn(
                        'truncate text-sm font-medium',
                        isCurrent ? 'text-fuchsia-300' : 'text-text',
                      )}>
                        {media.title}
                      </p>
                      <p className="truncate text-xs text-muted">{subtitle(media)}</p>
                    </div>

                    <span className="text-[11px] tabular-nums text-faint">
                      {media.kind === 'music' ? formatTime(media.duration) : media.runtime ? `${media.runtime}m` : ''}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(index);
                      }}
                      className="shrink-0 rounded p-1 text-faint opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            {totalQueuePages > 1 && <div className="px-3 py-2"><Pagination currentPage={queuePage} totalPages={totalQueuePages} onPageChange={setQueuePage} /></div>}
          </>
        )}
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Limpiar cola"
        message="¿Seguro que quieres eliminar todas las canciones de la cola excepto la que está sonando?"
        onClose={() => setConfirmClear(false)}
        onConfirm={clearQueue}
      />
    </div>
  );
}
