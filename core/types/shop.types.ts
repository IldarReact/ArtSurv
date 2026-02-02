import type { AssetType } from './finance.types'
import type { StatEffect } from './stats.types'

export type ShopCategory = 'food' | 'transport' | 'health' | 'services' | 'housing'

/** Базовый интерфейс */
export interface BaseShopItem {
  capacity?: number
  category: ShopCategory
  description?: string
  effects?: StatEffect
  id: string
  name: string
}

/** Разовая покупка (машина, гаджет, подарок) */
export interface OneTimeShopItem extends BaseShopItem {
  // Для активов (машины, недвижимость и т.д.)
  assetType?: AssetType
  costPerTurn?: number
  isRecurring?: false

  maintenanceCost?: number
  price: number
}

/** Рекуррентная подписка (еда, транспорт, жильё, Netflix) */
export interface RecurringShopItem extends BaseShopItem {
  costPerTurn: number
  isRecurring: true
  price?: number
}

/** Главный тип */
export type ShopItem = OneTimeShopItem | RecurringShopItem

export function isRecurringItem(item: ShopItem): item is RecurringShopItem {
  return (item as RecurringShopItem).isRecurring
}

export function getItemCost(item: ShopItem): number {
  return isRecurringItem(item) ? item.costPerTurn : item.price
}
