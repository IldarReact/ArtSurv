import type { StateCreator } from 'zustand'

import type { PriceCategory } from '@/core/lib/calculations/inflation-engine'
import {
  getInflatedShopPrice,
  getInflatedHousingPrice,
} from '@/core/lib/calculations/price-helpers'
import { getShopItemById } from '@/core/lib/data-loaders/shop-loader'
import { getItemCost, isRecurringItem } from '@/core/types/shop.types'

import type { GameStore, ShopSlice } from '../../types'

export const createShopSlice: StateCreator<GameStore, [], [], ShopSlice> = (set, get) => ({
  buyItem: (itemId: string) => {
    const player = get().player
    const state = get()
    if (!player) return

    const item = getShopItemById(itemId, player.countryId)
    if (!item) return

    const baseCost = getItemCost(item)
    const country = state.countries[player.countryId]

    // Применяем инфляцию к цене
    const category = (
      ['food', 'health', 'services', 'transport'].includes(item.category)
        ? item.category
        : 'default'
    ) as PriceCategory

    let cost = baseCost
    if (isRecurringItem(item)) {
      cost = getInflatedShopPrice(baseCost, country, category)
    } else if (item.category === 'housing' && item.price) {
      cost = getInflatedHousingPrice(item.price, country)
    } else if (item.price) {
      cost = getInflatedShopPrice(item.price, country, category)
    }

    if (!get().performTransaction({ money: -cost }, { title: 'Покупка товара' })) {
      return
    }

    get().pushNotification({
      message: `Вы купили "${item.name}" за $${cost.toLocaleString()}`,
      title: 'Покупка успешна',
      type: 'success',
    })
  },

  setLifestyle: (category: string, itemId: string | undefined) => {
    const player = get().player
    if (!player) return

    // Запрещаем удалять обязательные категории (еда, транспорт)
    const requiredCategories = ['food', 'transport']
    if (requiredCategories.includes(category) && !itemId) {
      get().pushNotification({
        message: 'Эта категория обязательна для жизни',
        title: 'Невозможно отменить',
        type: 'error',
      })
      return
    }

    let newLifestyle = { ...player.activeLifestyle }
    if (itemId) {
      newLifestyle[category] = itemId
    } else {
      const { [category]: _unused, ...rest } = newLifestyle
      void _unused
      newLifestyle = rest
    }

    get().updatePlayer({
      activeLifestyle: newLifestyle,
    })
  },

  setPlayerHousing: (housingId: string) => {
    const player = get().player
    const state = get()
    if (!player) return

    const housing = getShopItemById(housingId, player.countryId)
    if (housing?.category !== 'housing') {
      get().pushNotification({
        message: 'Жильё не найдено',
        title: 'Ошибка',
        type: 'error',
      })
      return
    }

    const baseCost = housing.price ?? 0
    const country = state.countries[player.countryId]

    // Применяем инфляцию к цене жилья
    let cost = baseCost
    if (baseCost > 0) {
      cost = getInflatedHousingPrice(baseCost, country)
    }

    if (!get().performTransaction({ money: -cost }, { title: 'Покупка жилья' })) {
      return
    }

    // Списываем деньги и меняем жильё
    get().updatePlayer({
      housingId,
    })

    get().pushNotification({
      message: `Вы купили "${housing.name}" за $${cost.toLocaleString()}`,
      title: 'Переезд завершён',
      type: 'success',
    })
  },
})
