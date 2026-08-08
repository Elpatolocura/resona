import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  defaultValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  large?: boolean;
}

export default function SearchBar({
  defaultValue = '',
  onSearch,
  placeholder = 'Buscar canciones, artistas, álbumes…',
  autoFocus,
  large,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value.trim());
      }}
      className="relative w-full"
    >
      <Search
        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted ${
          large ? 'h-5 w-5' : 'h-4.5 w-4.5'
        }`}
      />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar"
        className={cnInput(large)}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue('');
            onSearch('');
          }}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition hover:bg-surface-3 hover:text-text"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}

function cnInput(large?: boolean): string {
  const base =
    'w-full rounded-full border border-line bg-surface/80 pl-11 text-text placeholder:text-faint outline-none transition focus:border-fuchsia-400/50 focus:bg-surface focus:ring-2 focus:ring-fuchsia-500/20';
  return large ? `${base} py-3.5 pr-10 text-base shadow-lg shadow-black/30` : `${base} py-2.5 pr-10 text-sm`;
}
