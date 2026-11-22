import { afterEach, describe, expect, it, vi } from 'vitest'

import type { CountryEconomy } from '@/core/types'

import { ECONOMIC_EVENT_DEFINITIONS } from './definitions'
import { generateEconomicEvent } from './generator'

const economy: CountryEconomy = {
  activeEvents: [],
  archetype: 'rich_stable',
  corporateTaxRate: 24,
  costOfLivingModifier: 1.6,
  eventHistory: [],
  gdpGrowth: 2.4,
  id: 'us',
  inflation: 2.5,
  inflationHistory: [2.5],
  interestRate: 5.33,
  keyRate: 5.33,
  name: 'США',
  salaryModifier: 1.8,
  stockMarketInflation: 7.5,
  taxRate: 24,
  unemployment: 4.1,
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('country economic event definitions', () => {
  it('loads validated event cards from country JSON, including a tax reform', () => {
    const taxReform = ECONOMIC_EVENT_DEFINITIONS.find((event) => event.type === 'tax_reform')

    expect(taxReform?.effects.personalTaxRateChange).toBe(1)
    expect(taxReform?.effects.corporateTaxRateChange).toBe(-2)
  })

  it('returns no event when the quarterly event roll misses', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)

    expect(generateEconomicEvent(2, economy)).toBeNull()
  })

  it('does not generate country events outside the configured USA test scope', () => {
    expect(generateEconomicEvent(2, { ...economy, id: 'germany' })).toBeNull()
  })

  it('selects and creates the matching JSON-backed event card', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(0.99)

    const event = generateEconomicEvent(7, economy)

    expect(event?.type).toBe('tax_reform')
    expect(event?.id).toBe('event_7_tax_reform')
    expect(event?.turn).toBe(7)
  })
})
