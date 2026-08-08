import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { useLibraryStore } from '../store/libraryStore';
import { toast } from '../store/toastStore';

interface CreatePlaylistModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePlaylistModal({ open, onClose }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createPlaylist = useLibraryStore((s) => s.createPlaylist);
  const navigate = useNavigate();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const playlist = createPlaylist(name, description);
    toast('Playlist creada');
    onClose();
    setName('');
    setDescription('');
    navigate(`/playlist/${playlist.id}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="Nueva playlist">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="playlist-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-faint">
            Nombre
          </label>
          <input
            id="playlist-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Mi playlist de viaje"
            autoFocus
            className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
          />
        </div>
        <div>
          <label htmlFor="playlist-desc" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-faint">
            Descripción (opcional)
          </label>
          <textarea
            id="playlist-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿De qué va esta playlist?"
            rows={2}
            className="w-full resize-none rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-text outline-none transition placeholder:text-faint focus:border-fuchsia-400/50 focus:ring-2 focus:ring-fuchsia-500/20"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-surface-3 hover:text-text"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-full bg-brand px-5 py-2 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/25 transition hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Crear
          </button>
        </div>
      </form>
    </Modal>
  );
}
