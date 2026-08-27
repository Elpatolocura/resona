import type { MediaVod } from '../types';
import { tmdbPoster, tmdbBackdrop } from '../utils/media';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
const BASE = 'https://api.themoviedb.org/3';
const LANG = 'es-ES';

export class TmdbError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'TmdbError';
    this.status = status;
  }
}

function isJwtToken(value: string): boolean {
  return value.split('.').length === 3;
}

export function tmdbConfigured(): boolean {
  return typeof API_KEY === 'string' && API_KEY.length > 0;
}

interface Params {
  [key: string]: string | number | boolean | undefined;
}

async function request<T>(path: string, params: Params = {}): Promise<T> {
  if (!tmdbConfigured()) {
    throw new TmdbError(
      'Falta VITE_TMDB_API_KEY. Crea una API key gratuita en themoviedb.org y añádela a tu archivo .env.',
      401,
    );
  }
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('language', LANG);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined) url.searchParams.set(k, String(v));
  });

  const key = API_KEY as string;
  const headers: Record<string, string> = {};
  if (isJwtToken(key)) {
    headers.Authorization = `Bearer ${key}`;
  } else {
    url.searchParams.set('api_key', key);
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) {
    throw new TmdbError(`TMDB respondió con error ${res.status}`, res.status);
  }
  return (await res.json()) as T;
}

export type TmdbKind = 'movie' | 'tv';
export type TmdbCategory = 'trending' | 'popular' | 'top_rated';

export interface GenreOption {
  id: number;
  name: string;
}

interface TmdbItem {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  original_language?: string;
}

interface TmdbListResponse {
  results?: TmdbItem[];
}

interface Genre {
  id: number;
  name: string;
}

const genreCache: Partial<Record<TmdbKind, Map<number, string>>> = {};

async function getGenres(kind: TmdbKind): Promise<Map<number, string>> {
  if (genreCache[kind]) return genreCache[kind] as Map<number, string>;
  const data = await request<{ genres?: Genre[] }>(`/genre/${kind}/list`);
  const map = new Map<number, string>((data.genres ?? []).map((g) => [g.id, g.name]));
  genreCache[kind] = map;
  return map;
}

function normalizeItem(item: TmdbItem, kind: TmdbKind, genres?: Map<number, string>, forceKind?: 'movie' | 'tv' | 'anime'): MediaVod {
  const isMovie = kind === 'movie' || item.media_type === 'movie';
  const k: MediaVod['kind'] = forceKind ?? (isMovie ? 'movie' : 'tv');
  const date = isMovie ? item.release_date : item.first_air_date;
  const title = isMovie ? item.title : item.name;
  const genreIds = item.genre_ids ?? [];
  return {
    kind: k,
    id: `${k}:${item.id}`,
    tmdbId: item.id,
    title: title ?? 'Sin título',
    poster: tmdbPoster(item.poster_path),
    backdrop: tmdbBackdrop(item.backdrop_path),
    year: date ? Number(date.slice(0, 4)) : undefined,
    rating: typeof item.vote_average === 'number' ? item.vote_average : undefined,
    overview: item.overview || undefined,
    genres: genres ? genreIds.map((g) => genres.get(g)).filter(Boolean) as string[] : undefined,
    genreIds,
    originalLanguage: item.original_language,
  };
}

const ALLOWED_LANGUAGES = new Set(['es']);

function normalizeList(
  data: TmdbListResponse | null,
  kind: TmdbKind | 'multi',
  genres?: Map<number, string>,
): MediaVod[] {
  return (data?.results ?? [])
    .filter((item) => {
      if (kind === 'multi') {
        if (item.media_type !== 'movie' && item.media_type !== 'tv') return false;
      }
      if (item.original_language && !ALLOWED_LANGUAGES.has(item.original_language)) return false;
      return true;
    })
    .map((item) => normalizeItem(item, kind === 'multi' ? 'movie' : kind, genres));
}

export const tmdb = {
  configured: tmdbConfigured,

  async searchMulti(query: string): Promise<MediaVod[]> {
    const data = await request<TmdbListResponse>('/search/multi', {
      query,
      include_adult: false,
    });
    const genres = await getGenres('movie');
    return normalizeList(data, 'multi', genres);
  },

  async search(kind: TmdbKind, query: string): Promise<MediaVod[]> {
    const data = await request<TmdbListResponse>(`/search/${kind}`, {
      query,
      include_adult: false,
    });
    const genres = await getGenres(kind);
    return normalizeList(data, kind, genres);
  },

  async list(kind: TmdbKind, category: TmdbCategory): Promise<MediaVod[]> {
    let path: string;
    if (category === 'trending') path = `/trending/${kind}/week`;
    else if (category === 'popular') path = `/${kind}/popular`;
    else path = `/${kind}/top_rated`;

    const genres = await getGenres(kind);
    const seen = new Set<number>();
    const results: MediaVod[] = [];

    const pages = await Promise.all([
      request<TmdbListResponse>(path, { with_original_language: 'es', page: 1 }),
      request<TmdbListResponse>(path, { with_original_language: 'es', page: 2 }),
      request<TmdbListResponse>(path, { with_original_language: 'es', page: 3 }),
      request<TmdbListResponse>(path, { with_original_language: 'es', page: 4 }),
      request<TmdbListResponse>(path, { with_original_language: 'es', page: 5 }),
    ]);

    for (const data of pages) {
      for (const item of data.results ?? []) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        const normalized = normalizeItem(item, kind, genres);
        if (normalized.originalLanguage && !ALLOWED_LANGUAGES.has(normalized.originalLanguage)) continue;
        results.push(normalized);
      }
    }

    return results;
  },

  async genres(kind: TmdbKind): Promise<GenreOption[]> {
    const map = await getGenres(kind);
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  },

  async animeList(category: TmdbCategory): Promise<MediaVod[]> {
    const sortBy =
      category === 'top_rated' ? 'vote_average.desc' : 'popularity.desc';
    const baseParams: Params = {
      sort_by: sortBy,
      with_genres: 16,
      with_original_language: 'ja',
      ...(category === 'top_rated' ? { 'vote_count.gte': 50 } : {}),
    };

    const genres = await getGenres('tv');
    const seen = new Set<number>();
    const results: MediaVod[] = [];

    const pages = await Promise.all([
      request<TmdbListResponse>('/discover/tv', { ...baseParams, page: 1 }),
      request<TmdbListResponse>('/discover/tv', { ...baseParams, page: 2 }),
      request<TmdbListResponse>('/discover/tv', { ...baseParams, page: 3 }),
      request<TmdbListResponse>('/discover/tv', { ...baseParams, page: 4 }),
      request<TmdbListResponse>('/discover/tv', { ...baseParams, page: 5 }),
    ]);

    for (const data of pages) {
      for (const item of data.results ?? []) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        const normalized = normalizeItem(item, 'tv', genres, 'anime');
        results.push(normalized);
      }
    }

    return results;
  },

  async animeGenres(): Promise<GenreOption[]> {
    const map = await getGenres('tv');
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  },

  async discover(
    kind: TmdbKind,
    opts: { genreId?: number; adult?: boolean; category?: TmdbCategory } = {},
  ): Promise<MediaVod[]> {
    const sortBy =
      opts.category === 'top_rated' ? 'vote_average.desc' : 'popularity.desc';
    const baseParams: Params = {
      sort_by: sortBy,
      include_adult: opts.adult ? 'true' : 'false',
      with_original_language: 'es',
      ...(opts.category === 'top_rated' ? { 'vote_count.gte': 100 } : {}),
    };

    if (opts.adult) {
      baseParams.certification_country = 'US';
      if (kind === 'movie') {
        const [r, nc17] = await Promise.all([
          request<TmdbListResponse>('/discover/movie', { ...baseParams, certification: 'R' }),
          request<TmdbListResponse>('/discover/movie', { ...baseParams, certification: 'NC-17' }),
        ]);
        const genres = await getGenres(kind);
        const seen = new Set<number>();
        const raw = [
          ...(nc17.results ?? []).map((item) => ({ item, cert: 'NC-17' })),
          ...(r.results ?? []).map((item) => ({ item, cert: 'R' })),
        ].filter(({ item }) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        return raw.map(({ item, cert }) => ({
          ...normalizeItem(item, kind, genres),
          certification: cert,
        }));
      }
      baseParams.certification = 'TV-MA';
    }

    if (opts.genreId) baseParams.with_genres = opts.genreId;

    const data = await request<TmdbListResponse>(`/discover/${kind}`, baseParams);
    const genres = await getGenres(kind);
    const items = normalizeList(data, kind, genres);
    if (opts.adult) {
      return items.map((m) => ({ ...m, certification: 'TV-MA' }));
    }
    return items;
  },

  async details(kind: TmdbKind, id: number): Promise<MediaVod> {
    const [data, credits] = await Promise.all([
      request<Record<string, unknown> & { id: number }>(`/${kind}/${id}`),
      request<{ cast?: Array<{ name?: string }>; crew?: Array<{ name?: string; job?: string }> }>(`/${kind}/${id}/credits`),
    ]);
    const isMovie = kind === 'movie';
    const title = (isMovie ? data.title : data.name) as string | undefined;
    const date = (isMovie ? data.release_date : data.first_air_date) as string | undefined;
    const cast = (credits.cast ?? []).slice(0, 10).map((c) => c.name).filter(Boolean) as string[];
    const director = (credits.crew ?? []).find((c) => c.job === 'Director')?.name;
    const genreIds = (data.genres as Array<{ id: number }> | undefined)?.map((g) => g.id) ?? [];
    const originalLanguage = data.original_language as string | undefined;
    return {
      kind,
      id: `${kind}:${id}`,
      tmdbId: id,
      title: title ?? 'Sin título',
      poster: tmdbPoster(data.poster_path as string | null),
      backdrop: tmdbBackdrop(data.backdrop_path as string | null),
      year: date ? Number(date.slice(0, 4)) : undefined,
      rating: typeof data.vote_average === 'number' ? data.vote_average : undefined,
      overview: (data.overview as string | undefined) || undefined,
      runtime: typeof data.runtime === 'number' ? data.runtime : undefined,
      genres: (data.genres as Array<{ name?: string }> | undefined)?.map((g) => g.name).filter(Boolean) as string[] | undefined,
      genreIds,
      cast,
      director,
      seasons: !isMovie ? (data.number_of_seasons as number | undefined) : undefined,
      status: (data.status as string | undefined),
      originalLanguage,
    };
  },

  async similar(kind: TmdbKind, id: number): Promise<MediaVod[]> {
    const data = await request<TmdbListResponse>(`/${kind}/${id}/similar`);
    const genres = await getGenres(kind);
    return normalizeList(data, kind, genres);
  },
};
