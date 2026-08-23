import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/format';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 pt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-9 items-center justify-center gap-1 rounded-full border border-line bg-surface/60 px-3 text-xs font-semibold text-muted transition hover:border-fuchsia-400/40 hover:text-text disabled:opacity-30"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Anterior
      </button>

      <div className="flex gap-1">
        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`dots-${i}`} className="flex h-9 w-9 items-center justify-center text-xs text-faint">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all',
                currentPage === page
                  ? 'bg-brand text-white shadow-lg shadow-fuchsia-500/25'
                  : 'bg-surface/60 text-muted hover:bg-surface-2 hover:text-text',
              )}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-9 items-center justify-center gap-1 rounded-full border border-line bg-surface/60 px-3 text-xs font-semibold text-muted transition hover:border-fuchsia-400/40 hover:text-text disabled:opacity-30"
      >
        Siguiente <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
