import type { AudiusTrack, Media, MediaForum, MediaVod, MusicMedia } from '../types';
import type { ForumPost } from './forumData';

const TMDB_IMG = 'https://image.tmdb.org/t/p';

export function trackToMedia(track: AudiusTrack): MusicMedia {
  return {
    kind: 'music',
    id: `track:${track.id}`,
    title: track.title,
    subtitle: track.user?.name ?? 'Artista',
    poster: track.artwork?.['480x480'] ?? track.artwork?.['150x150'] ?? null,
    duration: track.duration || 0,
    track,
  };
}

export function postToMedia(post: ForumPost): MediaForum {
  return {
    kind: 'forum',
    id: `forum:${post.id}`,
    title: post.title,
    subtitle: `Por ${post.author} · ${post.comments?.length || 0} comentarios`,
    poster: post.images?.[0] || null,
    post,
  };
}

export function mediaToTrack(media: Media | null | undefined): AudiusTrack | null {
  if (!media || media.kind !== 'music') return null;
  return media.track;
}

export function isVod(media: Media | null | undefined): media is MediaVod {
  return !!media && media.kind !== 'music';
}

export function isVodItem(item: { kind?: string }): boolean {
  return item?.kind === 'movie' || item?.kind === 'tv';
}

export function mediaPoster(media: Media | null | undefined): string | null {
  if (!media) return null;
  return media.kind === 'music' ? media.poster : media.poster;
}

export function mediaTitle(media: Media | null | undefined): string {
  if (!media) return '';
  return media.title;
}

export function mediaSubtitle(media: Media | null | undefined): string {
  if (!media) return '';
  if (media.kind === 'music') return media.subtitle;
  const parts: string[] = [];
  if (media.year) parts.push(String(media.year));
  parts.push(media.kind === 'movie' ? 'Película' : 'Serie');
  return parts.join(' · ');
}

export function tmdbPoster(path: string | null | undefined, size = 'w500'): string | null {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
}

export function tmdbBackdrop(path: string | null | undefined, size = 'w1280'): string | null {
  if (!path) return null;
  return `${TMDB_IMG}/${size}${path}`;
}

export function formatRating(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '';
  return value.toFixed(1);
}

export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return `${h} h ${m > 0 ? `${m} min` : ''}`.trim();
}

export function vodMediaTypeLabel(vod: MediaVod): string {
  return vod.kind === 'movie' ? 'Película' : 'Serie';
}
