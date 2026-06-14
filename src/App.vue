<script setup lang="ts">
import { useFeed } from './composables/useFeed'
import FilterBar from './components/FilterBar.vue'
import FeedEntryComponent from './components/FeedEntry.vue'
import Pagination from './components/Pagination.vue'

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
  clearFilters,
} = useFeed()
</script>

<template>
  <div class="app">
    <header class="site-header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-icon">♬</span>
          <span class="logo-text">Epic Music Feed</span>
        </div>
        <p class="header-sub">Music shared by the Discord community</p>
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

        <div v-else class="feed-grid">
          <FeedEntryComponent
            v-for="entry in entries"
            :key="entry.id"
            :entry="entry"
          />
        </div>

        <Pagination
          v-model:currentPage="currentPage"
          :totalPages="totalPages"
        />
      </template>
    </main>
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
  font-size: 0.85rem;
  color: var(--text-muted);
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

@media (max-width: 480px) {
  .feed-grid {
    grid-template-columns: 1fr;
  }
}
</style>
