import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AudiusTrack, Media, MediaVod } from '../types';
import { audius } from '../services/audius';
import { getWatchUrl } from '../services/embed';
import { trackToMedia } from '../utils/media';

interface PlayerState {
  currentMedia: Media | null;
  currentTrack: AudiusTrack | null;
  queue: Media[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  volume: number;
  muted: boolean;
  showQueue: boolean;
  videoUrl: string | null;
  playFrom: (tracks: AudiusTrack[], index?: number) => void;
  playTrack: (track: AudiusTrack) => void;
  playMedia: (media: Media) => void;
  playMediaList: (media: Media[], index?: number) => void;
  playVideo: (vod: MediaVod) => void;
  setVideoUrl: (url: string | null) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleQueue: () => void;
  removeFromQueue: (index: number) => void;
  addNext: (track: AudiusTrack) => void;
  addToQueueEnd: (track: AudiusTrack) => void;
  addMediaToQueue: (media: Media) => void;
  stop: () => void;
}

let audioEl: HTMLAudioElement | null = null;
let attached = false;

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = 'metadata';
  }
  return audioEl;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => {
      const attachListeners = () => {
        if (attached) return;
        attached = true;
        const el = getAudio();

        const { volume, muted } = get();
        el.volume = volume;
        el.muted = muted;

        el.addEventListener('loadedmetadata', () =>
          set({ duration: Number.isFinite(el.duration) ? el.duration : 0, isLoading: false }),
        );
        el.addEventListener('durationchange', () =>
          set({ duration: Number.isFinite(el.duration) ? el.duration : 0 }),
        );
        el.addEventListener('timeupdate', () => set({ progress: el.currentTime }));
        el.addEventListener('play', () => set({ isPlaying: true, isLoading: false }));
        el.addEventListener('playing', () => set({ isLoading: false }));
        el.addEventListener('pause', () => set({ isPlaying: false }));
        el.addEventListener('waiting', () => set({ isLoading: true }));
        el.addEventListener('canplay', () => set({ isLoading: false }));
        el.addEventListener('error', () => set({ isPlaying: false, isLoading: false }));
        el.addEventListener('ended', () => {
          const { queue, queueIndex } = get();
          if (queueIndex < queue.length - 1) {
            get().playMediaList(queue, queueIndex + 1);
          } else {
            set({ isPlaying: false, progress: 0, duration: 0 });
          }
        });
      };

      const startAt = (mediaList: Media[], index: number) => {
        const media = mediaList[index];
        if (!media) return;

        if (media.kind === 'music') {
          const track = media.track;
          attachListeners();
          const el = getAudio();
          set({
            currentMedia: media,
            currentTrack: track,
            queue: mediaList,
            queueIndex: index,
            progress: 0,
            duration: track.duration || 0,
            isLoading: true,
            isPlaying: false,
            videoUrl: null,
          });
          audius
            .getStreamUrl(track.id)
            .then((url) => {
              el.src = url;
              return el.play();
            })
            .catch(() => set({ isPlaying: false, isLoading: false }));
        } else {
          if (audioEl) audioEl.pause();
          set({
            currentMedia: media,
            currentTrack: null,
            queue: mediaList,
            queueIndex: index,
            isPlaying: false,
            isLoading: false,
            progress: 0,
            duration: 0,
            videoUrl: media.kind !== 'forum' ? getWatchUrl(media) : null,
          });
        }
      };

      return {
        currentMedia: null,
        currentTrack: null,
        queue: [],
        queueIndex: -1,
        isPlaying: false,
        isLoading: false,
        progress: 0,
        duration: 0,
        volume: 0.8,
        muted: false,
        showQueue: false,
        videoUrl: null,

        playFrom: (tracks, index = 0) => {
          get().playMediaList(tracks.map(trackToMedia), index);
        },

        playTrack: (track) => get().playFrom([track], 0),

        playMedia: (media) => get().playMediaList([media], 0),

        playMediaList: (media, index = 0) => startAt(media, index),

        playVideo: (vod) => {
          const { queue } = get();
          const nextQueue = queue.some((m) => m.id === vod.id)
            ? queue
            : [vod, ...queue];
          const nextIndex = nextQueue.findIndex((m) => m.id === vod.id);
          startAt(nextQueue, nextIndex);
        },

        setVideoUrl: (url) => set({ videoUrl: url }),

        togglePlay: () => {
          const { isPlaying, currentTrack } = get();
          if (!currentTrack) return;
          const el = getAudio();
          if (isPlaying) {
            el.pause();
          } else {
            el.play().catch(() => set({ isPlaying: false }));
          }
        },

        next: () => {
          const { queue, queueIndex } = get();
          if (queueIndex < queue.length - 1) {
            get().playMediaList(queue, queueIndex + 1);
          }
        },

        prev: () => {
          const { queue, queueIndex, progress, currentTrack } = get();
          const el = getAudio();
          if (currentTrack && progress > 3) {
            el.currentTime = 0;
            set({ progress: 0 });
            return;
          }
          if (queueIndex > 0) {
            get().playMediaList(queue, queueIndex - 1);
          }
        },

        seek: (time) => {
          const el = getAudio();
          if (Number.isFinite(time)) {
            el.currentTime = time;
            set({ progress: time });
          }
        },

        setVolume: (volume) => {
          const v = Math.max(0, Math.min(1, volume));
          const el = getAudio();
          el.volume = v;
          el.muted = v === 0;
          set({ volume: v, muted: v === 0 });
        },

        toggleMute: () => {
          const { muted } = get();
          const el = getAudio();
          el.muted = !muted;
          set({ muted: !muted });
        },

        toggleQueue: () => set((state) => ({ showQueue: !state.showQueue })),

        removeFromQueue: (index) =>
          set((state) => {
            const queue = state.queue.filter((_, i) => i !== index);
            const queueIndex =
              index < state.queueIndex ? state.queueIndex - 1 : state.queueIndex;
            return { queue, queueIndex };
          }),

        addNext: (track) => {
          const media = trackToMedia(track);
          const { currentMedia, queue, queueIndex } = get();
          if (!currentMedia) {
            get().playMedia(media);
            return;
          }
          const nextQueue = [...queue];
          nextQueue.splice(queueIndex + 1, 0, media);
          set({ queue: nextQueue });
        },

        addToQueueEnd: (track) => {
          const media = trackToMedia(track);
          const { currentMedia, queue } = get();
          if (!currentMedia) {
            get().playMedia(media);
            return;
          }
          set({ queue: [...queue, media] });
        },

        addMediaToQueue: (media) => {
          const { currentMedia, queue } = get();
          if (!currentMedia) {
            get().playMedia(media);
            return;
          }
          if (queue.some((m) => m.id === media.id)) return;
          set({ queue: [...queue, media] });
        },

        stop: () => {
          const el = getAudio();
          el.pause();
          set({
            currentMedia: null,
            currentTrack: null,
            videoUrl: null,
            isPlaying: false,
            progress: 0,
            duration: 0,
          });
        },
      };
    },
    {
      name: 'resona-player',
      partialize: (state) => ({ volume: state.volume, muted: state.muted }),
    },
  ),
);
