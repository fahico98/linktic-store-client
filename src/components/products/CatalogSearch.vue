<script setup lang="ts">
import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'

const emit = defineEmits<{
  (e: 'search', text: string): void
}>()

const query = ref('')

watchDebounced(
  query,
  (val) => {
    emit('search', val.trim())
  },
  { debounce: 400 },
)
</script>

<template>
  <UInput
    v-model="query"
    icon="i-lucide-search"
    placeholder="Buscar producto..."
    class="w-full max-w-sm"
    :trailing="true"
  />
</template>
