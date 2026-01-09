// src/shared/data/housing/loader.ts
import { HousingOptionSchema } from '@/core/schemas/game.schema'
import { HousingOption } from '@/core/types/housing.types'

// Импорт JSON-файлов по странам
import brHousing from '@/shared/data/world/countries/brazil/housing.json'
import geHousing from '@/shared/data/world/countries/germany/housing.json'
import usHousing from '@/shared/data/world/countries/us/housing.json'

// ──────────────────────────────────────────────────────────────────────
// Загрузка и валидация данных по стране
// ──────────────────────────────────────────────────────────────────────
function loadHousing(data: unknown[], source: string): HousingOption[] {
  if (!Array.isArray(data)) {
    throw new Error(`Housing data is not an array: ${source}`)
  }

  return data
    .map((item) => {
      const result = HousingOptionSchema.safeParse(item)
      if (!result.success) {
        console.error(
          `Housing validation failed in ${source} for item:`,
          item,
          result.error.format(),
        )
        return null
      }
      return result.data as HousingOption
    })
    .filter((item): item is HousingOption => item !== null)
}

// ──────────────────────────────────────────────────────────────────────
// Регистр жилья по странам
// ──────────────────────────────────────────────────────────────────────
const COUNTRY_HOUSING: Record<string, HousingOption[]> = {
  us: loadHousing(usHousing, 'US'),
  germany: loadHousing(geHousing, 'Germany'),
  brazil: loadHousing(brHousing, 'Brazil'),
}

// ──────────────────────────────────────────────────────────────────────
// Публичные функции
// ──────────────────────────────────────────────────────────────────────

// Все жильё для конкретной страны
export function getHousingForCountry(countryId: string): HousingOption[] {
  return COUNTRY_HOUSING[countryId] ?? []
}

// По ID (с указанием страны)
export function getHousingById(id: string, countryId: string = 'us'): HousingOption | undefined {
  return getHousingForCountry(countryId).find((h) => h.id === id)
}

// Доступное жильё по финансам (учитываем тип владения)
export function getAvailableHousing(
  playerMoney: number,
  playerSalary: number,
  countryId: string = 'us',
): HousingOption[] {
  const options = getHousingForCountry(countryId)

  return options.filter((housing) => {
    // Аренда — проверяем, хватает ли на 3 квартала вперёд (безопасность)
    if (housing.type === 'rent') {
      const needed = housing.rentCostPerQuarter * 3
      return playerMoney >= needed
    }

    // Ипотека — нужен первоначальный взнос (обычно 20–30% от marketValue)
    if (housing.type === 'mortgage') {
      const downPayment = Math.round(housing.marketValue * 0.25) // можно вынести в конфиг
      return playerMoney >= downPayment
    }

    // Своё жильё — нужна вся сумма
    if (housing.type === 'own') {
      return playerMoney >= housing.marketValue
    }

    return false
  })
}

// Лучшие инвестиционные варианты (по росту привлекательности)
export function getBestInvestmentHousing(
  countryId: string = 'us',
  limit: number = 5,
): HousingOption[] {
  const housing = getHousingForCountry(countryId)

  return housing
    .map((h) => {
      const totalBonus = h.nearbyConstructions.reduce((sum, c) => sum + c.attractivenessBonus, 0)
      return { housing: h, potentialGrowth: totalBonus }
    })
    .sort((a, b) => b.potentialGrowth - a.potentialGrowth)
    .slice(0, limit)
    .map((x) => x.housing)
}

// Для обратной совместимости (старые компоненты)
export const HOUSING_OPTIONS = COUNTRY_HOUSING.us

// Дефолтное жильё при старте (аренда комнаты)
export const DEFAULT_HOUSING_ID = 'rent_room_basic'
