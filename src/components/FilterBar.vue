<script setup lang="ts">
import type { Filters, SortOption } from '../types'

const props = defineProps<{
  genres: string[]
  artists: string[]
  users: string[]
  modelValue: Filters
  sortBy: SortOption
  resultCount: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Filters]
  'update:sortBy': [value: SortOption]
  clear: []
}>()

function updateFilter<K extends keyof Filters>(key: K, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const hasActiveFilters = () =>
  props.modelValue.genre !== '' ||
  props.modelValue.artist !== '' ||
  props.modelValue.postedBy !== ''
</script>

<template>
  <div class="filter-bar">
    <div class="filter-controls">
      <div class="filter-group">
        <label for="filter-genre">Genre</label>
        <select
          id="filter-genre"
          :value="modelValue.genre"
          @change="updateFilter('genre', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">All genres</option>
          <option v-for="g in genres" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-artist">Artist</label>
        <select
          id="filter-artist"
          :value="modelValue.artist"
          @change="updateFilter('artist', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">All artists</option>
          <option v-for="a in artists" :key="a" :value="a">{{ a }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filter-user">Posted by</label>
        <select
          id="filter-user"
          :value="modelValue.postedBy"
          @change="updateFilter('postedBy', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">Anyone</option>
          <option v-for="u in users" :key="u" :value="u">{{ u }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="sort-by">Sort by</label>
        <select
          id="sort-by"
          :value="sortBy"
          @change="emit('update:sortBy', ($event.target as HTMLSelectElement).value as SortOption)"
        >
          <option value="date-desc">Newest first</option>
          <option value="date-asc">Oldest first</option>
          <option value="reactions">Most reactions</option>
        </select>
      </div>

      <button
        v-if="hasActiveFilters()"
        class="clear-btn"
        @click="emit('clear')"
      >
        Clear filters
      </button>
    </div>

    <p class="result-count">{{ resultCount }} track{{ resultCount !== 1 ? 's' : '' }}</p>
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

select {
  appearance: none;
  background: var(--surface-raised) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M6 8L1 3h10z'/%3E%3C/svg%3E") no-repeat right 0.6rem center;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
  padding: 0.45rem 2rem 0.45rem 0.75rem;
  min-width: 140px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

select:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.clear-btn {
  align-self: flex-end;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8rem;
  padding: 0.45rem 0.9rem;
  transition: border-color 0.15s, color 0.15s;
}

.clear-btn:hover {
  border-color: var(--accent);
  color: var(--text);
}

.result-count {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
