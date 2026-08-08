import { Tv } from 'lucide-react';
import CategoryGrid from '../components/media/CategoryGrid';

export default function TvShowsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
          <Tv className="h-6 w-6 text-fuchsia-300" /> Series
        </h1>
        <p className="mt-1 text-sm text-muted">
          Explora series en tendencia, populares y mejor valoradas. Datos vía TMDB.
        </p>
      </div>
      <CategoryGrid kind="tv" />
    </div>
  );
}
