<script setup lang="ts">
const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  'update:currentPage': [page: number]
}>()

function pages(): (number | '…')[] {
  const { currentPage: cur, totalPages: total } = props
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const result: (number | '…')[] = [1]

  if (cur > 3) result.push('…')

  const rangeStart = Math.max(2, cur - 1)
  const rangeEnd = Math.min(total - 1, cur + 1)
  for (let i = rangeStart; i <= rangeEnd; i++) result.push(i)

  if (cur < total - 2) result.push('…')

  result.push(total)
  return result
}

function go(page: number | '…') {
  if (typeof page === 'number') emit('update:currentPage', page)
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function navigate(page: number | '…') {
  go(page)
  scrollTop()
}
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="Page navigation">
    <button
      class="page-btn arrow"
      :disabled="currentPage === 1"
      @click="navigate(currentPage - 1)"
      aria-label="Previous page"
    >‹</button>

    <template v-for="p in pages()" :key="p === '…' ? `ellipsis-${p}` : p">
      <span v-if="p === '…'" class="ellipsis">…</span>
      <button
        v-else
        class="page-btn"
        :class="{ active: p === currentPage }"
        @click="navigate(p)"
        :aria-current="p === currentPage ? 'page' : undefined"
      >{{ p }}</button>
    </template>

    <button
      class="page-btn arrow"
      :disabled="currentPage === totalPages"
      @click="navigate(currentPage + 1)"
      aria-label="Next page"
    >›</button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 2rem 0 1rem;
}

.page-btn {
  min-width: 2.2rem;
  height: 2.2rem;
  padding: 0 0.4rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.page-btn:hover:not(:disabled):not(.active) {
  border-color: var(--accent);
  color: var(--text);
}

.page-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  cursor: default;
}

.page-btn.arrow {
  font-size: 1.1rem;
  line-height: 1;
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.ellipsis {
  color: var(--text-muted);
  padding: 0 0.25rem;
  font-size: 0.875rem;
}
</style>
