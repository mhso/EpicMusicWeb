import { ref, computed, watch } from 'vue';
import type { FeedEntry, Filters, SortOption } from '../types';
import { fetchFeed } from '../api/api';
import { AxiosError } from "axios";

const PAGE_SIZE = 60;

function toApiSort(sort: SortOption) {
  if (sort === 'reactions') return { sortBy: 'reactions' as const, sortOrder: 'desc' as const }
  return { sortBy: 'date_posted' as const, sortOrder: sort === 'date-asc' ? 'asc' as const : 'desc' as const }
}

export function useFeed() {
  const filters = ref<Filters>({});
  const sortBy = ref<SortOption>('date-desc');
  const currentPage = ref(1);
  const entries = ref<FeedEntry[]>([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));
  const genres = ref<string[]>([]);
  const artists = ref<string[]>([]);
  const users = ref<string[]>([]);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const data = await fetchFeed({
        ...filters.value,
        ...toApiSort(sortBy.value),
        page: currentPage.value - 1,
      });

      entries.value = data.entries;
      genres.value = data.uniqueGenres;
      artists.value = data.uniqueArtists;
      users.value = data.uniquePosters;
      total.value = data.total;
    } catch (e) {
      console.log("Error", e);
      error.value = e instanceof Error ? e.message : "Failed to load feed";
      if (e instanceof AxiosError) {
        if (e.response) {
          error.value += ` - ${e.response.data.detail}`;
        }
      }
    } finally {
      loading.value = false
    }
  }

  watch([filters, sortBy], () => { currentPage.value = 1 }, { deep: true });
  watch([filters, sortBy, currentPage], load, { deep: true, immediate: true });

  function clearFilters() {
    filters.value = {};
    sortBy.value = "date-desc";
  }

  return {
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
    reload: load,
  };
}
