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

export interface GuideSource {
  channel: string;
  url: string;
  name?: string;
  country?: string;
  languages?: string[];
  categories?: string[];
  is_nsfw?: boolean;
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
const GUIDES_URL = 'https://iptv-org.github.io/api/guides.json';

let cachedChannels: IptvChannel[] | null = null;
let cachedEpg: Map<string, EpgProgram[]> | null = null;
let epgLoading = false;

async function fetchWithRetry(url: string, retries = 3, backoffMs = 1000): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(60000),
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After');
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : backoffMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt < retries) {
        const waitMs = backoffMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url} after ${retries + 1} attempts`);
}

async function fetchJson<T>(url: string, retries?: number): Promise<T> {
  const res = await fetchWithRetry(url, retries);
  return res.json() as Promise<T>;
}

async function fetchXml(url: string): Promise<string> {
  const res = await fetchWithRetry(url, 2);
  const buffer = await res.arrayBuffer();

  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    try {
      const ds = new DecompressionStream('gzip');
      const writer = ds.writable.getWriter();
      writer.write(bytes);
      writer.close();
      const reader = ds.readable.getReader();
      const chunks: Uint8Array[] = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const totalLen = chunks.reduce((s, c) => s + c.length, 0);
      const merged = new Uint8Array(totalLen);
      let offset = 0;
      for (const c of chunks) {
        merged.set(c, offset);
        offset += c.length;
      }
      return new TextDecoder('utf-8').decode(merged);
    } catch {
      return new TextDecoder('utf-8').decode(bytes);
    }
  }

  return new TextDecoder('utf-8').decode(bytes);
}

function parseXmlPrograms(xml: string, channelId: string): EpgProgram[] {
  const programs: EpgProgram[] = [];
  const programmeRegex = /<programme[^>]*start="([^"]*)"[^>]*stop="([^"]*)"[^>]*channel="([^"]*)"[^>]*>([\s\S]*?)<\/programme>/gi;
  const titleRegex = /<title[^>]*>([^<]*)<\/title>/i;
  const descRegex = /<desc[^>]*>([^<]*)<\/desc>/i;
  const iconRegex = /<icon[^>]*src="([^"]*)"[^>]*\/>/i;

  let match;
  while ((match = programmeRegex.exec(xml)) !== null) {
    const [, startStr, stopStr, ch, content] = match;

    if (ch !== channelId) continue;

    const titleMatch = titleRegex.exec(content);
    const descMatch = descRegex.exec(content);
    const iconMatch = iconRegex.exec(content);

    const parseDate = (s: string) => {
      const cleaned = s.replace(' ', 'T');
      if (cleaned.includes('Z')) return new Date(cleaned);
      if (cleaned.includes('+')) return new Date(cleaned);
      return new Date(cleaned + 'Z');
    };

    programs.push({
      title: titleMatch?.[1]?.trim() ?? 'Sin título',
      description: descMatch?.[1]?.trim(),
      start: parseDate(startStr),
      end: parseDate(stopStr),
      icon: iconMatch?.[1],
    });
  }

  return programs.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export async function fetchIptvChannels(): Promise<IptvChannel[]> {
  if (cachedChannels) return cachedChannels;

  const data = await fetchJson<IptvChannel[]>(CHANNELS_URL);
  cachedChannels = data.filter((ch) => ch.url && ch.url.length > 0 && ch.country_code === 'CO');
  return cachedChannels;
}

async function fetchAndParseEpg(): Promise<Map<string, EpgProgram[]>> {
  const guides = await fetchJson<GuideSource[]>(GUIDES_URL);

  const colombianGuides = guides.filter(
    (g) => g.country === 'CO' || g.country === 'colombia',
  );

  if (colombianGuides.length === 0) {
    const channelMap = new Map<string, EpgProgram[]>();
    for (const guide of guides.slice(0, 50)) {
      try {
        if (!guide.url || !guide.channel) continue;
        const xmlUrl = guide.url.endsWith('.xml.gz')
          ? guide.url
          : guide.url.endsWith('.xml')
            ? guide.url
            : guide.url + '.xml.gz';

        const xml = await fetchXml(xmlUrl);
        const programs = parseXmlPrograms(xml, guide.channel);
        if (programs.length > 0) {
          channelMap.set(guide.channel, programs);
        }
      } catch {
        // skip failed guides
      }
    }
    return channelMap;
  }

  const channelMap = new Map<string, EpgProgram[]>();

  const fetchGuide = async (guide: GuideSource) => {
    try {
      if (!guide.url || !guide.channel) return;
      const xmlUrl = guide.url.endsWith('.xml.gz')
        ? guide.url
        : guide.url.endsWith('.xml')
          ? guide.url
          : guide.url + '.xml.gz';

      const xml = await fetchXml(xmlUrl);
      const programs = parseXmlPrograms(xml, guide.channel);
      if (programs.length > 0) {
        channelMap.set(guide.channel, programs);
      }
    } catch {
      // skip failed guides
    }
  };

  const batchSize = 10;
  for (let i = 0; i < colombianGuides.length; i += batchSize) {
    const batch = colombianGuides.slice(i, i + batchSize);
    await Promise.all(batch.map(fetchGuide));
  }

  return channelMap;
}

export async function fetchEpg(): Promise<Map<string, EpgProgram[]>> {
  if (cachedEpg) return cachedEpg;
  if (epgLoading) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (cachedEpg) {
          clearInterval(check);
          resolve(cachedEpg);
        }
      }, 200);
    });
  }

  epgLoading = true;
  try {
    cachedEpg = await fetchAndParseEpg();
    return cachedEpg;
  } catch {
    cachedEpg = new Map();
    return cachedEpg;
  } finally {
    epgLoading = false;
  }
}

function normalizeId(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchEpgKey(ch: IptvChannel, epgKeys: string[]): string | undefined {
  const candidates = [ch.tvg_id, ch.id, ch.tvg_name, ch.name, ...(ch.alt_names ?? [])]
    .filter(Boolean) as string[];

  for (const c of candidates) {
    const norm = normalizeId(c);
    for (const key of epgKeys) {
      if (normalizeId(key) === norm) return key;
    }
  }

  for (const c of candidates) {
    const lower = c.toLowerCase();
    for (const key of epgKeys) {
      if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
        return key;
      }
    }
  }

  return undefined;
}

export async function fetchChannelsWithEpg(): Promise<IptvChannelWithEpg[]> {
  const channels = await fetchIptvChannels();
  let epg = new Map<string, EpgProgram[]>();
  try {
    epg = await fetchEpg();
  } catch {
    // EPG failed, show channels without programs
  }
  const now = new Date();
  const epgKeys = Array.from(epg.keys());

  return channels.map((ch) => {
    const matchedKey = matchEpgKey(ch, epgKeys);
    const channelEpg = matchedKey ? (epg.get(matchedKey) ?? []) : [];
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
