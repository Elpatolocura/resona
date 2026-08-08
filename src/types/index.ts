export interface AudiusImage {
  '150x150': string;
  '480x480': string;
  '1000x1000': string;
}

export interface AudiusUser {
  id: string;
  name: string;
  handle: string;
  is_verified: boolean;
  bio?: string;
  location?: string;
  profile_picture: AudiusImage | null;
  cover_photo: AudiusImage | null;
  follower_count?: number;
  following_count?: number;
  track_count?: number;
  album_count?: number;
  playlist_count?: number;
}

export interface AudiusTrack {
  id: string;
  title: string;
  duration: number;
  genre?: string;
  mood?: string;
  description?: string;
  release_date?: string;
  streamable: boolean;
  playable: boolean;
  is_playable?: boolean;
  artwork: AudiusImage | null;
  user: AudiusUser;
  permalink?: string;
}

export interface AudiusPlaylist {
  id: string;
  playlist_name: string;
  description?: string;
  is_album: boolean;
  artwork: AudiusImage | null;
  user: AudiusUser;
  track_count?: number;
  follows?: number | null;
}

export type MediaKind = 'music' | 'movie' | 'tv';

export interface MusicMedia {
  kind: 'music';
  id: string;
  title: string;
  subtitle: string;
  poster: string | null;
  duration: number;
  track: AudiusTrack;
}

export interface MediaVod {
  kind: 'movie' | 'tv';
  id: string;
  tmdbId: number;
  title: string;
  poster: string | null;
  backdrop: string | null;
  year?: number;
  rating?: number;
  overview?: string;
  genres?: string[];
  genreIds?: number[];
  runtime?: number;
  cast?: string[];
  director?: string;
  seasons?: number;
  status?: string;
  season?: number;
  episode?: number;
  certification?: string;
}

export type Media = MusicMedia | MediaVod;

export interface WatchHistoryEntry {
  media: MediaVod;
  watchedAt: number;
}

export interface LocalPlaylist {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  tracks: Media[];
}
