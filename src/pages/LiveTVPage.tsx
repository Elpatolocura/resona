import { useState, useEffect, useRef } from 'react';
import { Radio, Search, Play, Pause, Volume2, VolumeX, Maximize, Loader2, AlertCircle } from 'lucide-react';
import { fetchIptvChannels, filterChannels, IPTV_CATEGORIES, type IptvChannel, type IptvCategory } from '../services/iptv';
import { cn } from '../utils/format';

export default function LiveTVPage() {
  const [channels, setChannels] = useState<IptvChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<IptvChannel | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<IptvCategory>('All');
  const [muted, setMuted] = useState(false);
  const [playing, setPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchIptvChannels()
      .then((data) => {
        setChannels(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (playing) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  }, [playing, selected]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const filtered = filterChannels(channels, search, category, 'All');

  const toggleFullscreen = () => {
    const el = videoRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen();
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-fuchsia-400" />
          <p className="mt-4 text-sm text-muted">Cargando canales...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
          <p className="mt-4 text-sm text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
          <Radio className="h-6 w-6 text-fuchsia-300" /> TV en Vivo
        </h1>
        <p className="mt-1 text-sm text-muted">
          {channels.length} canales de televisión colombiana en vivo
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Player */}
        <div className="flex-1">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-black">
            {selected ? (
              <div className="relative aspect-video">
                <video
                  ref={videoRef}
                  key={selected.id}
                  src={selected.url}
                  autoPlay
                  muted={muted}
                  className="h-full w-full object-contain bg-black"
                  onError={() => {
                    const next = channels.find((ch) => ch.id !== selected.id && ch.url);
                    if (next) setSelected(next);
                  }}
                />

                {/* Controls overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setPlaying(!playing)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
                      >
                        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
                      </button>
                      <button
                        onClick={() => setMuted(!muted)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
                      >
                        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                      </button>
                      <div className="flex items-center gap-2">
                        {selected.logo && (
                          <img src={selected.logo} alt="" className="h-8 w-8 rounded-md object-contain" />
                        )}
                        <div>
                          <p className="text-sm font-bold text-white">{selected.name}</p>
                          <p className="text-xs text-white/60">{selected.country}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={toggleFullscreen}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/30"
                    >
                      <Maximize className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-surface-2">
                <div className="text-center">
                  <Radio className="mx-auto h-12 w-12 text-faint" />
                  <p className="mt-3 text-sm text-muted">Selecciona un canal</p>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar canal..."
                className="w-full rounded-xl border border-line bg-surface-2 py-2.5 pl-10 pr-4 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50"
              />
            </div>
          </div>

          {/* Category chips */}
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
            {IPTV_CATEGORIES.filter((c) => c !== 'XXX').map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  'shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition',
                  category === cat
                    ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                    : 'border-line text-muted hover:text-text',
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-faint">
            {filtered.length} canales encontrados
          </p>
        </div>

        {/* Channel list */}
        <div className="w-full shrink-0 lg:w-80">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto rounded-2xl border border-line bg-surface/50">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Radio className="mx-auto h-8 w-8 text-faint" />
                <p className="mt-2 text-sm text-muted">No se encontraron canales</p>
              </div>
            ) : (
              <div className="divide-y divide-line">
                {filtered.slice(0, 100).map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => { setSelected(ch); setPlaying(true); }}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-surface-2/70',
                      selected?.id === ch.id && 'bg-brand/10 border-l-2 border-fuchsia-400',
                    )}
                  >
                    {ch.logo ? (
                      <img src={ch.logo} alt="" className="h-9 w-9 shrink-0 rounded-lg object-contain bg-white/10 p-0.5" />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/20">
                        <Radio className="h-4 w-4 text-fuchsia-300/60" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-text">{ch.name}</p>
                      <p className="truncate text-xs text-muted">
                        {ch.country}
                        {ch.categories.length > 0 && ` · ${ch.categories.slice(0, 2).join(', ')}`}
                      </p>
                    </div>
                    {selected?.id === ch.id && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
