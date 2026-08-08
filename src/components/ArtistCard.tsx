import { Link } from 'react-router-dom';
import { BadgeCheck, User } from 'lucide-react';
import type { AudiusUser } from '../types';
import { imageUrl, formatCount } from '../utils/format';

interface ArtistCardProps {
  user: AudiusUser;
}

export default function ArtistCard({ user }: ArtistCardProps) {
  const avatar = imageUrl(user.profile_picture, '480x480');

  return (
    <Link
      to={`/artist/${user.id}`}
      className="group flex min-w-40 flex-col items-center gap-3 rounded-2xl bg-surface/70 p-4 text-center transition-all duration-300 hover:bg-surface-2 hover:shadow-xl hover:shadow-black/40"
    >
      <div className="relative h-24 w-24 overflow-hidden rounded-full ring-2 ring-line transition group-hover:ring-fuchsia-400/50">
        {avatar ? (
          <img
            src={avatar}
            alt={user.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand/20">
            <User className="h-9 w-9 text-fuchsia-300/60" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col items-center">
        <span className="flex max-w-full items-center gap-1 text-sm font-semibold text-text">
          <span className="truncate">{user.name}</span>
          {user.is_verified && (
            <BadgeCheck className="h-4 w-4 shrink-0 fill-accent text-bg" />
          )}
        </span>
        <span className="mt-0.5 text-xs text-muted">
          {formatCount(user.follower_count)} seguidores
        </span>
      </div>
    </Link>
  );
}
