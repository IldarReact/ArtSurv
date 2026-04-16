import { CountryEconomySchema } from '@/core/schemas/economy.schema'
import type { CountryEconomy, CountryArchetype } from '@/core/types/economy.types'
// Статический импорт всех economy.json файлов
import brazilEconomy from '@/shared/data/world/countries/brazil/economy.json'
import germanyEconomy from '@/shared/data/world/countries/germany/economy.json'
import usEconomy from '@/shared/data/world/countries/us/economy.json'

export type CountryData = CountryEconomy

// Создаем объект со всеми странами
const rawCountries = {
  brazil: brazilEconomy,
  germany: germanyEconomy,
  us: usEconomy,
}

// Преобразуем в нужный формат с валидацией
const worldCountriesAcc: Record<string, CountryData> = {}
for (const [_key, raw] of Object.entries(rawCountries)) {
  const result = CountryEconomySchema.safeParse(raw)

  if (!result.success) {
    // console.error(`Invalid country data for ${key}:`, raw, result.error.format())
    continue
  }

  const validatedRaw = result.data

  const country: CountryData = {
    activeEvents: [],
    archetype: validatedRaw.archetype as CountryArchetype,
    baseSalaries: (validatedRaw as { baseSalaries?: Record<string, number> }).baseSalaries,
    baseYear: 2024,
    corporateTaxRate: validatedRaw.corporateTaxRate,
    costOfLivingModifier: validatedRaw.costOfLivingModifier,
    gdpGrowth: validatedRaw.gdpGrowth,
    id: validatedRaw.id,
    imageUrl: validatedRaw.imageUrl,
    inflation: validatedRaw.inflation,
    inflationHistory: [validatedRaw.inflation],
    interestRate: validatedRaw.keyRate,
    keyRate: validatedRaw.keyRate,
    name: validatedRaw.name,
    salaryModifier: validatedRaw.salaryModifier,
    stockMarketInflation: validatedRaw.stockMarketInflation,
    taxRate: validatedRaw.taxRate,
    unemployment: validatedRaw.unemployment,
  }

  worldCountriesAcc[country.id] = country
}

export const WORLD_COUNTRIES: Readonly<Record<string, CountryData>> = worldCountriesAcc

export const getCountry = (id: string) => WORLD_COUNTRIES[id]
export const getAllCountryIds = () => Object.keys(WORLD_COUNTRIES)

export const getAvailableCountries = () =>
  Object.values(WORLD_COUNTRIES).map((data) => ({ id: data.id, name: data.name }))
