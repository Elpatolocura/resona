import { Link } from 'react-router-dom';
import { Disc3, ListMusic, Music2 } from 'lucide-react';
import type { AudiusPlaylist } from '../types';
import { imageUrl } from '../utils/format';

interface CollectionCardProps {
  collection: AudiusPlaylist;
  kind?: 'album' | 'playlist';
}

export default function CollectionCard({ collection, kind }: CollectionCardProps) {
  const isAlbum = kind === 'album' || collection.is_album;
  const art = imageUrl(collection.artwork, '480x480');

  return (
    <Link
      to={`/album/${collection.id}`}
      className="group relative rounded-2xl bg-surface/70 p-3 transition-all duration-300 hover:bg-surface-2 hover:shadow-xl hover:shadow-black/40"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl">
        {art ? (
          <img
            src={art}
            alt={collection.playlist_name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand/20">
            {isAlbum ? (
              <Disc3 className="h-10 w-10 text-fuchsia-300/60" />
            ) : (
              <ListMusic className="h-10 w-10 text-fuchsia-300/60" />
            )}
          </div>
        )}
        <div className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
          {isAlbum ? 'Álbum' : 'Playlist'}
        </div>
      </div>

      <div className="mt-3 flex min-w-0 flex-col gap-0.5 px-0.5">
        <p className="truncate text-sm font-semibold text-text" title={collection.playlist_name}>
          {collection.playlist_name}
        </p>
        <p className="truncate text-xs text-muted">{collection.user?.name}</p>
        {typeof collection.track_count === 'number' && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] text-faint">
            <Music2 className="h-3 w-3" />
            {collection.track_count} canciones
          </p>
        )}
      </div>
    </Link>
  );
}
