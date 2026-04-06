<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { useToast } from '@nuxt/ui/composables'
import ViewWrapper from '@/components/ViewWrapper.vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()
const isCheckingOut = ref(false)

function clearCart() {
  cartStore.clearCart()
  toast.add({
    title: 'Carrito vaciado',
    description: 'Tu carrito se vació con éxito.',
    color: 'success',
    icon: 'i-lucide-circle-check-big',
  })
  router.push('/product-catalog')
}

async function checkout() {
  isCheckingOut.value = true
  try {
    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/purchases`,
      { items: cartStore.items, user_id: authStore.user?.id },
      { headers: { Authorization: `Bearer ${authStore.token}` } },
    )
    cartStore.clearCart()
    toast.add({
      title: 'Compra realizada',
      description: 'Tu pedido se realizó con éxito.',
      color: 'success',
      icon: 'i-lucide-circle-check-big',
    })
    router.push('/product-catalog')
  } catch {
    toast.add({
      title: 'Error al finalizar compra',
      description: 'Ocurrió un error al procesar tu pedido. Intentalo nuevamente.',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    isCheckingOut.value = false
  }
}

function formatPrice(value: number) {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  })
}
</script>

<template>
  <ViewWrapper>
    <div class="py-10">
      <h1 class="text-2xl mb-6">Carrito de compras</h1>

      <div
        v-if="cartStore.items.length === 0"
        class="flex flex-col items-center justify-center text-center text-gray-500 py-32 gap-4"
      >
        <UIcon name="i-lucide-shopping-cart" class="text-8xl" />
        <p class="text-2xl font-semibold text-gray-700">Tu carrito está vacío</p>
        <p class="text-base">Agrega productos para comenzar tu compra.</p>
        <UButton size="lg" class="mt-2" @click="router.push('/product-catalog')"
          >Ver productos</UButton
        >
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-8">
        <!-- Items list -->
        <div class="flex-1 space-y-4">
          <UCard v-for="item in cartStore.items" :key="item.product.id">
            <div class="flex gap-4 items-start justify-between">
              <div class="flex grow gap-4 items-start">
                <img
                  v-if="item.product.images.length > 0"
                  :src="item.product.images[0]"
                  :alt="item.product.name"
                  class="size-32 object-contain rounded bg-white border"
                />
                <div
                  v-else
                  class="w-20 h-20 flex items-center justify-center bg-gray-100 rounded border"
                >
                  <UIcon name="i-lucide-image-off" class="text-2xl text-gray-400" />
                </div>

                <div class="flex flex-col min-w-0 gap-y-2">
                  <h2 class="font-semibold text-base leading-tight">
                    {{ item.product.name }}
                  </h2>
                  <p class="text-sm text-gray-500 line-clamp-3">
                    {{ item.product.description }}
                  </p>
                  <p class="text-sm">{{ formatPrice(item.product.price) }}</p>
                </div>
              </div>

              <div class="flex flex-col items-end gap-2 shrink-0">
                <p class="font-bold text-primary">
                  {{ formatPrice(item.product.price * item.quantity) }}
                </p>

                <div class="flex items-center border border-primary rounded-lg">
                  <UButton
                    size="sm"
                    variant="ghost"
                    icon="i-lucide-minus"
                    @click="cartStore.updateQuantity(item.product.id, item.quantity - 1)"
                  />
                  <span class="px-3 text-sm font-medium">{{ item.quantity }}</span>
                  <UButton
                    size="sm"
                    variant="ghost"
                    icon="i-lucide-plus"
                    :disabled="item.quantity >= item.product.available_stock"
                    @click="cartStore.updateQuantity(item.product.id, item.quantity + 1)"
                  />
                </div>

                <UButton
                  size="md"
                  color="error"
                  variant="outline"
                  icon="i-lucide-trash-2"
                  @click="cartStore.removeItem(item.product.id)"
                >
                  Eliminar
                </UButton>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Summary -->
        <div class="w-full lg:w-72 shrink-0">
          <UCard>
            <template #header>
              <h2 class="font-semibold text-lg">Resumen del pedido</h2>
            </template>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500">Productos ({{ cartStore.totalItems }})</span>
                <span>{{ formatPrice(cartStore.totalPrice) }}</span>
              </div>
              <USeparator />
              <div class="flex justify-between font-bold text-base">
                <span>Total</span>
                <span class="text-primary">{{ formatPrice(cartStore.totalPrice) }}</span>
              </div>
            </div>

            <template #footer>
              <div class="flex flex-col gap-2">
                <UButton block :loading="isCheckingOut" @click="checkout()"
                  >Finalizar compra</UButton
                >
                <UButton block variant="outline" @click="router.push('/product-catalog')"
                  >Seguir comprando</UButton
                >
                <UButton block variant="outline" @click="clearCart()">Vaciar carrito</UButton>
              </div>
            </template>
          </UCard>
        </div>
      </div>
    </div>
  </ViewWrapper>
</template>
