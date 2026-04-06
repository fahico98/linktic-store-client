<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import axios from 'axios'
import ViewWrapper from '@/components/ViewWrapper.vue'
import CatalogPaginator from '@/components/GlobalPaginator.vue'
import CatalogSearch from '@/components/products/CatalogSearch.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { Product } from '@/types/product'

function parseImages(raw: string | string[]): string[] {
  if (Array.isArray(raw)) return raw
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [raw]
  } catch {
    return raw ? [raw] : []
  }
}

const toast = useToast()
const authStore = useAuthStore()
const cartStore = useCartStore()
const products = ref<Product[]>([])
const loading = ref(false)
const quantities = ref<Map<number, number>>(new Map())
const currentPage = ref(1)
const totalElements = ref(0)
const pageSize = ref(1)
const searchText = ref('')

const availableStock = computed(() => {
  const map = new Map<number, number>()
  for (const product of products.value) {
    const inCart = cartStore.items.find((item) => item.product.id === product.id)?.quantity ?? 0
    map.set(product.id, product.available_stock - inCart)
  }
  return map
})

function getAvailableStock(id: number) {
  return availableStock.value.get(id) ?? 0
}

function getQuantity(id: number) {
  return quantities.value.get(id) ?? 1
}

function changeQuantity(id: number, delta: number) {
  const current = getQuantity(id)
  const next = Math.min(Math.max(1, current + delta), getAvailableStock(id))
  quantities.value = new Map(quantities.value).set(id, next)
}

function addToCart(product: Product) {
  const quantity = getQuantity(product.id)
  const stock = getAvailableStock(product.id)
  if (quantity > stock) {
    toast.add({
      title: 'Stock insuficiente',
      description: `Solo hay ${stock} unidades disponibles de ${product.name}.`,
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
    return
  }
  cartStore.addItem(product, quantity)
  quantities.value = new Map(quantities.value).set(product.id, 1)
  toast.add({
    title: 'Producto agregado',
    description: `${product.name} se agregó al carrito.`,
    color: 'success',
    icon: 'i-lucide-shopping-cart',
  })
}

async function loadProducts(page: number) {
  loading.value = true

  try {
    const response = await axios.get<{
      content: (Omit<Product, 'images'> & { images: string | string[] })[]
      total_elements: number
      size: number
    }>(`${import.meta.env.VITE_API_URL}/api/products`, {
      params: { page: page - 1, ...(searchText.value ? { searchText: searchText.value } : {}) },
      headers: { Authorization: `Bearer ${authStore.token}` },
    })
    products.value = response.data.content.map((p) => ({ ...p, images: parseImages(p.images) }))
    totalElements.value = response.data.total_elements
    pageSize.value = response.data.size
    currentPage.value = page
  } catch {
    toast.add({
      title: 'Error al cargar los productos',
      description: 'No se pudieron cargar los productos. Intentalo nuevamente.',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    loading.value = false
  }
}

function onSearch(text: string) {
  searchText.value = text
  loadProducts(1)
}

onMounted(() => loadProducts(1))
</script>

<template>
  <ViewWrapper>
    <div class="py-10">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl">Catálogo de productos</h1>
        <CatalogSearch @search="onSearch" />
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <UIcon name="i-lucide-loader-circle" class="animate-spin text-4xl text-primary" />
      </div>

      <div v-else-if="products.length === 0" class="text-center text-gray-500 py-16">
        No hay productos disponibles.
      </div>

      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard v-for="product in products" :key="product.id">
            <template #header>
              <UCarousel
                v-if="product.images.length > 0"
                :items="product.images"
                :arrows="product.images.length > 1"
                :prev="{ size: 'xs' }"
                :next="{ size: 'xs' }"
                class="rounded-lg"
                :ui="{
                  viewport: 'overflow-hidden rounded-lg',
                  prev: 'absolute start-2 sm:start-2 top-1/2 -translate-y-1/2 rounded-full bg-default/80 hover:bg-default shadow z-10',
                  next: 'absolute end-2 sm:end-2 top-1/2 -translate-y-1/2 rounded-full bg-default/80 hover:bg-default shadow z-10',
                }"
              >
                <template #default="{ item }">
                  <img
                    :src="item"
                    :alt="product.name"
                    class="w-full h-48 object-contain bg-white"
                  />
                </template>
              </UCarousel>
              <div
                v-else
                class="w-full h-48 bg-gray-100 flex items-center justify-center rounded-lg"
              >
                <UIcon name="i-lucide-image-off" class="text-4xl text-gray-400" />
              </div>
            </template>

            <div class="space-y-2">
              <h2 class="font-semibold text-lg leading-tight">{{ product.name }}</h2>
              <p class="text-sm text-gray-500 line-clamp-3">{{ product.description }}</p>
              <p
                v-if="getAvailableStock(product.id) === 0"
                class="text-sm text-red-500 font-medium"
              >
                Agotado
              </p>
              <p v-else class="text-sm text-gray-400">
                Stock disponible: {{ getAvailableStock(product.id) }}
              </p>
            </div>

            <template #footer>
              <div class="flex flex-col gap-y-2">
                <p class="text-primary font-bold text-lg text-start">
                  {{
                    product.price.toLocaleString('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    })
                  }}
                </p>
                <div class="flex items-center justify-between">
                  <UButton
                    size="sm"
                    icon="i-lucide-shopping-cart"
                    :disabled="getAvailableStock(product.id) === 0"
                    @click="addToCart(product)"
                    >Agregar al carrito</UButton
                  >
                  <div class="flex items-center border border-primary rounded-lg">
                    <UButton
                      size="sm"
                      variant="ghost"
                      icon="i-lucide-minus"
                      :disabled="getQuantity(product.id) <= 1"
                      @click="changeQuantity(product.id, -1)"
                    />
                    <span class="px-3 text-sm font-medium text-center">{{
                      getQuantity(product.id)
                    }}</span>
                    <UButton
                      size="sm"
                      variant="ghost"
                      icon="i-lucide-plus"
                      :disabled="getQuantity(product.id) >= getAvailableStock(product.id)"
                      @click="changeQuantity(product.id, 1)"
                    />
                  </div>
                </div>
              </div>
            </template>
          </UCard>
        </div>
        <CatalogPaginator
          :current-page="currentPage"
          :total-elements="totalElements"
          :page-size="pageSize"
          @page-change="loadProducts"
        />
      </div>
    </div>
  </ViewWrapper>
</template>
