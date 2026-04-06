<script setup lang="ts">
import GlobalNavbar from '@/components/GlobalNavbar.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <GlobalNavbar />
    <main class="flex justify-center w-full pt-16 h-screen">
      <div class="w-7xl h-auto">
        <slot />
      </div>
    </main>
  </div>
</template>
