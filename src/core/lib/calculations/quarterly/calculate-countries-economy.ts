import type { CountryEconomy, GlobalEvent } from '@/core/types/economy.types'

export function calculateCountriesEconomy(
  countries: Record<string, CountryEconomy>,
  _globalEvents: GlobalEvent[],
): Record<string, CountryEconomy> {
  // Deprecated: country economy changes only through country-economy-processor.
  // Keep this function for compatibility, but global events must not mutate countries.
  return countries
}
