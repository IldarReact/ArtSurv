import { ShopItemSchema } from '@/core/schemas/finance.schema'
import type { ShopItem } from '@/core/types/shop.types'
import brFood from '@/shared/data/world/countries/brazil/shop-categories/food.json'
import geFood from '@/shared/data/world/countries/germany/shop-categories/food.json'
import usFood from '@/shared/data/world/countries/us/shop-categories/food.json'

function loadFood(data: unknown[], _source: string): ShopItem[] {
  return data
    .map((item) => {
      const result = ShopItemSchema.safeParse(item)
      if (!result.success) {
        // console.error(`Invalid food item in ${source}:`, item, result.error.format())
        return null
      }
      return result.data as ShopItem
    })
    .filter((item): item is ShopItem => item !== null)
}

const COUNTRY_FOOD: Record<string, ShopItem[]> = {
  br: loadFood(brFood, 'brazil/food.json'),
  ge: loadFood(geFood, 'germany/food.json'),
  us: loadFood(usFood, 'us/food.json'),
}

export function getFoodOptions(countryId = 'us'): ShopItem[] {
  return COUNTRY_FOOD[countryId] ?? []
}

export const DEFAULT_FOOD_ID = 'food_basic' //fix
