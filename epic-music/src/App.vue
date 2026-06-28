<script setup lang="ts">
import { ref } from 'vue'
import { useFeed } from './composables/useFeed'
import { usePlaylist } from './composables/usePlaylist'
import { syncAndWait } from './api/api'
import FilterBar from './components/FilterBar.vue'
import FeedEntryComponent from './components/FeedEntry.vue'
import PlayerBar from './components/PlayerBar.vue'
import Pagination from './components/Pagination.vue'
import { FeedEntry } from './types'

const {
  filters,
  sortBy,
  currentPage,
  entries,
  loading,
  error,
  total,
  totalPages,
  genres,
  artists,
  users,
  currentUser,
  listEntries,
  clearFilters,
  reload,
} = useFeed();

const { queue, addAllToQueue, play } = usePlaylist();

const syncing = ref(false);
const syncError = ref<string | null>(null);
const syncDone = ref(false);

async function handleSync() {
  syncing.value = true;
  syncError.value = null;
  syncDone.value = false;

  try {
    await syncAndWait();
    await reload();
    syncDone.value = true;
    setTimeout(() => { syncDone.value = false }, 1500);
  } catch (e) {
    syncError.value = e instanceof Error ? e.message : 'Sync failed';
  } finally {
    syncing.value = false;
  }
}

async function playAll(entries: FeedEntry[]) {
  play(entries);
  if (totalPages.value > 1) {
    // Fetch remaining entries
    let data = await listEntries(filters.value, sortBy.value);
    let filtered = data.entries.filter((v1) => !entries.find((v2 => v1.id == v2.id)))
    addAllToQueue(filtered);
  }
}
</script>

<template>
  <div class="app" :class="{ 'player-active': queue.length > 0 }">
    <header class="site-header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-icon">♬</span>
          <span class="logo-text">#epic-music feed</span>
        </div>

        <p class="header-sub">Bangers fra Arbejdspladsen</p>

        <div v-if="!loading && !error" class="header-actions">
          <p class="header-user">Velkommen {{ currentUser }}!</p>
  
          <p v-if="syncError" class="sync-error">{{ syncError }}</p>
          <button class="sync-btn" :disabled="syncing" @click="handleSync">
            <span v-if="syncing" class="spinner" aria-hidden="true" />
            <span v-else-if="syncDone">✓ Synced</span>
            <span v-else>Sync</span>
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div v-if="loading" class="state-message">
        <span class="spinner" aria-hidden="true" />
        Loading tracks…
      </div>

      <div v-else-if="error" class="state-message error">
        {{ error }}
      </div>

      <template v-else>
        <FilterBar
          v-model="filters"
          v-model:sortBy="sortBy"
          :genres="genres"
          :artists="artists"
          :users="users"
          :resultCount="total"
          @clear="clearFilters"
        />

        <div v-if="entries.length === 0" class="state-message">
          No tracks match the current filters.
        </div>

        <div v-else>
          <div class="feed-actions">
            <button class="play-all-btn" @click="playAll(entries)">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play all
            </button>
          </div>
          <div class="feed-grid">
          <FeedEntryComponent
            v-for="entry in entries"
            :key="entry.id"
            :entry="entry"
          />
          </div>
        </div>

        <Pagination
          v-model:currentPage="currentPage"
          :totalPages="totalPages"
        />
      </template>
    </main>
    <PlayerBar />
  </div>
</template>

<style scoped>
.app {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.site-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1.25rem 0;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.logo-icon {
  font-size: 1.6rem;
  line-height: 1;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.header-sub {
  position: relative;
  top: 1px;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

.header-user {
  margin-right: 50px;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sync-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0.4rem 0.9rem;
  transition: border-color 0.15s, color 0.15s;
}

.sync-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--text);
}

.sync-btn:disabled {
  cursor: default;
  opacity: 0.6;
}

.sync-error {
  font-size: 0.8rem;
  color: #f87171;
  margin: 0;
}

.main-content {
  flex: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
  width: 100%;
}

.state-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.state-message.error {
  color: #f87171;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  display: inline-block;
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.player-active .main-content {
  padding-bottom: calc(1.5rem + 4.5rem);
}

.feed-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.75rem;
}

.play-all-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0.4rem 0.85rem;
  transition: border-color 0.15s, color 0.15s;
}

.play-all-btn:hover {
  border-color: var(--accent);
  color: var(--text);
}

@media (max-width: 480px) {
  .feed-grid {
    grid-template-columns: 1fr;
  }
}
</style>
