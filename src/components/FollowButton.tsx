import { useState } from 'react';
import { UserCheck, UserPlus } from 'lucide-react';
import type { AudiusUser } from '../types';
import { useLibraryStore } from '../store/libraryStore';
import { toast } from '../store/toastStore';
import { cn } from '../utils/format';
import ConfirmDialog from './ConfirmDialog';

interface FollowButtonProps {
  artist: AudiusUser;
  size?: 'sm' | 'md';
  className?: string;
}

export default function FollowButton({ artist, size = 'md', className }: FollowButtonProps) {
  const artists = useLibraryStore((s) => s.artists);
  const toggleArtist = useLibraryStore((s) => s.toggleArtist);
  const [confirmUnfollow, setConfirmUnfollow] = useState(false);

  const following = artists.some((a) => a.id === artist.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (following) {
      setConfirmUnfollow(true);
    } else {
      toggleArtist(artist);
      toast(`Siguiendo a ${artist.name}`, 'success');
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        aria-label={following ? `Dejar de seguir a ${artist.name}` : `Seguir a ${artist.name}`}
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-full border font-semibold transition active:scale-95',
          size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
          following
            ? 'border-line bg-surface-2 text-text hover:border-fuchsia-400/40 hover:text-fuchsia-300'
            : 'border-transparent bg-brand text-white shadow-lg shadow-fuchsia-500/25 hover:opacity-90',
          className,
        )}
      >
        {following ? (
          <UserCheck className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        ) : (
          <UserPlus className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        )}
        {following ? 'Siguiendo' : 'Seguir'}
      </button>

      <ConfirmDialog
        open={confirmUnfollow}
        title="Dejar de seguir"
        message={`¿Dejar de seguir a ${artist.name}? Se quitará de tu lista de artistas en la biblioteca.`}
        confirmLabel="Dejar de seguir"
        onClose={() => setConfirmUnfollow(false)}
        onConfirm={() => {
          toggleArtist(artist);
          toast(`Dejaste de seguir a ${artist.name}`, 'info');
        }}
      />
    </>
  );
}
