// src/shared/data/loaders/transport-loader.ts
import { ShopItemSchema } from '@/core/schemas/finance.schema'
import type { ShopItem } from '@/core/types/shop.types'
import brTransport from '@/shared/data/world/countries/brazil/transport.json'
import geTransport from '@/shared/data/world/countries/germany/transport.json'
import usTransport from '@/shared/data/world/countries/us/transport.json'

function loadAndValidate(data: unknown[], source: string): ShopItem[] {
  return data
    .map((item) => {
      const result = ShopItemSchema.safeParse(item)
      if (!result.success) {
        console.error(`Invalid transport item in ${source}:`, item, result.error.format())
        return null
      }
      return result.data as ShopItem
    })
    .filter((item): item is ShopItem => item !== null)
}

const COUNTRY_TRANSPORT: Record<string, ShopItem[]> = {
  us: loadAndValidate(usTransport, 'us/transport.json'),
  ge: loadAndValidate(geTransport, 'ge/transport.json'),
  br: loadAndValidate(brTransport, 'br/transport.json'),
}

export function getTransportOptions(countryId: string = 'us'): ShopItem[] {
  return COUNTRY_TRANSPORT[countryId] ?? []
}
