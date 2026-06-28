<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePlaylist } from '../composables/usePlaylist'

const {
  queue,
  currentIndex,
  currentTrack,
  isPlaying,
  volume,
  hasNext,
  hasPrev,
  next,
  prev,
  togglePause,
  setVolume,
  clear,
  initPlayer,
} = usePlaylist()

function onVolumeInput(e: Event) {
  setVolume(Number((e.target as HTMLInputElement).value))
}

const playerHost = ref<HTMLElement | null>(null)

onMounted(() => {
  if (playerHost.value) initPlayer(playerHost.value)
})
</script>

<template>
  <div v-show="queue.length > 0" class="player-bar">
    <!-- Hidden YT IFrame API mount point -->
    <div ref="playerHost" class="yt-host" />

    <div class="track-info">
      <img
        v-if="currentTrack?.youtubeId"
        class="track-thumb"
        :src="`https://img.youtube.com/vi/${currentTrack.youtubeId}/default.jpg`"
        alt=""
      />
      <div class="track-text">
        <span class="track-title">{{ currentTrack?.title || currentTrack?.youtubeTitle }}</span>
        <span class="track-artist">{{ currentTrack?.artists.join(', ') }}</span>
      </div>
    </div>

    <div class="controls">
      <button class="ctrl-btn" :disabled="!hasPrev" aria-label="Previous" @click="prev">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
          <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
        </svg>
      </button>
      <button class="ctrl-btn play-btn" :aria-label="isPlaying ? 'Pause' : 'Play'" @click="togglePause">
        <svg v-if="isPlaying" viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
      <button class="ctrl-btn" :disabled="!hasNext" aria-label="Next" @click="next">
        <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
        </svg>
      </button>
    </div>

    <div class="volume-wrapper">
      <div class="volume-popup">
        <span class="volume-label">{{ Math.round(volume) }}%</span>
        <input
          type="range"
          class="volume-slider"
          min="0"
          max="100"
          :value="volume"
          aria-label="Volume"
          @input="onVolumeInput"
        />
      </div>
      <button class="ctrl-btn" :aria-label="`Volume: ${Math.round(volume)}%`">
        <svg v-if="volume === 0" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      </button>
    </div>

    <div class="queue-status">
      <span class="queue-pos">{{ currentIndex + 1 }} / {{ queue.length }}</span>
      <button class="close-btn" aria-label="Close player" @click="clear">
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4.5rem;
  background: var(--surface);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0 1.5rem;
  z-index: 200;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.4);
}

.yt-host {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
}

.track-thumb {
  width: 3.2rem;
  height: 2.4rem;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.track-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.track-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 0.75rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 6px;
  transition: color 0.15s, background 0.15s;
}

.ctrl-btn:hover:not(:disabled) {
  color: var(--text);
  background: var(--surface-raised);
}

.ctrl-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.play-btn {
  background: var(--accent);
  color: #fff;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
}

.play-btn:hover:not(:disabled) {
  background: var(--accent);
  color: #fff;
  filter: brightness(1.15);
}

.volume-wrapper {
  position: relative;
  flex-shrink: 0;
}

.volume-popup {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.65rem 0.75rem 0.5rem;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.35);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s, transform 0.15s;
  transform: translateX(-50%) translateY(4px);
}

.volume-wrapper:hover .volume-popup {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(-50%) translateY(0);
}

.volume-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  user-select: none;
}

.volume-slider {
  writing-mode: vertical-lr;
  direction: rtl;
  width: 4px;
  height: 80px;
  cursor: pointer;
  appearance: none;
  background: var(--border);
  border-radius: 2px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
  transition: transform 0.1s;
}

.volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.25);
}

.volume-slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
}

.queue-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.queue-pos {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 6px;
  transition: color 0.15s;
}

.close-btn:hover {
  color: var(--text);
}
</style>
