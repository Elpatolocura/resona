import type { MediaVod } from '../types';

export interface EmbedProvider {
  id: string;
  name: string;
  url: string;
}

interface ProviderTemplate {
  id: string;
  name: string;
  movie: (id: number) => string;
  tv: (id: number, season: number, episode: number) => string;
}

const TEMPLATES: ProviderTemplate[] = [
  {
    id: 'multiembed',
    name: 'MultiEmbed',
    movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
    tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`,
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    movie: (id) => `https://vidsrc.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc2',
    name: 'VidSrc 2',
    movie: (id) => `https://vidsrc2.to/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidsrc2.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: '2embed',
    name: '2Embed',
    movie: (id) => `https://www.2embed.to/embed/tmdb/movie?id=${id}`,
    tv: (id, s, e) => `https://www.2embed.to/embed/tmdb/tv?id=${id}&s=${s}&e=${e}`,
  },
  {
    id: 'embedflix',
    name: 'EmbedFlix',
    movie: (id) => `https://embedflix.net/movie/${id}`,
    tv: (id, s, e) => `https://embedflix.net/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidbinge',
    name: 'VidBinge',
    movie: (id) => `https://vidbinge.dev/embed/movie/${id}`,
    tv: (id, s, e) => `https://vidbinge.dev/embed/tv/${id}/${s}/${e}`,
  },
];

function buildProviders(vod: MediaVod): EmbedProvider[] {
  const season = vod.kind === 'tv' ? (vod.season ?? 1) : 1;
  const episode = vod.kind === 'tv' ? (vod.episode ?? 1) : 1;
  return TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    url: vod.kind === 'movie' ? t.movie(vod.tmdbId) : t.tv(vod.tmdbId, season, episode),
  }));
}

export function getWatchProviders(vod: MediaVod): EmbedProvider[] {
  return buildProviders(vod);
}

export function getWatchUrl(vod: MediaVod): string {
  return buildProviders(vod)[0].url;
}

export async function checkWorkingProviders(vod: MediaVod, timeoutMs = 6000): Promise<EmbedProvider[]> {
  const providers = buildProviders(vod);
  const results = await Promise.all(
    providers.map(async (p) => {
      try {
        await fetch(p.url, {
          mode: 'no-cors',
          signal: AbortSignal.timeout(timeoutMs),
        });
        return p;
      } catch {
        return null;
      }
    }),
  );
  const working = results.filter(Boolean) as EmbedProvider[];
  return working.length > 0 ? working : providers;
}

export async function getFirstWorkingWatchUrl(vod: MediaVod): Promise<string> {
  const providers = await checkWorkingProviders(vod);
  return providers[0].url;
}
