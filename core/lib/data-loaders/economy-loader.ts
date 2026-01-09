import { CountryEconomySchema } from '@/core/schemas/economy.schema'
import type { CountryEconomy, CountryArchetype } from '@/core/types/economy.types'

// Статический импорт всех economy.json файлов
import brazilEconomy from '@/shared/data/world/countries/brazil/economy.json'
import germanyEconomy from '@/shared/data/world/countries/germany/economy.json'
import usEconomy from '@/shared/data/world/countries/us/economy.json'

export interface CountryData extends CountryEconomy {
  // Дополнительные поля, если появятся
}

// Создаем объект со всеми странами
const rawCountries = {
  us: usEconomy,
  germany: germanyEconomy,
  brazil: brazilEconomy,
}

// Преобразуем в нужный формат с валидацией
export const WORLD_COUNTRIES: Readonly<Record<string, CountryData>> = Object.entries(
  rawCountries,
).reduce(
  (acc, [key, raw]) => {
    const result = CountryEconomySchema.safeParse(raw)

    if (!result.success) {
      console.error(`Invalid country data for ${key}:`, raw, result.error.format())
      return acc
    }

    const validatedRaw = result.data

    const country: CountryData = {
      id: validatedRaw.id,
      name: validatedRaw.name,
      archetype: (validatedRaw.archetype ?? 'rich_stable') as CountryArchetype,
      gdpGrowth: validatedRaw.gdpGrowth ?? 0,
      inflation: validatedRaw.inflation ?? 0,
      stockMarketInflation: validatedRaw.stockMarketInflation ?? validatedRaw.inflation ?? 0,
      keyRate: validatedRaw.keyRate ?? 0,
      interestRate: validatedRaw.keyRate ?? 0, // Fallback for deprecated field
      unemployment: validatedRaw.unemployment ?? 0,
      taxRate: validatedRaw.taxRate ?? 0,
      corporateTaxRate: validatedRaw.corporateTaxRate ?? 0,
      salaryModifier: validatedRaw.salaryModifier ?? 1,
      costOfLivingModifier: validatedRaw.costOfLivingModifier ?? 1,
      baseSalaries: (validatedRaw as { baseSalaries?: Record<string, number> }).baseSalaries,
      activeEvents: [],
      inflationHistory: validatedRaw.inflation ? [validatedRaw.inflation] : [],
      baseYear: 2024,
      imageUrl: validatedRaw.imageUrl,
    }

    acc[country.id] = country
    return acc
  },
  {} as Record<string, CountryData>,
)

export const getCountry = (id: string) => WORLD_COUNTRIES[id]
export const getAllCountryIds = () => Object.keys(WORLD_COUNTRIES)

export const getAvailableCountries = () =>
  Object.values(WORLD_COUNTRIES).map((data) => ({ id: data.id, name: data.name }))
