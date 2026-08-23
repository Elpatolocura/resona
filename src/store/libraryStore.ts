import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AudiusTrack, AudiusUser, LocalPlaylist, Media } from '../types';
import { trackToMedia } from '../utils/media';

interface LibraryState {
  favorites: AudiusTrack[];
  playlists: LocalPlaylist[];
  artists: AudiusUser[];
  myList: Media[];
  toggleFavorite: (track: AudiusTrack) => void;
  isFavorite: (id: string) => boolean;
  toggleArtist: (artist: AudiusUser) => void;
  isFollowing: (id: string) => boolean;
  createPlaylist: (name: string, description?: string) => LocalPlaylist;
  deletePlaylist: (id: string) => void;
  updatePlaylist: (id: string, patch: { name?: string; description?: string }) => void;
  addToPlaylist: (playlistId: string, track: AudiusTrack) => boolean;
  addMediaToPlaylist: (playlistId: string, media: Media) => boolean;
  removeFromPlaylist: (playlistId: string, mediaId: string) => void;
  toggleMyList: (item: Media) => void;
  isInMyList: (id: string) => boolean;
  removeFromMyList: (id: string) => void;
}

interface PersistedV0 {
  playlists?: Array<{
    id: string;
    name: string;
    description: string;
    createdAt: number;
    tracks: AudiusTrack[];
  }>;
}

export const useLibraryStore = create<LibraryState>()(
  persist(
    (set, get) => ({
      favorites: [],
      playlists: [],
      artists: [],
      myList: [],

      toggleFavorite: (track) =>
        set((state) => {
          const exists = state.favorites.some((f) => f.id === track.id);
          return {
            favorites: exists
              ? state.favorites.filter((f) => f.id !== track.id)
              : [track, ...state.favorites],
          };
        }),

      isFavorite: (id) => get().favorites.some((f) => f.id === id),

      toggleArtist: (artist) =>
        set((state) => {
          const exists = state.artists.some((a) => a.id === artist.id);
          return {
            artists: exists
              ? state.artists.filter((a) => a.id !== artist.id)
              : [artist, ...state.artists],
          };
        }),

      isFollowing: (id) => get().artists.some((a) => a.id === id),

      createPlaylist: (name, description = '') => {
        const playlist: LocalPlaylist = {
          id: `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          name: name.trim() || 'Nueva playlist',
          description,
          createdAt: Date.now(),
          tracks: [],
        };
        set((state) => ({ playlists: [playlist, ...state.playlists] }));
        return playlist;
      },

      deletePlaylist: (id) =>
        set((state) => ({ playlists: state.playlists.filter((p) => p.id !== id) })),

      updatePlaylist: (id, patch) =>
        set((state) => ({
          playlists: state.playlists.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      addToPlaylist: (playlistId, track) => {
        const media = trackToMedia(track);
        return get().addMediaToPlaylist(playlistId, media);
      },

      addMediaToPlaylist: (playlistId, media) => {
        const playlist = get().playlists.find((p) => p.id === playlistId);
        if (!playlist || playlist.tracks.some((t) => t.id === media.id)) return false;
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId ? { ...p, tracks: [...p.tracks, media] } : p,
          ),
        }));
        return true;
      },

      removeFromPlaylist: (playlistId, mediaId) =>
        set((state) => ({
          playlists: state.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, tracks: p.tracks.filter((t) => t.id !== mediaId) }
              : p,
          ),
        })),

      toggleMyList: (item) =>
        set((state) => {
          const exists = (state.myList || []).some((m) => m.id === item.id);
          return {
            myList: exists
              ? (state.myList || []).filter((m) => m.id !== item.id)
              : [item, ...(state.myList || [])],
          };
        }),

      isInMyList: (id) => (get().myList || []).some((m) => m.id === id),

      removeFromMyList: (id) =>
        set((state) => ({
          myList: (state.myList || []).filter((m) => m.id !== id),
        })),
    }),
    {
      name: 'resona-library',
      version: 1,
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as LibraryState & PersistedV0;
        if (version < 1) {
          const playlists = (state.playlists ?? []).map((p) => ({
            ...p,
            tracks: ((p.tracks ?? []) as unknown as AudiusTrack[]).map((t) => trackToMedia(t)),
          }));
          return { ...state, playlists } as LibraryState;
        }
        return state;
      },
    },
  ),
);
