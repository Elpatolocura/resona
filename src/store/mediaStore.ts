import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MediaVod, WatchHistoryEntry } from '../types';
import { tmdb, TmdbKind } from '../services/tmdb';
import { getWatchProviders, checkWorkingProviders, EmbedProvider } from '../services/embed';

interface MediaState {
  trendingMovies: MediaVod[];
  trendingTv: MediaVod[];
  searchResults: MediaVod[];
  currentMedia: MediaVod | null;
  similar: MediaVod[];
  loading: boolean;
  error: string | null;
  selectedSeason: number;
  selectedEpisode: number;
  vodFavorites: MediaVod[];
  watchHistory: WatchHistoryEntry[];
  providers: EmbedProvider[];
  watchUrl: string | null;
  forumFavorites: string[];
  fetchTrending: (kind: TmdbKind) => Promise<void>;
  search: (query: string) => Promise<void>;
  getDetails: (kind: TmdbKind, id: number) => Promise<MediaVod>;
  getSimilar: (kind: TmdbKind, id: number) => Promise<void>;
  setSelectedSeason: (season: number) => void;
  setSelectedEpisode: (episode: number) => void;
  removeFromHistory: (id: string) => void;
  loadProviders: (vod: MediaVod) => Promise<void>;
  selectProvider: (url: string) => void;
  toggleVodFavorite: (vod: MediaVod) => void;
  isVodFavorite: (id: string) => boolean;
  toggleForumFavorite: (postId: string) => void;
  isForumFavorite: (postId: string) => boolean;
  addToHistory: (vod: MediaVod) => void;
  clearHistory: () => void;
}

export const useMediaStore = create<MediaState>()(
  persist(
    (set, get) => ({
      trendingMovies: [],
      trendingTv: [],
      searchResults: [],
      currentMedia: null,
      similar: [],
      loading: false,
      error: null,
      selectedSeason: 1,
      selectedEpisode: 1,
      vodFavorites: [],
      watchHistory: [],
      providers: [],
      watchUrl: null,
      forumFavorites: [],

      fetchTrending: async (kind) => {
        set({ loading: true, error: null });
        try {
          const items = await tmdb.list(kind, 'trending');
          if (kind === 'movie') set({ trendingMovies: items });
          else set({ trendingTv: items });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Error al cargar tendencias' });
        } finally {
          set({ loading: false });
        }
      },

      search: async (query) => {
        if (!query.trim()) {
          set({ searchResults: [] });
          return;
        }
        set({ loading: true, error: null });
        try {
          const items = await tmdb.searchMulti(query.trim());
          set({ searchResults: items });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Error al buscar' });
        } finally {
          set({ loading: false });
        }
      },

      getDetails: async (kind, id) => {
        set({ loading: true, error: null });
        try {
          const media = await tmdb.details(kind, id);
          set({ currentMedia: media, watchUrl: getWatchProviders(media)[0]?.url ?? null });
          return media;
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Error al cargar detalles' });
          throw err;
        } finally {
          set({ loading: false });
        }
      },

      getSimilar: async (kind, id) => {
        try {
          const items = await tmdb.similar(kind, id);
          set({ similar: items });
        } catch {
          set({ similar: [] });
        }
      },

      setSelectedSeason: (season) => set({ selectedSeason: season, selectedEpisode: 1 }),
      setSelectedEpisode: (episode) => set({ selectedEpisode: episode }),

      loadProviders: async (vod) => {
        const providers = await checkWorkingProviders(vod);
        set({ providers, watchUrl: providers[0]?.url ?? null });
      },

      removeFromHistory: (id) =>
        set((state) => ({
          watchHistory: state.watchHistory.filter((h) => h.media.id !== id),
        })),

      selectProvider: (url) => set({ watchUrl: url }),

      toggleVodFavorite: (vod) =>
        set((state) => {
          const exists = state.vodFavorites.some((f) => f.id === vod.id);
          return {
            vodFavorites: exists
              ? state.vodFavorites.filter((f) => f.id !== vod.id)
              : [vod, ...state.vodFavorites],
          };
        }),

      isVodFavorite: (id) => get().vodFavorites.some((f) => f.id === id),

      toggleForumFavorite: (postId) =>
        set((state) => {
          const exists = state.forumFavorites.includes(postId);
          return {
            forumFavorites: exists
              ? state.forumFavorites.filter((id) => id !== postId)
              : [...state.forumFavorites, postId],
          };
        }),

      isForumFavorite: (postId) => get().forumFavorites.includes(postId),

      addToHistory: (vod) =>
        set((state) => {
          const rest = state.watchHistory.filter((h) => h.media.id !== vod.id);
          return {
            watchHistory: [{ media: vod, watchedAt: Date.now() }, ...rest].slice(0, 30),
          };
        }),

      clearHistory: () => set({ watchHistory: [] }),
    }),
    {
      name: 'resona-media',
      partialize: (state) => ({
        vodFavorites: state.vodFavorites,
        watchHistory: state.watchHistory,
        forumFavorites: state.forumFavorites,
      }),
    },
  ),
);
