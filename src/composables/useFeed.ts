import { ref, computed, watch } from 'vue'
import type { Ref } from 'vue'
import type { FeedEntry, Filters, SortOption } from '../types'

const PAGE_SIZE = 30

function totalReactions(entry: FeedEntry): number {
  return entry.reactions.reduce((sum, r) => sum + r.count, 0)
}

export function useFeed(entries: Ref<FeedEntry[]>) {
  const filters = ref<Filters>({ genre: '', artist: '', postedBy: '' })
  const sortBy = ref<SortOption>('date-desc')
  const currentPage = ref(1)

  const genres = computed(() =>
    [...new Set(entries.value.map((e) => e.genre))].sort(),
  )
  const artists = computed(() =>
    [...new Set(entries.value.map((e) => e.artist))].sort(),
  )
  const users = computed(() =>
    [...new Set(entries.value.map((e) => e.postedBy))].sort(),
  )

  const filtered = computed(() => {
    let result = entries.value

    if (filters.value.genre)
      result = result.filter((e) => e.genre === filters.value.genre)
    if (filters.value.artist)
      result = result.filter((e) => e.artist === filters.value.artist)
    if (filters.value.postedBy)
      result = result.filter((e) => e.postedBy === filters.value.postedBy)

    const sorted = [...result]
    if (sortBy.value === 'date-desc')
      sorted.sort(
        (a, b) =>
          new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime(),
      )
    else if (sortBy.value === 'date-asc')
      sorted.sort(
        (a, b) =>
          new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime(),
      )
    else if (sortBy.value === 'reactions')
      sorted.sort((a, b) => totalReactions(b) - totalReactions(a))

    return sorted
  })

  const totalPages = computed(() =>
    Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)),
  )

  const paginated = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filtered.value.slice(start, start + PAGE_SIZE)
  })

  // Reset to page 1 whenever filters or sort order change
  watch([filters, sortBy], () => { currentPage.value = 1 }, { deep: true })

  function clearFilters() {
    filters.value = { genre: '', artist: '', postedBy: '' }
    sortBy.value = 'date-desc'
  }

  return {
    filters,
    sortBy,
    currentPage,
    genres,
    artists,
    users,
    filtered,
    paginated,
    totalPages,
    clearFilters,
  }
}
