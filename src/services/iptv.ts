export interface IptvChannel {
  id: string;
  name: string;
  alt_names?: string[];
  network?: string;
  owners?: string[];
  country: string;
  country_code: string;
  languages: string[];
  categories: string[];
  is_nsfw: boolean;
  logo?: string;
  url: string;
  tvg_id?: string;
  tvg_name?: string;
  tvg_logo?: string;
  tvg_chno?: string;
}

const API_URL = 'https://iptv-org.github.io/api/channels.json';

let cachedChannels: IptvChannel[] | null = null;

export async function fetchIptvChannels(): Promise<IptvChannel[]> {
  if (cachedChannels) return cachedChannels;

  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al cargar canales IPTV');

  const data = (await res.json()) as IptvChannel[];
  cachedChannels = data.filter((ch) => ch.url && ch.url.length > 0 && ch.country_code === 'CO');
  return cachedChannels;
}

export const IPTV_CATEGORIES = [
  'All',
  'Entertainment',
  'Movies',
  'News',
  'Sports',
  'Music',
  'Kids',
  'Documentary',
  'Religious',
  'Shopping',
  'Education',
  'Travel',
  'Local',
  'XXX',
] as const;

export type IptvCategory = (typeof IPTV_CATEGORIES)[number];

export function filterChannels(
  channels: IptvChannel[],
  search: string,
  category: IptvCategory,
  country: string,
): IptvChannel[] {
  let filtered = channels;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (ch) =>
        ch.name.toLowerCase().includes(q) ||
        ch.alt_names?.some((n) => n.toLowerCase().includes(q)) ||
        ch.country.toLowerCase().includes(q),
    );
  }

  if (category !== 'All') {
    filtered = filtered.filter((ch) =>
      ch.categories.some((c) => c.toLowerCase() === category.toLowerCase()),
    );
  }

  if (country !== 'All') {
    filtered = filtered.filter((ch) => ch.country_code === country);
  }

  return filtered;
}

export function getUniqueCountries(channels: IptvChannel[]): string[] {
  const map = new Map<string, string>();
  for (const ch of channels) {
    if (!map.has(ch.country_code)) {
      map.set(ch.country_code, ch.country);
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([code, name]) => `${name} (${code})`);
}
