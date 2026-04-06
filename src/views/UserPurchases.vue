<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import ViewWrapper from '@/components/ViewWrapper.vue'
import GlobalPaginator from '@/components/GlobalPaginator.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { Purchase } from '@/types/purchase'
import { useToast } from '@nuxt/ui/composables'

function parseImages(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [raw]
  } catch {
    return raw ? [raw] : []
  }
}

function formatDate(utcString: string) {
  return new Date(utcString).toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(value: number) {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  })
}

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const purchases = ref<Purchase[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalElements = ref(0)
const pageSize = ref(10)

async function loadPurchases(page = 1) {
  loading.value = true

  try {
    const response = await axios.get<{ content: Purchase[]; total_elements: number; size: number }>(
      `${import.meta.env.VITE_API_URL}/api/purchases`,
      {
        params: { user_id: authStore.user?.id, page: page - 1 },
        headers: { Authorization: `Bearer ${authStore.token}` },
      },
    )
    purchases.value = response.data.content
    totalElements.value = response.data.total_elements
    pageSize.value = response.data.size
    currentPage.value = page
  } catch {
    toast.add({
      title: 'Error al cargar tus compras',
      description: 'No se pudieron cargar tus compras. Intentalo nuevamente.',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => loadPurchases())
</script>

<template>
  <ViewWrapper>
    <div class="py-10">
      <h1 class="text-2xl mb-6">Mis compras</h1>

      <div v-if="loading" class="flex justify-center py-16">
        <UIcon name="i-lucide-loader-circle" class="animate-spin text-4xl text-primary" />
      </div>

      <div
        v-else-if="purchases.length === 0"
        class="flex flex-col items-center justify-center text-center text-gray-500 py-32 gap-4"
      >
        <UIcon name="i-lucide-receipt" class="text-8xl" />
        <p class="text-2xl font-semibold text-gray-700">No tienes compras aún</p>
        <p class="text-base">Explora el catálogo y realiza tu primera compra.</p>
        <UButton size="lg" class="mt-2" @click="router.push('/product-catalog')"
          >Ver productos</UButton
        >
      </div>

      <div v-else>
        <div class="space-y-4">
          <UCard v-for="purchase in purchases" :key="purchase.id">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex flex-col items-start gap-0">
                  <div class="flex items-center justify-start gap-2">
                    <UIcon name="i-lucide-receipt" class="text-primary text-lg" />
                    <span class="font-semibold">Compra #{{ purchase.id }}</span>
                  </div>
                  <span class="text-xs text-gray-400">{{ formatDate(purchase.created_at) }}</span>
                </div>
                <span class="text-sm text-gray-500">
                  {{ purchase.products.reduce((sum, i) => sum + i.quantity, 0) }} unidad(es)
                </span>
              </div>
            </template>

            <div class="space-y-4">
              <div
                v-for="item in purchase.products"
                :key="item.id"
                class="flex gap-4 items-start justify-between"
              >
                <div class="flex grow gap-4 items-start">
                  <img
                    v-if="parseImages(item.product.images).length > 0"
                    :src="parseImages(item.product.images)[0]"
                    :alt="item.product.name"
                    class="size-20 object-contain rounded bg-white border shrink-0"
                  />
                  <div
                    v-else
                    class="size-20 flex items-center justify-center bg-gray-100 rounded border shrink-0"
                  >
                    <UIcon name="i-lucide-image-off" class="text-2xl text-gray-400" />
                  </div>

                  <div class="flex flex-col min-w-0 gap-y-1">
                    <h2 class="font-semibold text-base leading-tight">{{ item.product.name }}</h2>
                    <p class="text-sm text-gray-500 line-clamp-1">{{ item.product.description }}</p>
                    <p class="text-sm text-gray-400">
                      {{ formatPrice(item.product.price) }} × {{ item.quantity }} unidad(es)
                    </p>
                  </div>
                </div>

                <p class="font-bold text-primary shrink-0">
                  {{ formatPrice(item.product.price * item.quantity) }}
                </p>
              </div>
            </div>

            <template #footer>
              <div class="flex justify-end items-center gap-2">
                <span class="text-sm text-gray-500">Valor total de la compra:</span>
                <span class="font-bold text-primary text-lg">{{
                  formatPrice(purchase.price)
                }}</span>
              </div>
            </template>
          </UCard>
        </div>

        <GlobalPaginator
          :current-page="currentPage"
          :total-elements="totalElements"
          :page-size="pageSize"
          @page-change="loadPurchases"
        />
      </div>
    </div>
  </ViewWrapper>
</template>
