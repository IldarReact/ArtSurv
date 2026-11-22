import { TEST_COUNTRY_ID } from '@/core/lib/data-loaders/economy-loader'
import type { CountryEconomy, EconomicEvent, EconomicEventType } from '@/core/types'

import { ECONOMIC_EVENT_DEFINITIONS, createEconomicEvent } from './definitions'

const EVENT_PROBABILITY = 0.3
const HIGH_INFLATION_THRESHOLD = 8
const LOW_GDP_THRESHOLD = 1
const HIGH_UNEMPLOYMENT_THRESHOLD = 10
const BOOM_GDP_THRESHOLD = 4
const BOOM_INFLATION_THRESHOLD = 5

function selectEventType(economy: CountryEconomy): EconomicEventType[] {
  const { gdpGrowth, inflation, unemployment } = economy

  if (inflation > HIGH_INFLATION_THRESHOLD) {
    return ['rate_hike', 'crisis']
  }

  if (gdpGrowth < LOW_GDP_THRESHOLD) {
    return ['recession', 'rate_cut']
  }

  if (unemployment > HIGH_UNEMPLOYMENT_THRESHOLD) {
    return ['crisis', 'recession']
  }

  if (gdpGrowth > BOOM_GDP_THRESHOLD && inflation < BOOM_INFLATION_THRESHOLD) {
    return ['boom']
  }

  return ECONOMIC_EVENT_DEFINITIONS.map((event) => event.type)
}

export function generateEconomicEvent(
  turn: number,
  currentEconomy: CountryEconomy,
): EconomicEvent | null {
  if (currentEconomy.id !== TEST_COUNTRY_ID || Math.random() >= EVENT_PROBABILITY) {
    return null
  }

  const candidateTypes = selectEventType(currentEconomy)
  const matchingDefinitions = ECONOMIC_EVENT_DEFINITIONS.filter((event) =>
    candidateTypes.includes(event.type),
  )

  if (matchingDefinitions.length === 0) {
    throw new Error(`No economic event definitions match country ${currentEconomy.id}`)
  }

  const selected = matchingDefinitions[Math.floor(Math.random() * matchingDefinitions.length)]
  return createEconomicEvent(selected.type, turn)
}
