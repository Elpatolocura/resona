import type { AudiusImage } from '../types';

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatCount(value: number | undefined | null): string {
  const n = Number(value ?? 0);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

export function imageUrl(
  img: AudiusImage | null | undefined,
  size: keyof AudiusImage = '480x480',
): string | null {
  return img?.[size] ?? img?.['150x150'] ?? null;
}

export function isPlayable(track: { streamable?: boolean; playable?: boolean; is_playable?: boolean }): boolean {
  if (track.streamable === false) return false;
  if (track.is_playable === false) return false;
  if (track.playable === false) return false;
  return true;
}

export function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const k = key(item);
    if (!seen.has(k)) {
      seen.add(k);
      result.push(item);
    }
  }
  return result;
}
