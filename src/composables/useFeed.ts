import { ref, computed, watch } from 'vue'
import type { FeedEntry, Filters, SortOption } from '../types'
import { fetchFeed } from '../api/feed'

const PAGE_SIZE = 30

function toApiSort(sort: SortOption) {
  if (sort === 'reactions') return { sortBy: 'reactions' as const, sortOrder: 'desc' as const }
  return { sortBy: 'date_posted' as const, sortOrder: sort === 'date-asc' ? 'asc' as const : 'desc' as const }
}

export function useFeed() {
  const filters = ref<Filters>({ siteName: '', artist: '', genre: '', postedBy: '' });
  const sortBy = ref<SortOption>('date-desc');
  const currentPage = ref(1);
  const entries = ref<FeedEntry[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));
  const genres = computed(() => [...new Set(entries.value.flatMap(e => e.genres))].sort());
  const artists = computed(() => [...new Set(entries.value.flatMap(e => e.artists))].sort());
  const users = computed(() => [...new Set(entries.value.map(e => e.postedBy))].sort());

  async function load() {
    loading.value = true
    error.value = null
    try {
      const page = await fetchFeed({
        filters: filters.value,
        ...toApiSort(sortBy.value),
        page: currentPage.value,
      });

      let data = page.data;

      entries.value = data.entries;
      total.value = data.total;
    } catch (e) {
      console.log("Error", e);
      error.value = e instanceof Error ? e.message : 'Failed to load feed'
    } finally {
      loading.value = false
    }
  }

  watch([filters, sortBy], () => { currentPage.value = 1 }, { deep: true });
  watch([filters, sortBy, currentPage], load, { deep: true, immediate: true });

  function clearFilters() {
    filters.value = { siteName: '', artist: '', genre: '', postedBy: '' }
    sortBy.value = 'date-desc'
  }

  return { filters, sortBy, currentPage, entries, loading, error, total, totalPages, genres, artists, users, clearFilters }
}
