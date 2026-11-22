import { beforeEach, describe, expect, it, vi } from 'vitest'

import { calculateTaxes } from '@/core/lib/business/financials/tax-calculator'
import { calculateQuarterlyTaxes } from '@/core/lib/calculations/quarterly/calculate-quarterly-taxes'
import { CountryEconomySchema } from '@/core/schemas/economy.schema'
import type { CountryEconomy, EconomicEvent } from '@/core/types'

import { STEPS } from '../turn/turn-step'
import { processCountryEconomy } from './country-economy-processor'

const { generateEconomicEventMock } = vi.hoisted(() => ({
  generateEconomicEventMock: vi.fn(),
}))

vi.mock('@/core/lib/economic-events/generator', () => ({
  generateEconomicEvent: generateEconomicEventMock,
}))

describe('processCountryEconomy', () => {
  const createEvent = (turn: number): EconomicEvent => ({
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
  })

  beforeEach(() => {
    generateEconomicEventMock.mockImplementation((turn: number) => createEvent(turn))
  })

  it('runs country economy before every other turn step', () => {
    expect(STEPS[0].name).toBe('economyStep')
  })

  const country: CountryEconomy = {
    activeEvents: [],
    archetype: 'rich_stable',
    corporateTaxRate: 24,
    costOfLivingModifier: 1,
    eventHistory: [],
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
    expect(first.inflationHistory).toEqual([7])
    expect(second.inflationHistory).toEqual([9])
    expect(first.eventHistory).toHaveLength(1)
    expect(second.eventHistory).toHaveLength(2)
  })

  it('stores event history and only appends inflation history at quarter end', () => {
    const result = processCountryEconomy(country, 3)

    expect(result.event?.duration).toBe(1)
    expect(result.country.activeEvents).toHaveLength(1)
    expect(result.country.activeEvents[0].id).toBe('event_3')
    expect(result.country.eventHistory?.[0].appliedChanges?.inflation).toEqual({
      delta: 2,
      from: 5,
      to: 7,
    })
    expect(result.country.inflationHistory).toEqual([7, 5])
  })

  it('keeps the active event list empty when no event was generated', () => {
    generateEconomicEventMock.mockReturnValueOnce(null)

    const result = processCountryEconomy(country, 2)

    expect(result.event).toBeNull()
    expect(result.country.activeEvents).toEqual([])
    expect(result.country.eventHistory).toEqual([])
  })

  it('routes event tax changes into personal and business tax calculations', () => {
    const result = processCountryEconomy(country, 1).country
    const personalTaxes = calculateQuarterlyTaxes({
      assets: [],
      country: result,
      income: 100,
    })
    const businessTaxes = calculateTaxes(100, result.corporateTaxRate)

    expect(personalTaxes.income).toBe(23)
    expect(businessTaxes.taxAmount).toBe(25)
    expect(result.eventHistory?.[0].appliedChanges?.personalTaxRate).toEqual({
      delta: -1,
      from: 24,
      to: 23,
    })
    expect(result.eventHistory?.[0].appliedChanges?.corporateTaxRate).toEqual({
      delta: 1,
      from: 24,
      to: 25,
    })
    expect(CountryEconomySchema.safeParse(result).success).toBe(true)
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
