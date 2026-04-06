<script setup lang="ts">
defineProps<{
  currentPage: number
  totalElements: number
  pageSize: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
}>()
</script>

<template>
  <div v-if="totalElements > pageSize" class="flex justify-center mt-8">
    <UPagination
      :page="currentPage"
      :total="totalElements"
      :items-per-page="pageSize"
      :sibling-count="1"
      show-edges
      @update:page="emit('page-change', $event)"
    />
  </div>
</template>
