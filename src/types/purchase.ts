import type { PurchaseProduct } from '@/types/purchaseProduct'

export interface Purchase {
  id: number
  price: number
  created_at: string
  products: PurchaseProduct[]
}
