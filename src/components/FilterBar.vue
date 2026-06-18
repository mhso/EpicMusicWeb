<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Filters, SortOption } from '../types'

const SITE_OPTIONS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'spotify', label: 'Spotify' },
  { value: 'tidal', label: 'Tidal' },
]

const SITE_LABEL: Record<string, string> = { youtube: 'YouTube', spotify: 'Spotify', tidal: 'Tidal' }

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

const openDropdown = ref<string | null>(null)

function handleGlobalClick() {
  openDropdown.value = null
}

onMounted(() => document.addEventListener('click', handleGlobalClick))
onUnmounted(() => document.removeEventListener('click', handleGlobalClick))

function toggleDropdown(key: string) {
  openDropdown.value = openDropdown.value === key ? null : key
}

function toggleMultiFilter(key: keyof Filters, value: string) {
  const current = (props.modelValue[key] as string[] | undefined) ?? []
  const next = current.includes(value)
    ? current.filter(v => v !== value)
    : [...current, value]
  emit('update:modelValue', { ...props.modelValue, [key]: next.length ? next : undefined })
}

function multiSelectLabel(key: keyof Filters, allLabel: string, displayMap?: Record<string, string>) {
  const selected = props.modelValue[key] as string[] | undefined
  if (!selected?.length) return allLabel
  if (selected.length === 1) return displayMap?.[selected[0]] ?? selected[0]
  return `${selected.length} selected`
}

const hasActiveFilters = () =>
  props.modelValue.siteNames?.length ||
  props.modelValue.genres?.length ||
  props.modelValue.artists?.length ||
  props.modelValue.posters?.length
</script>

<template>
  <div class="filter-bar">
    <div class="filter-controls">
      <div class="filter-group">
        <label>Source</label>
        <div class="multi-select" :class="{ active: modelValue.siteNames?.length }">
          <button
            class="multi-select-trigger"
            :class="{ open: openDropdown === 'siteNames' }"
            @click.stop="toggleDropdown('siteNames')"
          >
            {{ multiSelectLabel('siteNames', 'All sources', SITE_LABEL) }}
            <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
              <path fill="currentColor" d="M6 8L1 3h10z"/>
            </svg>
          </button>
          <div v-if="openDropdown === 'siteNames'" class="multi-select-dropdown" @click.stop>
            <label v-for="s in SITE_OPTIONS" :key="s.value" class="checkbox-item">
              <input
                type="checkbox"
                :checked="modelValue.siteNames?.includes(s.value)"
                @change="toggleMultiFilter('siteNames', s.value)"
              />
              <span>{{ s.label }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <label>Genre</label>
        <div class="multi-select" :class="{ active: modelValue.genres?.length }">
          <button
            class="multi-select-trigger"
            :class="{ open: openDropdown === 'genres' }"
            @click.stop="toggleDropdown('genres')"
          >
            {{ multiSelectLabel('genres', 'All genres') }}
            <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
              <path fill="currentColor" d="M6 8L1 3h10z"/>
            </svg>
          </button>
          <div v-if="openDropdown === 'genres'" class="multi-select-dropdown" @click.stop>
            <label v-for="g in genres" :key="g" class="checkbox-item">
              <input
                type="checkbox"
                :checked="modelValue.genres?.includes(g)"
                @change="toggleMultiFilter('genres', g)"
              />
              <span>{{ g }}</span>
            </label>
            <p v-if="!genres.length" class="dropdown-empty">No genres available</p>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <label>Artist</label>
        <div class="multi-select" :class="{ active: modelValue.artists?.length }">
          <button
            class="multi-select-trigger"
            :class="{ open: openDropdown === 'artists' }"
            @click.stop="toggleDropdown('artists')"
          >
            {{ multiSelectLabel('artists', 'All artists') }}
            <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
              <path fill="currentColor" d="M6 8L1 3h10z"/>
            </svg>
          </button>
          <div v-if="openDropdown === 'artists'" class="multi-select-dropdown" @click.stop>
            <label v-for="a in artists" :key="a" class="checkbox-item">
              <input
                type="checkbox"
                :checked="modelValue.artists?.includes(a)"
                @change="toggleMultiFilter('artists', a)"
              />
              <span>{{ a }}</span>
            </label>
            <p v-if="!artists.length" class="dropdown-empty">No artists available</p>
          </div>
        </div>
      </div>

      <div class="filter-group">
        <label>Posted by</label>
        <div class="multi-select" :class="{ active: modelValue.posters?.length }">
          <button
            class="multi-select-trigger"
            :class="{ open: openDropdown === 'posters' }"
            @click.stop="toggleDropdown('posters')"
          >
            {{ multiSelectLabel('posters', 'Anyone') }}
            <svg class="chevron" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
              <path fill="currentColor" d="M6 8L1 3h10z"/>
            </svg>
          </button>
          <div v-if="openDropdown === 'posters'" class="multi-select-dropdown" @click.stop>
            <label v-for="u in users" :key="u" class="checkbox-item">
              <input
                type="checkbox"
                :checked="modelValue.posters?.includes(u)"
                @change="toggleMultiFilter('posters', u)"
              />
              <span>{{ u }}</span>
            </label>
            <p v-if="!users.length" class="dropdown-empty">No users available</p>
          </div>
        </div>
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

/* Multi-select dropdown */
.multi-select {
  position: relative;
}

.multi-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  appearance: none;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
  padding: 0.45rem 0.75rem;
  min-width: 140px;
  text-align: left;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.multi-select-trigger:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

.multi-select-trigger.open,
.multi-select.active .multi-select-trigger {
  border-color: var(--accent);
}

.multi-select.active .multi-select-trigger {
  color: var(--accent);
}

.chevron {
  flex-shrink: 0;
  opacity: 0.5;
  transition: transform 0.15s;
}

.multi-select-trigger.open .chevron {
  transform: rotate(180deg);
}

.multi-select-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 100;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  min-width: 160px;
  max-height: 240px;
  overflow-y: auto;
  padding: 0.35rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: normal;
  text-transform: none;
  letter-spacing: 0;
  color: var(--text);
  transition: background 0.1s;
  user-select: none;
  white-space: nowrap;
}

.checkbox-item:hover {
  background: var(--surface);
}

.checkbox-item input[type="checkbox"] {
  accent-color: var(--accent);
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  cursor: pointer;
}

.dropdown-empty {
  font-size: 0.8rem;
  color: var(--text-muted);
  padding: 0.5rem;
  margin: 0;
  text-align: center;
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
