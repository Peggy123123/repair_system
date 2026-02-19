<template>
  <div v-if="totalPages > 0" class="flex items-center justify-center gap-2 mt-6">
    <!-- Previous Button -->
    <button
      @click="goToPage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="min-w-[30px] h-[30px] rounded-full text-sm border transition-colors flex items-center justify-center"
      :class="currentPage === 1
        ? 'bg-gray-100 border-gray-300'
        : 'bg-white border-gray-300 hover:bg-gray-50'"
      title="上一頁"
    >
      <font-awesome-icon icon="chevron-left" class="h-3 w-3" :class="currentPage === 1 ? 'text-gray-300' : 'text-textColor'" />
    </button>

    <!-- Page Numbers -->
    <div class="flex items-center gap-1">
      <button
        v-for="page in visiblePages"
        :key="page"
        @click="page !== '...' && goToPage(page as number)"
        :disabled="page === '...'"
        class="min-w-[30px] h-[30px] rounded-full border transition-colors flex items-center justify-center"
        :class="getPageButtonClass(page)"
      >
        <span :class="page === currentPage ? 'text-white' : 'text-textColor'" class="text-sm">{{ page }}</span>
      </button>
    </div>

    <!-- Next Button -->
    <button
      @click="goToPage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="min-w-[30px] h-[30px] rounded-full border transition-colors flex items-center justify-center"
      :class="currentPage === totalPages
        ? 'bg-gray-100 border-gray-300'
        : 'bg-white border-gray-300 hover:bg-gray-50'"
      title="下一頁"
    >
      <font-awesome-icon icon="chevron-right" class="h-3 w-3" :class="currentPage === totalPages ? 'text-gray-300' : 'text-textColor'" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
  maxVisiblePages?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxVisiblePages: 7
})

const emit = defineEmits<{
  'page-change': [page: number]
}>()

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const { currentPage, totalPages, maxVisiblePages } = props

  // If total pages is less than or equal to max visible, show all
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  // Always show first page
  pages.push(1)

  // Calculate the range of pages to show around current page
  const sidePages = Math.floor((maxVisiblePages - 3) / 2) // -3 for first, last, and current
  let startPage = Math.max(2, currentPage - sidePages)
  let endPage = Math.min(totalPages - 1, currentPage + sidePages)

  // Adjust if we're near the start
  if (currentPage <= sidePages + 2) {
    startPage = 2
    endPage = Math.min(totalPages - 1, maxVisiblePages - 1)
  }

  // Adjust if we're near the end
  if (currentPage >= totalPages - sidePages - 1) {
    startPage = Math.max(2, totalPages - maxVisiblePages + 2)
    endPage = totalPages - 1
  }

  // Add ellipsis after first page if needed
  if (startPage > 2) {
    pages.push('...')
  }

  // Add middle pages
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  // Add ellipsis before last page if needed
  if (endPage < totalPages - 1) {
    pages.push('...')
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return pages
})

const getPageButtonClass = (page: number | string) => {
  if (page === '...') {
    return 'bg-white text-gray-400 border-gray-300 cursor-default'
  }
  if (page === props.currentPage) {
    return 'bg-primary text-white border-primary font-medium'
  }
  return 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>
