import { generateEconomicEvent } from '@/core/lib/economic-events/generator'
import type { CountryEconomy, EconomicEvent } from '@/core/types'

import { processEconomicCycle } from './cycle-processor'

const MIN_PERCENT = 0
const MAX_TAX_PERCENT = 100
const MAX_HISTORY_LENGTH = 10

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export interface CountryEconomyProcessorResult {
  country: CountryEconomy
  event: EconomicEvent | null
}

export function processCountryEconomy(
  currentCountry: CountryEconomy,
  turn: number,
): CountryEconomyProcessorResult {
  const event = generateEconomicEvent(turn, currentCountry)
  const cycleResult = processEconomicCycle(currentCountry.cycle, turn)
  const effects = event?.effects

  const inflation = clamp(
    currentCountry.inflation + (effects?.inflationChange ?? 0),
    MIN_PERCENT,
    Number.POSITIVE_INFINITY,
  )
  const keyRate = clamp(
    currentCountry.keyRate + (effects?.keyRateChange ?? 0),
    MIN_PERCENT,
    Number.POSITIVE_INFINITY,
  )
  const taxRate = clamp(
    currentCountry.taxRate + (effects?.personalTaxRateChange ?? 0),
    MIN_PERCENT,
    MAX_TAX_PERCENT,
  )
  const corporateTaxRate = clamp(
    currentCountry.corporateTaxRate + (effects?.corporateTaxRateChange ?? 0),
    MIN_PERCENT,
    MAX_TAX_PERCENT,
  )
  const psychologicalStability = clamp(
    (currentCountry.psychologicalStability ?? 50) + (effects?.psychologicalStabilityChange ?? 0),
    MIN_PERCENT,
    100,
  )

  const country: CountryEconomy = {
    ...currentCountry,
    activeEvents: event ? [event] : [],
    corporateTaxRate,
    cycle: cycleResult.cycle,
    gdpGrowth: currentCountry.gdpGrowth + (effects?.gdpGrowthChange ?? 0),
    inflation,
    inflationHistory: [inflation, ...(currentCountry.inflationHistory ?? [])].slice(
      0,
      MAX_HISTORY_LENGTH,
    ),
    interestRate: keyRate,
    keyRate,
    psychologicalStability,
    salaryModifier: clamp(
      currentCountry.salaryModifier * (effects?.salaryModifierChange ?? 1),
      MIN_PERCENT,
      Number.POSITIVE_INFINITY,
    ),
    taxRate,
    unemployment: clamp(
      currentCountry.unemployment + (effects?.unemploymentChange ?? 0),
      MIN_PERCENT,
      100,
    ),
  }

  return { country, event }
}
