import type { CountryEconomy, GlobalEvent } from '@/core/types/economy.types'

const RANDOM_OFFSET = 0.5
const RANDOM_SCALE = 0.5
const CRISIS_GDP_PENALTY = 1.0
const CRISIS_INFLATION_PENALTY = 1.0
const TECH_BOOM_GDP_BONUS = 1.5
const HIGH_INFLATION_THRESHOLD = 5
const INTEREST_RATE_HIKE = 0.25
const MIN_INFLATION = 0

export function calculateCountriesEconomy(
  countries: Record<string, CountryEconomy>,
  globalEvents: GlobalEvent[],
): Record<string, CountryEconomy> {
  const newCountries: Record<string, CountryEconomy> = {}

  for (const [id, country] of Object.entries(countries)) {
    let inflationDelta = (Math.random() - RANDOM_OFFSET) * RANDOM_SCALE // +/- 0.25% change
    let gdpDelta = (Math.random() - RANDOM_OFFSET) * RANDOM_SCALE

    // Global events impact
    if (globalEvents.some((e) => e.id === 'financial_crisis')) {
      gdpDelta -= CRISIS_GDP_PENALTY
      inflationDelta += CRISIS_INFLATION_PENALTY
    }
    if (globalEvents.some((e) => e.id === 'tech_boom')) {
      gdpDelta += TECH_BOOM_GDP_BONUS
    }

    newCountries[id] = {
      ...country,
      gdpGrowth: country.gdpGrowth + gdpDelta,
      inflation: Math.max(MIN_INFLATION, country.inflation + inflationDelta),
      // Simple central bank logic: raise rates if inflation is high
      interestRate:
        country.inflation > HIGH_INFLATION_THRESHOLD
          ? country.interestRate + INTEREST_RATE_HIKE
          : country.interestRate,
    }
  }

  return newCountries
}
