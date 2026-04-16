import type { ShopItem } from '@/core/types/shop.types'
import brHealth from '@/shared/data/world/countries/brazil/shop-categories/health.json'
import brServices from '@/shared/data/world/countries/brazil/shop-categories/services.json'
import geHealth from '@/shared/data/world/countries/germany/shop-categories/health.json'
import geServices from '@/shared/data/world/countries/germany/shop-categories/services.json'
import usHealth from '@/shared/data/world/countries/us/shop-categories/health.json'
import usServices from '@/shared/data/world/countries/us/shop-categories/services.json'

const COUNTRY_CATEGORIES: Record<string, ShopItem[]> = {
  br: [...brHealth, ...brServices] as ShopItem[],
  ge: [...geHealth, ...geServices] as ShopItem[],
  us: [...usHealth, ...usServices] as ShopItem[],
}

export function getShopCategoryItems(countryId = 'us'): ShopItem[] {
  return COUNTRY_CATEGORIES[countryId] ?? []
}
