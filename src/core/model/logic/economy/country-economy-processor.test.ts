import { describe, expect, it, vi } from 'vitest'

import type { CountryEconomy, EconomicEvent } from '@/core/types'

import { STEPS } from '../turn/turn-step'
import { processCountryEconomy } from './country-economy-processor'

vi.mock('@/core/lib/economic-events/generator', () => ({
  generateEconomicEvent: (turn: number, _currentEconomy: CountryEconomy): EconomicEvent => ({
    description: 'Тестовое событие',
    duration: 1,
    effects: {
      corporateTaxRateChange: 1,
      inflationChange: 2,
      keyRateChange: 3,
      personalTaxRateChange: -1,
      psychologicalStabilityChange: -3,
    },
    id: `event_${String(turn)}`,
    title: 'Тест',
    turn,
    type: 'crisis',
  }),
}))

describe('processCountryEconomy', () => {
  it('runs country economy before every other turn step', () => {
    expect(STEPS[0].name).toBe('economyStep')
  })
  const country: CountryEconomy = {
    activeEvents: [],
    archetype: 'rich_stable',
    corporateTaxRate: 24,
    costOfLivingModifier: 1,
    gdpGrowth: 2,
    id: 'us',
    inflation: 5,
    inflationHistory: [5],
    interestRate: 2,
    keyRate: 2,
    name: 'США',
    psychologicalStability: 50,
    salaryModifier: 1,
    stockMarketInflation: 7.5,
    taxRate: 24,
    unemployment: 4,
  }

  it('applies every quarterly event additively', () => {
    const first = processCountryEconomy(country, 1).country
    const second = processCountryEconomy(first, 2).country

    expect(first.inflation).toBe(7)
    expect(second.inflation).toBe(9)
    expect(first.keyRate).toBe(5)
    expect(second.keyRate).toBe(8)
    expect(first.taxRate).toBe(23)
    expect(second.taxRate).toBe(22)
    expect(first.corporateTaxRate).toBe(25)
    expect(second.corporateTaxRate).toBe(26)
    expect(first.psychologicalStability).toBe(47)
    expect(second.psychologicalStability).toBe(44)
  })

  it('stores only the current event and a quarterly inflation history', () => {
    const result = processCountryEconomy(country, 3)

    expect(result.event?.duration).toBe(1)
    expect(result.country.activeEvents).toHaveLength(1)
    expect(result.country.activeEvents[0].id).toBe('event_3')
    expect(result.country.inflationHistory?.[0]).toBe(7)
  })

  it('clamps tax and key-rate values', () => {
    const result = processCountryEconomy(
      {
        ...country,
        keyRate: 0,
        taxRate: 0,
      },
      4,
    ).country

    expect(result.keyRate).toBe(3)
    expect(result.taxRate).toBe(0)
  })
})
