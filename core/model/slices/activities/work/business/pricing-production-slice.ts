import { canChangePrice, syncPriceToNetwork } from '@/core/lib/business/business-network'
import type { Business } from '@/core/types/business.types'

import type { GameStateCreator } from '../../../types'
import type { PricingProductionSlice } from '../../../types/business.types'

export const createPricingProductionSlice: GameStateCreator<PricingProductionSlice> = (
  set,
  get,
) => ({
  changePrice: (businessId: string, newPrice: number) => {
    const state = get()
    if (!state.player) return

    // Clamp price between 1 and 10
    const MIN_PRICE = 1
    const MAX_PRICE = 10
    const clampedPrice = Math.max(MIN_PRICE, Math.min(MAX_PRICE, Math.round(newPrice)))

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) return

    if (!canChangePrice(business)) {
      return
    }

    let updatedBusinesses = state.player.businesses

    if (business.networkId) {
      updatedBusinesses = syncPriceToNetwork(
        state.player.businesses,
        business.networkId,
        clampedPrice,
      )
    } else {
      updatedBusinesses = state.player.businesses.map((b) =>
        b.id === businessId ? { ...b, price: clampedPrice } : b,
      )
    }

    const MARKUP_COEFFICIENT = 15 // markup coefficient per price level
    const recalcInventoryPrice = (b: Business): Business => {
      if (b.isServiceBased) return b
      const level = b.price
      const cost = b.inventory.purchaseCost
      const PERCENT_DIVISOR = 100
      const PRICE_OFFSET = 5
      const newPricePerUnit = Math.round(
        cost * (1 + (MARKUP_COEFFICIENT / PERCENT_DIVISOR) * (level - PRICE_OFFSET)),
      )
      return {
        ...b,
        inventory: {
          ...b.inventory,
          pricePerUnit: newPricePerUnit,
        },
      }
    }

    if (business.networkId) {
      const nid = business.networkId
      updatedBusinesses = updatedBusinesses.map((b) =>
        b.networkId === nid ? recalcInventoryPrice(b) : b,
      )
    } else {
      updatedBusinesses = updatedBusinesses.map((b) =>
        b.id === businessId ? recalcInventoryPrice(b) : b,
      )
    }

    state.updatePlayer((_prev) => ({
      businesses: updatedBusinesses,
    }))
  },

  setAutoPurchase: (businessId: string, amount: number) => {
    const state = get()
    if (!state.player) return

    state.updatePlayer((prev) => ({
      businesses: prev.businesses.map((b) =>
        b.id === businessId
          ? {
              ...b,
              inventory: {
                ...b.inventory,
                autoPurchaseAmount: amount,
              },
            }
          : b,
      ),
    }))
  },

  setQuantity: (businessId: string, newQuantity: number) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) return

    if (business.isServiceBased) {
      state.pushNotification({
        message: 'Нельзя изменить объем производства для сферы услуг',
        title: 'Ошибка',
        type: 'error',
      })
      return
    }

    const updatedBusinesses = state.player.businesses.map((b) =>
      b.id === businessId ? { ...b, quantity: Math.max(0, Math.round(newQuantity)) } : b,
    )

    set((state) => ({
      player: state.player
        ? {
            ...state.player,
            businesses: updatedBusinesses,
          }
        : null,
    }))
  },
})
