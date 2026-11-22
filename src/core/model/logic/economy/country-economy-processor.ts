import { generateEconomicEvent } from '@/core/lib/economic-events/generator'
import { isQuarterEnd } from '@/core/lib/quarter'
import type {
  CountryEconomy,
  EconomicEvent,
  EconomicMetric,
  EconomicMetricChange,
} from '@/core/types'

import { processEconomicCycle } from './cycle-processor'

const MIN_PERCENT = 0
const MAX_TAX_PERCENT = 100

const MAX_INFLATION_HISTORY_LENGTH = 10

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function getAppliedChanges(
  before: CountryEconomy,
  after: CountryEconomy,
): Partial<Record<EconomicMetric, EconomicMetricChange>> {
  const metrics: [EconomicMetric, number, number][] = [
    ['inflation', before.inflation, after.inflation],
    ['keyRate', before.keyRate, after.keyRate],
    ['personalTaxRate', before.taxRate, after.taxRate],
    ['corporateTaxRate', before.corporateTaxRate, after.corporateTaxRate],
    ['gdpGrowth', before.gdpGrowth, after.gdpGrowth],
    ['unemployment', before.unemployment, after.unemployment],
    [
      'psychologicalStability',
      before.psychologicalStability ?? 50,
      after.psychologicalStability ?? 50,
    ],
    ['salaryModifier', before.salaryModifier, after.salaryModifier],
  ]
  const changes: Partial<Record<EconomicMetric, EconomicMetricChange>> = {}

  for (const [metric, from, to] of metrics) {
    if (from !== to) {
      changes[metric] = { delta: to - from, from, to }
    }
  }

  return changes
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
  const cycle = processEconomicCycle(currentCountry.cycle)
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
  const previousInflationHistory = currentCountry.inflationHistory ?? [currentCountry.inflation]
  const inflationHistory = isQuarterEnd(turn)
    ? [inflation, ...previousInflationHistory].slice(0, MAX_INFLATION_HISTORY_LENGTH)
    : [inflation, ...previousInflationHistory.slice(1)]

  const country: CountryEconomy = {
    ...currentCountry,
    activeEvents: [],
    corporateTaxRate,
    cycle,
    eventHistory: currentCountry.eventHistory ?? [],
    gdpGrowth: currentCountry.gdpGrowth + (effects?.gdpGrowthChange ?? 0),
    inflation,
    inflationHistory,
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

  if (!event) {
    return { country, event: null }
  }

  const recordedEvent: EconomicEvent = {
    ...event,
    appliedChanges: getAppliedChanges(currentCountry, country),
  }
  country.activeEvents = [recordedEvent]
  country.eventHistory = [...(currentCountry.eventHistory ?? []), recordedEvent]

  return { country, event: recordedEvent }
}
