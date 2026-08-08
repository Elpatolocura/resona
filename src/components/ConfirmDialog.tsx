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
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              danger ? 'bg-red-500/15 text-red-400' : 'bg-brand/15 text-fuchsia-300',
            )}
          >
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="pt-1.5 text-sm leading-relaxed text-muted">
            {message ?? 'Esta acción no se puede deshacer.'}
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-surface-3 hover:text-text"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={cn(
              'rounded-full px-5 py-2 text-sm font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95',
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
