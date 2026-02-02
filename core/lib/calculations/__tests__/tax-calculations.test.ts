import { describe, it, expect } from 'vitest'

import type { CountryEconomy } from '@/core/types/economy.types'
import type { Asset } from '@/core/types/finance.types'

import { calculateQuarterlyTaxes } from '../quarterly/calculate-quarterly-taxes'

describe('calculateQuarterlyTaxes', () => {
  const mockCountry: CountryEconomy = {
    activeEvents: [],
    archetype: 'poor',
    corporateTaxRate: 15,
    costOfLivingModifier: 1,
    gdpGrowth: 0,
    id: 'test',
    inflation: 0,
    interestRate: 0,
    keyRate: 0,
    name: 'Test Country',
    salaryModifier: 1,
    stockMarketInflation: 0,
    taxRate: 10, // 10%
    unemployment: 0,
  }

  it('calculates personal income tax correctly', () => {
    const result = calculateQuarterlyTaxes({
      assets: [],
      country: mockCountry,
      income: 10000,
    })

    expect(result.income).toBe(1000) // 10% of 10000
    expect(result.total).toBe(1000)
  })

  it('calculates property tax correctly', () => {
    const result = calculateQuarterlyTaxes({
      assets: [
        { currentValue: 1000000, id: '1', type: 'housing', value: 1000000 } as unknown as Asset,
      ],
      country: mockCountry,
      income: 0,
    })

    // 0.125% per quarter = 1250
    expect(result.property).toBe(1250)
    expect(result.total).toBe(1250)
  })

  it('sanitizes NaN and undefined values', () => {
    const result = calculateQuarterlyTaxes({
      assets: [{ id: '1', type: 'housing', value: undefined } as unknown as Asset],
      country: { ...mockCountry, taxRate: undefined as unknown as number },
      income: NaN,
    })

    expect(result.income).toBe(0)
    expect(result.property).toBe(0)
    expect(result.total).toBe(0)
  })
})
