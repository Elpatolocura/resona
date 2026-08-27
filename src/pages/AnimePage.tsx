import { Swords } from 'lucide-react';
import AnimeCategoryGrid from '../components/media/AnimeCategoryGrid';

export default function AnimePage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
          <Swords className="h-6 w-6 text-fuchsia-300" /> Anime
        </h1>
        <p className="mt-1 text-sm text-muted">
          Explora anime en tendencia, populares y mejor valorados. Datos vía TMDB.
        </p>
      </div>
      <AnimeCategoryGrid />
    </div>
  );
}
