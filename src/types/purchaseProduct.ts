import type { Product } from '@/types/product'

export interface PurchaseProduct {
  id: number
  product: Product
  quantity: number
}
