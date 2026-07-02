import { ref, computed } from 'vue'
import type { FeedEntry } from '../types'

declare global {
  interface Window {
    YT: {
      Player: new (el: HTMLElement, opts: object) => YTPlayerInstance
      PlayerState: { ENDED: number; PLAYING: number; PAUSED: number }
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

interface YTPlayerInstance {
  loadVideoById(id: string): void
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  destroy(): void
  setVolume(volume: number): void
}

// Module-level singleton — shared across all component instances
const queue = ref<FeedEntry[]>([]);
const currentIndex = ref(-1);
const isPlaying = ref(false);
const volume = ref(30);

let ytPlayer: YTPlayerInstance | null = null;
let playerReady = false;
let apiLoaded = false;
let hasPlayed = false;

function ensureApiLoaded(): Promise<void> {
  if (apiLoaded) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      apiLoaded = true;
      resolve();
    }

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  })
}

function loadTrack(index: number) {
  currentIndex.value = index;
  const entry = queue.value[index];
  if (!entry) return;

  // Skip entries without a YouTube ID
  if (!entry.youtubeId) {
    if (index < queue.value.length - 1) loadTrack(index + 1)
    else isPlaying.value = false
    return
  }

  if (ytPlayer && playerReady) {
    ytPlayer.loadVideoById(entry.youtubeId);
  }
  // If not ready yet, onReady will pick up currentTrack
}

export function usePlaylist() {
  const currentTrack = computed(() =>
    currentIndex.value >= 0 ? (queue.value[currentIndex.value] ?? null) : null
  )
  const hasNext = computed(() => currentIndex.value < queue.value.length - 1)
  const hasPrev = computed(() => currentIndex.value > 0)

  function play(entries: FeedEntry[], startIndex = 0) {
    queue.value = entries;
    loadTrack(startIndex);
  }
  
  function addToQueue(entry: FeedEntry) {
    if (queue.value.length === 0) {
      play([entry]);
    } else {
      queue.value.push(entry);
      if (hasPlayed && !isPlaying.value) {
        // Start playing if we stopped previously and queue a new song
        loadTrack(currentIndex.value + 1);
      }
    }
  }

  function addAllToQueue(entries: FeedEntry[]) {
    for (let entry of entries) {
      addToQueue(entry);
    }
  }

  function next() {
    if (hasNext.value) loadTrack(currentIndex.value + 1)
    else isPlaying.value = false;
  }

  function prev() {
    if (hasPrev.value) loadTrack(currentIndex.value - 1);
  }

  function togglePause() {
    if (!ytPlayer || !playerReady) return;
    if (isPlaying.value) ytPlayer.pauseVideo();
    else ytPlayer.playVideo();
  }

  function setVolume(v: number) {
    volume.value = v;
    ytPlayer?.setVolume(v);
  }

  function shuffle() {
    if (!hasNext) {
      return;
    }

    let prevTracks = Array.from(queue.value.slice(0, currentIndex.value + 1));
    let nextTracks = Array.from(queue.value.slice(currentIndex.value + 1));

    for (let i = 0; i < nextTracks.length; i++) {
      let newIndex = Math.floor(Math.random() * nextTracks.length);
      let oldValue = nextTracks[newIndex];
      nextTracks[newIndex] = nextTracks[i];
      nextTracks[i] = oldValue;
    }

    queue.value = prevTracks.concat(nextTracks);
  }

  function clear() {
    ytPlayer?.stopVideo()
    queue.value = []
    currentIndex.value = -1
    isPlaying.value = false
  }

  function initPlayer(el: HTMLElement) {
    ensureApiLoaded().then(() => {
      ytPlayer = new window.YT.Player(el, {
        width: '0',
        height: '0',
        playerVars: { autoplay: 1, controls: 0, rel: 0 },
        events: {
          onReady: () => {
            playerReady = true;
            ytPlayer!.setVolume(volume.value);
            if (currentTrack.value?.youtubeId) {
              ytPlayer!.loadVideoById(currentTrack.value.youtubeId);
            }
          },
          onStateChange: (e: { data: number }) => {
            isPlaying.value = e.data === 1 // PLAYING
            if (isPlaying && !hasPlayed) {
              hasPlayed = true;
            }
            if (e.data === 0) next()       // ENDED → advance
          },
        },
      })
    })
  }

  return {
    queue,
    currentIndex,
    currentTrack,
    isPlaying,
    volume,
    hasNext,
    hasPrev,
    play,
    addToQueue,
    addAllToQueue,
    next,
    prev,
    togglePause,
    setVolume,
    shuffle,
    clear,
    initPlayer,
  }
}
