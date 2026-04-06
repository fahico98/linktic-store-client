import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Product } from '@/types/product'

export interface CartItem {
  product: Product
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const totalItems = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  )

  function addItem(product: Product, quantity: number) {
    const existing = items.value.find((item) => item.product.id === product.id)
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.available_stock)
    } else {
      items.value.push({ product, quantity })
    }
  }

  function removeItem(productId: number) {
    items.value = items.value.filter((item) => item.product.id !== productId)
  }

  function updateQuantity(productId: number, quantity: number) {
    const item = items.value.find((item) => item.product.id === productId)
    if (!item) return
    if (quantity <= 0) {
      removeItem(productId)
    } else {
      item.quantity = Math.min(quantity, item.product.available_stock)
    }
  }

  function clearCart() {
    items.value = []
  }

  return { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart }
})
