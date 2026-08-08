import { useEffect, useRef } from 'react';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export default function VolumeControl() {
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMute = usePlayerStore((s) => s.toggleMute);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (input) {
      const fill = muted ? 0 : volume * 100;
      input.style.setProperty('--fill', `${fill}%`);
    }
  }, [volume, muted]);

  const Icon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleMute}
        className="rounded-full p-1.5 text-muted transition hover:bg-surface-2 hover:text-text"
        aria-label={muted ? 'Activar sonido' : 'Silenciar'}
      >
        <Icon className="h-4.5 w-4.5" />
      </button>
      <input
        ref={inputRef}
        type="range"
        min={0}
        max={100}
        value={muted ? 0 : Math.round(volume * 100)}
        onChange={(e) => setVolume(Number(e.target.value) / 100)}
        className="h-4 w-20 sm:w-24"
        aria-label="Volumen"
      />
    </div>
  );
}
