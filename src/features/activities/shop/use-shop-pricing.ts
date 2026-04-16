import { useMemo } from 'react'

import { useInflatedPrice } from '@/core/hooks'
import type { ShopItem } from '@/core/types/shop.types'
import { isRecurringItem } from '@/core/types/shop.types'

interface ShopPricing {
  canAfford: boolean
  displayPrice: number
  isRecurring: boolean
}

export function useShopPricing(item: ShopItem, playerMoney: number): ShopPricing {
  const displayPrice = useInflatedPrice(item)
  const isRecurring = useMemo(() => isRecurringItem(item), [item])

  return {
    canAfford: playerMoney >= displayPrice,
    displayPrice,
    isRecurring,
  }
}
