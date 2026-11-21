import type { EconomicEvent, CountryEconomy } from '@/core/types'

export function applyEventEffects(economy: CountryEconomy, event: EconomicEvent): CountryEconomy {
  void event
  return economy
}

export function updateActiveEvents(events: EconomicEvent[]): EconomicEvent[] {
  return events
    .map((event) => ({
      ...event,
      duration: event.duration - 1,
    }))
    .filter((event) => event.duration > 0)
}

const PERCENT_DIVISOR = 100

export function applyNaturalEconomicChanges(economy: CountryEconomy): CountryEconomy {
  return economy
}

export function calculateAdjustedSalary(
  baseSalary: number,
  economy: CountryEconomy,
  quartersPassed = 0,
): number {
  const quarterlyInflation = economy.inflation / PERCENT_DIVISOR
  const inflationMultiplier = Math.pow(1 + quarterlyInflation, quartersPassed)
  return Math.round(baseSalary * inflationMultiplier * economy.salaryModifier)
}
