import { nanoid } from 'nanoid'
import type { StateCreator } from 'zustand'

import type { Asset } from '@/core/types/finance.types'

import type { GameStore } from '../../types'
import type { InvestmentSlice } from '../../types/investment.types'

export const createInvestmentSlice: StateCreator<GameStore, [], [], InvestmentSlice> = (
  set,
  get,
) => ({
  buyAsset: ({ name, price, quantity, type }) => {
    const totalCost = price * quantity

    // 1. Пытаемся списать деньги через централизованный метод
    if (!get().performTransaction({ money: -totalCost }, { title: `Покупка: ${name}` })) {
      return
    }

    // 2. Получаем обновленное состояние
    const player = get().player
    if (!player) return

    const assetTypeMap = {
      metal: 'deposit', // Для металлов используем deposit или расширим типы
      real_estate: 'real_estate',
      stock: 'stock',
    } as const

    const asset: Asset = {
      currentValue: totalCost,
      expenses: 0,
      id: nanoid(),
      income: 0,
      liquidity: type === 'stock' ? 'high' : type === 'metal' ? 'medium' : 'low',
      name: `${name} (${quantity.toString()} шт.)`,
      purchasePrice: totalCost,
      quantity,
      risk: type === 'stock' ? 'medium' : type === 'metal' ? 'low' : 'medium',
      type: assetTypeMap[type],
      unrealizedGain: 0,
      value: totalCost,
    }

    get().updatePlayer({
      assets: [...player.assets, asset],
    })

    get().pushNotification({
      message: `Вы купили ${quantity.toString()} шт. ${name} за $${totalCost.toLocaleString()}`,
      title: 'Актив приобретен',
      type: 'success',
    })
  },
})
