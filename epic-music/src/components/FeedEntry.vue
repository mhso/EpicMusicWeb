<script setup lang="ts">
import { reactive } from 'vue';
import type { FeedEntry } from '../types';
import { usePlaylist } from '../composables/usePlaylist';

const activated = reactive(new Set<number>());
const { addToQueue } = usePlaylist();

const props = defineProps<{ entry: FeedEntry }>();

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-DK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function totalReactions(entry: FeedEntry): number {
  return entry.reactions.reduce((sum, r) => sum + r.count, 0);
}

const genreColorMap: Record<string, string> = {
  'Rock':             '#f97316',
  'Grunge':           '#78716c',
  'Indie Rock':       '#22c55e',
  'Alternative Rock': '#84cc16',
  'Classical':        '#db2777',
  'Blues':            '#3b82f6',
  'Heavy Metal':      '#6b7280',
  'Synth-Pop':        '#a855f7',
  'Pop':              '#ec4899',
  'Pop/Soul':         '#c084fc',
  'Pop/Country':      '#d97706',
  'Funk/Pop':         '#f59e0b',
  'Funk / Soul':      '#eab308',
  'Regga':            '#10b981',
  'Stage & Screen':   '#8b5cf6',
  'Hip Hop':          '#f59e0b',
  'Electronic':       '#06b6d4',
  'Indie Pop':        '#34d399',
  'Psychedelic Pop':  '#818cf8',
  'R&B/Soul':         '#c084fc',
  'R&B/Rock':         '#e879f9',
  'Jazz':             '#fbbf24',
}

function formatMessage(message: string | null): string {
  if (!message) {
    return "";
  }

  return `"${message}"`;
}

function genreColor(genre: string): string {
  return genreColorMap[genre] ?? '#94a3b8';
}
</script>

<template>
  <article class="entry-card">
    <div class="entry-message" :title="entry.message || undefined">
      {{ formatMessage(entry.message) }}
    </div>

    <div class="embed-wrapper">
      <button
        class="queue-btn"
        aria-label="Add to playlist"
        @click.stop="addToQueue(entry)"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
          <path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zm4 8v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM2 16h8v-2H2v2z"/>
        </svg>
        Queue
      </button>

      <template v-if="entry.youtubeId">
        <iframe
          v-if="activated.has(entry.id)"
          :src="`https://www.youtube-nocookie.com/embed/${entry.youtubeId}?autoplay=1`"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
        <button v-else class="thumbnail-facade" @click="activated.add(entry.id)">
          <img
            :src="`https://img.youtube.com/vi/${entry.youtubeId}/hqdefault.jpg`"
            :alt="entry.youtubeTitle || entry.title"
            loading="lazy"
          />
          <span class="play-btn" aria-label="Play video">
            <svg viewBox="0 0 68 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C0 13.05 0 24 0 24s0 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C68 34.95 68 24 68 24S68 13.05 66.52 7.74z" fill="#ff0000"/>
              <path d="M45 24 27 14v20" fill="#fff"/>
            </svg>
          </span>
        </button>
      </template>
      <div v-else class="embed-placeholder">
        <span class="placeholder-icon">♪</span>
        <span>No YouTube link</span>
        <a :href="entry.originalUrl" target="_blank" rel="noopener noreferrer" class="source-link">
          Open on {{ entry.siteName }}
        </a>
      </div>
    </div>

    <div class="entry-meta">
      <div class="meta-top">
        <h2 class="song-title">{{ entry.title || entry.youtubeTitle }}</h2>
        <div class="genres-wrapper">
          <span v-for="genre in entry.genres"
            class="genre-badge"
            :style="{ '--genre-color': genreColor(genre) }"
          >{{ genre }}</span>
        </div>
      </div>

      <p class="artist-album">
        <span class="artist"><span v-for="artist in entry.artists">{{ artist }}</span></span>
        <span class="separator">·</span>
        <span class="album">{{ entry.album }}</span>
      </p>

      <div class="entry-footer">
        <div class="poster-info">
          <div v-if="entry.avatar">
            <img class="avatar avatar-discord" :src=entry.avatar>
          </div>
          <span v-else class="avatar avatar-placeholder">{{ entry.postedBy[0].toUpperCase() }}</span>
          <span class="username">{{ entry.postedBy }}</span>
          <span class="date">{{ formatDate(entry.datePosted) }}</span>
        </div>

        <div class="reactions" :title="`${totalReactions(entry)} total reactions`">
          <span
            v-for="reaction in entry.reactions"
            :key="reaction.emoji"
            class="reaction"
          >
            <img v-if="reaction.emoji.startsWith('https://')" class="emoji-icon" :src="reaction.emoji"><span v-else>{{ reaction.emoji }}</span>&thinsp;{{ reaction.count }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.entry-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.entry-card:hover {
  border-color: var(--accent);
  box-shadow: 0 4px 24px var(--accent-glow);
}

/* 16:9 responsive embed */
.embed-wrapper {
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: var(--surface-raised);
}

.embed-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.queue-btn {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(0, 0, 0, 0.65);
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.3rem 0.55rem;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
  backdrop-filter: blur(4px);
}

.entry-card:hover .queue-btn {
  opacity: 1;
}

.queue-btn:hover {
  background: var(--accent);
}

.thumbnail-facade {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  border: none;
  background: #000;
  cursor: pointer;
  overflow: hidden;
}

.thumbnail-facade img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.2s;
}

.thumbnail-facade:hover img {
  opacity: 0.75;
}

.play-btn {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.play-btn svg {
  width: 64px;
  height: 45px;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.5));
  transition: transform 0.15s;
}

.thumbnail-facade:hover .play-btn svg {
  transform: scale(1.1);
}

.embed-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.placeholder-icon {
  font-size: 2rem;
}

.source-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
}

.source-link:hover {
  text-decoration: underline;
}

.entry-message {
  font-style: italic;
  padding: 0.4rem 1rem 0.8rem;
  font-size: 14px;
  height: 50px;
  line-height: 2.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-meta {
  padding: 0.9rem 1rem 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
}

.meta-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}

.song-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
  line-height: 1.3;
}

.genres-wrapper {
  display: flex;
  flex-direction: column;
  align-items: end;
  justify-content: right;
  flex-shrink: 0;
}

.genre-badge {
  margin: 3px 0;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.2rem 0.55rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--genre-color) 15%, transparent);
  color: var(--genre-color);
  border: 1px solid color-mix(in srgb, var(--genre-color) 30%, transparent);
}

.artist-album {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.artist {
  color: var(--text-secondary);
  font-weight: 500;
}

.separator {
  color: var(--border);
}

.album {
  font-style: italic;
}

.entry-footer {
  margin-top: auto;
  padding-top: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
  border-top: 1px solid var(--border);
}

.poster-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.avatar {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-discord {
  width: 100%;
  border-radius: 50%;
}

.avatar-placeholder {
  background: var(--accent);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  
}

.username {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.date {
  font-size: 0.72rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.reactions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.reaction {
  font-size: 0.75rem;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.1rem 0.45rem;
  white-space: nowrap;
  cursor: default;
}

.emoji-icon {
  width: 12px;
  vertical-align: center;
}
</style>
