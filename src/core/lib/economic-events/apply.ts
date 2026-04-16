import type { EconomicEvent, CountryEconomy } from '@/core/types'

export function applyEventEffects(economy: CountryEconomy, event: EconomicEvent): CountryEconomy {
  const { effects } = event
  return {
    ...economy,
    gdpGrowth: economy.gdpGrowth + (effects.gdpGrowthChange ?? 0),
    inflation: Math.max(0, economy.inflation + (effects.inflationChange ?? 0)),
    keyRate: Math.max(0, economy.keyRate + (effects.keyRateChange ?? 0)),
    salaryModifier: economy.salaryModifier * (effects.salaryModifierChange ?? 1),
    unemployment: Math.max(
      0,
      Math.min(100, economy.unemployment + (effects.unemploymentChange ?? 0)),
    ),
  }
}

export function updateActiveEvents(events: EconomicEvent[]): EconomicEvent[] {
  return events
    .map((event) => ({
      ...event,
      duration: event.duration - 1,
    }))
    .filter((event) => event.duration > 0)
}

const TARGET_INFLATION = 4
const INFLATION_SMOOTHING = 0.1
const KEY_RATE_SMOOTHING = 0.2
const GDP_RANDOM_OFFSET = 0.5
const GDP_RANDOM_SCALE = 0.5
const QUARTERS_IN_YEAR = 4
const PERCENT_DIVISOR = 100

export function applyNaturalEconomicChanges(economy: CountryEconomy): CountryEconomy {
  const inflationDelta = (TARGET_INFLATION - economy.inflation) * INFLATION_SMOOTHING
  const keyRateDelta = (economy.inflation - TARGET_INFLATION) * KEY_RATE_SMOOTHING
  const gdpDelta = (Math.random() - GDP_RANDOM_OFFSET) * GDP_RANDOM_SCALE

  return {
    ...economy,
    gdpGrowth: economy.gdpGrowth + gdpDelta,
    inflation: Math.max(0, economy.inflation + inflationDelta),
    keyRate: Math.max(0, economy.keyRate + keyRateDelta),
  }
}

export function calculateAdjustedSalary(
  baseSalary: number,
  economy: CountryEconomy,
  quartersPassed = 0,
): number {
  const quarterlyInflation = economy.inflation / QUARTERS_IN_YEAR / PERCENT_DIVISOR
  const inflationMultiplier = Math.pow(1 + quarterlyInflation, quartersPassed)
  return Math.round(baseSalary * inflationMultiplier * economy.salaryModifier)
}
