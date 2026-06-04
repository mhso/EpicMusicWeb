<script setup lang="ts">
import type { FeedEntry } from '../types'

const props = defineProps<{ entry: FeedEntry }>()

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function totalReactions(entry: FeedEntry): number {
  return entry.reactions.reduce((sum, r) => sum + r.count, 0)
}

const genreColorMap: Record<string, string> = {
  'Classic Rock':     '#f97316',
  'Grunge':           '#78716c',
  'Indie Rock':       '#22c55e',
  'Alternative Rock': '#84cc16',
  'Blues Rock':       '#3b82f6',
  'Heavy Metal':      '#6b7280',
  'Synth-Pop':        '#a855f7',
  'Pop':              '#ec4899',
  'Pop/Soul':         '#db2777',
  'Pop/Country':      '#d97706',
  'Funk/Pop':         '#f59e0b',
  'Funk/Soul':        '#eab308',
  'Reggaeton':        '#10b981',
  'Neo Soul':         '#8b5cf6',
  'Hip-Hop':          '#f59e0b',
  'Country Rap':      '#c084fc',
  'Electronic':       '#06b6d4',
  'Indie Pop':        '#34d399',
  'Psychedelic Pop':  '#818cf8',
  'R&B/Soul':         '#c084fc',
  'R&B/Rock':         '#e879f9',
  'Jazz':             '#fbbf24',
}

function genreColor(genre: string): string {
  return genreColorMap[genre] ?? '#94a3b8'
}
</script>

<template>
  <article class="entry-card">
    <div class="embed-wrapper">
      <iframe
        v-if="entry.youtubeId"
        :src="`https://www.youtube-nocookie.com/embed/${entry.youtubeId}`"
        title="YouTube video player"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      />
      <div v-else class="embed-placeholder">
        <span class="placeholder-icon">♪</span>
        <span>No YouTube link</span>
        <a :href="entry.sourceUrl" target="_blank" rel="noopener noreferrer" class="source-link">
          Open on {{ entry.sourceType }}
        </a>
      </div>
    </div>

    <div class="entry-meta">
      <div class="meta-top">
        <h2 class="song-title">{{ entry.title }}</h2>
        <span
          class="genre-badge"
          :style="{ '--genre-color': genreColor(entry.genre) }"
        >{{ entry.genre }}</span>
      </div>

      <p class="artist-album">
        <span class="artist">{{ entry.artist }}</span>
        <span class="separator">·</span>
        <span class="album">{{ entry.album }}</span>
      </p>

      <div class="entry-footer">
        <div class="poster-info">
          <span class="avatar">{{ entry.postedBy[0].toUpperCase() }}</span>
          <span class="username">{{ entry.postedBy }}</span>
          <span class="date">{{ formatDate(entry.datePosted) }}</span>
        </div>

        <div class="reactions" :title="`${totalReactions(entry)} total reactions`">
          <span
            v-for="reaction in entry.reactions"
            :key="reaction.emoji"
            class="reaction"
          >
            {{ reaction.emoji }}&thinsp;{{ reaction.count }}
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

.genre-badge {
  flex-shrink: 0;
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
  background: var(--accent);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
</style>
