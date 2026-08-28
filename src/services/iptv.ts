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

export interface EpgEntry {
  channel: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  icon?: string;
}

export interface EpgChannel {
  id: string;
  name: string;
  icon?: string;
  programs: EpgProgram[];
}

export interface EpgProgram {
  title: string;
  description?: string;
  start: Date;
  end: Date;
  icon?: string;
}

export interface IptvChannelWithEpg extends IptvChannel {
  currentProgram?: EpgProgram;
  nextProgram?: EpgProgram;
}

const CHANNELS_URL = 'https://iptv-org.github.io/api/channels.json';
const EPG_URL = 'https://iptv-org.github.io/api/guide.json';

let cachedChannels: IptvChannel[] | null = null;
let cachedEpg: Map<string, EpgProgram[]> | null = null;

export async function fetchIptvChannels(): Promise<IptvChannel[]> {
  if (cachedChannels) return cachedChannels;

  const res = await fetch(CHANNELS_URL);
  if (!res.ok) throw new Error('Error al cargar canales IPTV');

  const data = (await res.json()) as IptvChannel[];
  cachedChannels = data.filter((ch) => ch.url && ch.url.length > 0 && ch.country_code === 'CO');
  return cachedChannels;
}

export async function fetchEpg(): Promise<Map<string, EpgProgram[]>> {
  if (cachedEpg) return cachedEpg;

  try {
    const res = await fetch(EPG_URL);
    if (!res.ok) throw new Error('Error al cargar EPG');

    const data = (await res.json()) as EpgEntry[];
    const now = new Date();

    const channelMap = new Map<string, EpgProgram[]>();

    for (const entry of data) {
      if (!entry.channel) continue;

      const program: EpgProgram = {
        title: entry.title,
        description: entry.description,
        start: new Date(entry.start),
        end: new Date(entry.end),
        icon: entry.icon,
      };

      if (!channelMap.has(entry.channel)) {
        channelMap.set(entry.channel, []);
      }
      channelMap.get(entry.channel)!.push(program);
    }

    for (const [, programs] of channelMap) {
      programs.sort((a, b) => a.start.getTime() - b.start.getTime());
    }

    cachedEpg = channelMap;
    return cachedEpg;
  } catch {
    cachedEpg = new Map();
    return cachedEpg;
  }
}

export async function fetchChannelsWithEpg(): Promise<IptvChannelWithEpg[]> {
  const [channels, epg] = await Promise.all([fetchIptvChannels(), fetchEpg()]);
  const now = new Date();

  return channels.map((ch) => {
    const channelEpg = epg.get(ch.tvg_id ?? ch.id) ?? [];
    const currentProgram = channelEpg.find(
      (p) => p.start <= now && p.end > now,
    );
    const nextProgram = channelEpg.find(
      (p) => p.start > now,
    );

    return {
      ...ch,
      currentProgram,
      nextProgram,
    };
  });
}

export function getCurrentProgram(channelId: string, tvgId?: string): EpgProgram | undefined {
  if (!cachedEpg) return undefined;
  const now = new Date();
  const programs = cachedEpg.get(tvgId ?? channelId) ?? [];
  return programs.find((p) => p.start <= now && p.end > now);
}

export function getNextProgram(channelId: string, tvgId?: string): EpgProgram | undefined {
  if (!cachedEpg) return undefined;
  const now = new Date();
  const programs = cachedEpg.get(tvgId ?? channelId) ?? [];
  return programs.find((p) => p.start > now);
}

export function getProgramProgress(program: EpgProgram): number {
  const now = new Date();
  const total = program.end.getTime() - program.start.getTime();
  const elapsed = now.getTime() - program.start.getTime();
  return Math.max(0, Math.min(100, (elapsed / total) * 100));
}

export function formatEpgTime(date: Date): string {
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
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
  channels: IptvChannelWithEpg[],
  search: string,
  category: IptvCategory,
  country: string,
): IptvChannelWithEpg[] {
  let filtered = channels;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (ch) =>
        ch.name.toLowerCase().includes(q) ||
        ch.alt_names?.some((n) => n.toLowerCase().includes(q)) ||
        ch.country.toLowerCase().includes(q) ||
        ch.currentProgram?.title.toLowerCase().includes(q),
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

export function getUniqueCountries(channels: IptvChannelWithEpg[]): string[] {
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
