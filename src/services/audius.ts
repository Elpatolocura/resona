import type { AudiusPlaylist, AudiusTrack, AudiusUser } from '../types';

const APP_NAME = import.meta.env.VITE_AUDIUS_APP_NAME || 'resona-music';
const HOST_CACHE_KEY = 'resona-audius-host';
const FALLBACK_HOST = 'https://api.audius.co';
const API_REGISTRY = 'https://api.audius.co';

let hostCache: string | null = (() => {
  try {
    return localStorage.getItem(HOST_CACHE_KEY);
  } catch {
    return null;
  }
})();

async function refreshHost(): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(API_REGISTRY, { signal: controller.signal });
    const json = await res.json();
    const data: unknown = json?.data;
    let candidates: string[] = [];
    if (Array.isArray(data)) {
      candidates = data
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object' && 'endpoint' in item) {
            const endpoint = (item as { endpoint?: unknown }).endpoint;
            return typeof endpoint === 'string' ? endpoint : null;
          }
          return null;
        })
        .filter((v): v is string => Boolean(v));
    }
    const chosen =
      candidates.find((c) => /^https:\/\//i.test(c) && c !== API_REGISTRY) ??
      candidates[0] ??
      FALLBACK_HOST;
    hostCache = chosen.replace(/\/+$/, '');
    try {
      localStorage.setItem(HOST_CACHE_KEY, hostCache);
    } catch {
      /* almacenamiento no disponible */
    }
    return hostCache;
  } catch {
    hostCache = FALLBACK_HOST;
    return hostCache;
  } finally {
    clearTimeout(timer);
  }
}

export async function getAudiusHost(): Promise<string> {
  if (hostCache) return hostCache;
  return refreshHost();
}

export async function resetAudiusHost(): Promise<string> {
  hostCache = null;
  try {
    localStorage.removeItem(HOST_CACHE_KEY);
  } catch {
    /* noop */
  }
  return refreshHost();
}

async function request<T>(
  path: string,
  params: Record<string, string | number | boolean | undefined> = {},
): Promise<T> {
  const host = await getAudiusHost();
  const qs = new URLSearchParams();
  qs.set('app_name', APP_NAME);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  }
  const url = `${host}/v1/${path}?${qs.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error de Audius (${res.status})`);
  }
  const body = await res.json();
  return body.data as T;
}

export const audius = {
  searchTracks: (query: string) => request<AudiusTrack[]>('tracks/search', { query }),
  searchUsers: (query: string) => request<AudiusUser[]>('users/search', { query }),
  searchPlaylists: (query: string) => request<AudiusPlaylist[]>('playlists/search', { query }),

  trendingTracks: (time: string = 'week') => request<AudiusTrack[]>('tracks/trending', { time }),
  trendingUnderground: () => request<AudiusTrack[]>('tracks/trending/underground'),

  trendingPlaylists: (type: 'playlist' | 'album' = 'playlist') =>
    request<AudiusPlaylist[]>('playlists/trending', { type }),

  getTrack: (id: string) => request<AudiusTrack>(`tracks/${id}`),
  getUser: (id: string) => request<AudiusUser>(`users/${id}`),
  getUserTracks: (id: string) => request<AudiusTrack[]>(`users/${id}/tracks`),
  getUserPlaylists: (id: string) => request<AudiusPlaylist[]>(`users/${id}/playlists`),
  getUserAlbums: (id: string) => request<AudiusPlaylist[]>(`users/${id}/albums`),

  getPlaylist: (id: string) => request<AudiusPlaylist>(`playlists/${id}`),
  getPlaylistTracks: (id: string) => request<AudiusTrack[]>(`playlists/${id}/tracks`),

  async getStreamUrl(id: string): Promise<string> {
    const host = await getAudiusHost();
    return `${host}/v1/tracks/${id}/stream?app_name=${encodeURIComponent(APP_NAME)}`;
  },
};

export { APP_NAME };
