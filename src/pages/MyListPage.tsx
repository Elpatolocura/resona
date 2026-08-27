import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Film, MessageSquare, Music2, Play, Trash2, Tv, Swords } from 'lucide-react';
import { useLibraryStore } from '../store/libraryStore';
import { usePlayerStore } from '../store/playerStore';
import TrackList from '../components/TrackList';
import MediaGrid from '../components/media/MediaGrid';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import type { AudiusTrack, Media, MediaForum, MediaVod, MusicMedia } from '../types';
import { cn } from '../utils/format';

type Filter = 'all' | 'music' | 'movie' | 'tv' | 'anime' | 'forum';

const FILTERS: { id: Filter; label: string; icon: typeof Bookmark }[] = [
  { id: 'all', label: 'Todo', icon: Bookmark },
  { id: 'music', label: 'Música', icon: Music2 },
  { id: 'movie', label: 'Películas', icon: Film },
  { id: 'tv', label: 'Series', icon: Tv },
  { id: 'anime', label: 'Anime', icon: Swords },
  { id: 'forum', label: 'Foro', icon: MessageSquare },
];

export default function MyListPage() {
  const navigate = useNavigate();
  const myList = useLibraryStore((s) => s.myList) || [];
  const removeFromMyList = useLibraryStore((s) => s.removeFromMyList);

  const [filter, setFilter] = useState<Filter>('all');
  const [removeItem, setRemoveItem] = useState<Media | null>(null);

  const musicItems = myList.filter((m): m is MusicMedia => m.kind === 'music');
  const movieItems = myList.filter((m): m is MediaVod => m.kind === 'movie');
  const tvItems = myList.filter((m): m is MediaVod => m.kind === 'tv');
  const animeItems = myList.filter((m): m is MediaVod => m.kind === 'anime');
  const forumItems = myList.filter((m): m is MediaForum => m.kind === 'forum');

  const tracks: AudiusTrack[] = musicItems.map((m) => m.track);
  const vodItems: MediaVod[] = filter === 'movie' ? movieItems : filter === 'tv' ? tvItems : filter === 'anime' ? animeItems : [...movieItems, ...tvItems, ...animeItems];

  const total = myList.length;

  const playMusic = (index: number) => {
    if (tracks.length > 0) {
      usePlayerStore.getState().playFrom(tracks, index);
    }
  };

  const showMusic = filter === 'all' || filter === 'music';
  const showVod = filter === 'all' || filter === 'movie' || filter === 'tv';
  const showForum = filter === 'all' || filter === 'forum';

  return (
    <div className="animate-fade-in space-y-6">
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600/40 to-fuchsia-600/40 shadow-xl sm:h-36 sm:w-36">
            <Bookmark className="h-12 w-12 text-fuchsia-300 sm:h-16 sm:w-16" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-fuchsia-300">
              Colección guardada
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-4xl">Mi Lista</h1>
            <p className="mt-1 text-sm text-muted">
              {total} {total === 1 ? 'elemento guardado' : 'elementos guardados'} (música, películas, series e hilos del foro)
            </p>
          </div>
          {tracks.length > 0 && (
            <button
              onClick={() => playMusic(0)}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-white shadow-xl shadow-fuchsia-500/30 transition hover:scale-[1.03] hover:opacity-90 active:scale-95"
            >
              <Play className="h-4.5 w-4.5 fill-current" /> Reproducir música
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition',
              filter === id
                ? 'border-fuchsia-400/50 bg-brand/15 text-fuchsia-300'
                : 'border-line bg-surface/70 text-muted hover:border-fuchsia-400/40 hover:text-fuchsia-300',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className="text-xs text-faint">
              {id === 'all'
                ? total
                : id === 'music'
                  ? musicItems.length
                  : id === 'movie'
                    ? movieItems.length
                    : id === 'tv'
                      ? tvItems.length
                      : forumItems.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {total === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Tu lista está vacía"
          description="Agrega tus canciones, películas, series e hilos del foro favoritos a Mi Lista para acceder a ellos rápidamente."
        />
      ) : (
        <>
          {showMusic && musicItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-faint">
                <Music2 className="h-4 w-4" /> Canciones ({musicItems.length})
              </h2>
              <TrackList
                tracks={tracks}
                onPlay={(idx) => playMusic(idx)}
                canRemove={(track) => {
                  const media = musicItems.find((m) => m.id === track.id || m.track.id === track.id);
                  if (media) setRemoveItem(media);
                }}
                removeTitle="Quitar de Mi Lista"
              />
            </div>
          )}

          {showVod && vodItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-faint">
                {filter === 'movie' ? <Film className="h-4 w-4" /> : filter === 'tv' ? <Tv className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}{' '}
                {filter === 'movie' ? `Películas (${movieItems.length})` : filter === 'tv' ? `Series (${tvItems.length})` : `Películas y series (${vodItems.length})`}
              </h2>
              <MediaGrid
                items={vodItems}
                onRemove={(vod) => setRemoveItem(vod)}
                emptyTitle="Sin contenido en esta categoría"
              />
            </div>
          )}

          {showForum && forumItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-faint">
                <MessageSquare className="h-4 w-4" /> Hilos del Foro ({forumItems.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {forumItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/forum/${item.post.id}`)}
                    className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface/70 p-4 transition-all hover:border-fuchsia-400/30 hover:bg-surface hover:shadow-xl cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-full bg-brand/15 px-2.5 py-0.5 text-[10px] font-bold text-fuchsia-300">
                          {item.post.category?.toUpperCase() || 'GENERAL'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRemoveItem(item);
                          }}
                          className="rounded-full p-1 text-muted opacity-0 transition hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"
                          title="Quitar de Mi Lista"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <h3 className="mt-2 text-sm font-bold text-text line-clamp-2">
                        {item.post.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted line-clamp-2">
                        {item.post.body}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-line pt-2 text-[11px] text-faint">
                      <span>Por {item.post.author}</span>
                      <span>{item.post.comments?.length || 0} comentarios</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirm Remove Modal */}
      <ConfirmDialog
        open={removeItem !== null}
        title="Quitar de Mi Lista"
        message={`¿Estás seguro de que deseas quitar «${removeItem?.title}» de Mi Lista?`}
        confirmLabel="Quitar"
        danger={true}
        onClose={() => setRemoveItem(null)}
        onConfirm={() => {
          if (removeItem) {
            removeFromMyList(removeItem.id);
            setRemoveItem(null);
          }
        }}
      />
    </div>
  );
}
