import type { EconomicEvent, CountryEconomy } from '@/core/types'

import { ECONOMIC_EVENT_DEFINITIONS, createEconomicEvent } from './definitions'

const HIGH_INFLATION_THRESHOLD = 8
const CRISIS_CHANCE_DURING_INFLATION = 0.3
const LOW_GDP_THRESHOLD = 1
const RECESSION_CHANCE_DURING_LOW_GDP = 0.5
const HIGH_UNEMPLOYMENT_THRESHOLD = 10
const CRISIS_CHANCE_DURING_UNEMPLOYMENT = 0.5
const BOOM_GDP_THRESHOLD = 4
const BOOM_INFLATION_THRESHOLD = 5
const BASE_EVENT_CHANCE = 0.1

function selectEventType(economy: CountryEconomy): keyof typeof ECONOMIC_EVENT_DEFINITIONS {
  const { gdpGrowth, inflation, unemployment } = economy

  if (inflation > HIGH_INFLATION_THRESHOLD) {
    return Math.random() > CRISIS_CHANCE_DURING_INFLATION ? 'rate_hike' : 'crisis'
  }

  if (gdpGrowth < LOW_GDP_THRESHOLD) {
    return Math.random() > RECESSION_CHANCE_DURING_LOW_GDP ? 'recession' : 'rate_cut'
  }

  if (unemployment > HIGH_UNEMPLOYMENT_THRESHOLD) {
    return Math.random() > CRISIS_CHANCE_DURING_UNEMPLOYMENT ? 'crisis' : 'recession'
  }

  if (gdpGrowth > BOOM_GDP_THRESHOLD && inflation < BOOM_INFLATION_THRESHOLD) {
    return 'boom'
  }

  const events = Object.keys(
    ECONOMIC_EVENT_DEFINITIONS,
  ) as (keyof typeof ECONOMIC_EVENT_DEFINITIONS)[]
  return events[Math.floor(Math.random() * events.length)]
}

export function generateEconomicEvent(
  turn: number,
  currentEconomy: CountryEconomy,
): EconomicEvent | null {
  if (Math.random() > BASE_EVENT_CHANCE) return null
  const type = selectEventType(currentEconomy)
  return createEconomicEvent(type, turn)
}
