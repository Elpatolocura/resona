import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { cn } from '../utils/format';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  danger = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl',
              danger ? 'bg-red-500/15 text-red-400' : 'bg-brand/15 text-fuchsia-300',
            )}
          >
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <p className="pt-1 text-xs leading-relaxed text-muted sm:text-sm">
            {message ?? 'Esta acción no se puede deshacer.'}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-muted transition hover:bg-surface-3 hover:text-text sm:px-4 sm:py-2 sm:text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95 sm:px-5 sm:py-2 sm:text-sm',
              danger
                ? 'bg-red-500 shadow-red-500/25'
                : 'bg-brand shadow-fuchsia-500/25',
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
