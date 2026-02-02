import { describe, expect, it, vi } from 'vitest'

import type { CountryEconomy } from '@/core/types'

import { processInflation } from '../inflation-processor'

// Mocking the engine because it has internal logic we don't need to re-test here
vi.mock('@/core/lib/calculations/inflation-engine', () => ({
  calculateKeyRate: vi.fn((inf: number) => inf + 0.01),
  formatInflationNotification: vi.fn(() => 'Инфляция обновлена'),
  generateYearlyInflation: vi.fn((current: number) => current + 0.02),
  getQuarter: vi.fn((turn: number) => turn % 4 || 4),
  shouldApplyInflationThisTurn: vi.fn((turn: number) => turn % 4 === 0),
}))

describe('inflation-processor', () => {
  const mockCountry: CountryEconomy = {
    activeEvents: [],
    archetype: 'rich_stable',
    corporateTaxRate: 0.2,
    costOfLivingModifier: 1.0,
    gdpGrowth: 0.025,
    id: 'us',
    inflation: 0.03,
    inflationHistory: [0.03, 0.02],
    interestRate: 0.05,
    keyRate: 0.04,
    name: 'USA',
    salaryModifier: 1.0,
    stockMarketInflation: 0.04,
    taxRate: 0.15,
    unemployment: 0.04,
  }

  const countries = { us: mockCountry }

  it('should not apply inflation if not the right turn', () => {
    const result = processInflation(countries, 'us', 1, 2025)
    expect(result.inflationNotification).toBeNull()
    expect(result.updatedCountries.us.inflation).toBe(0.03)
  })

  it('should apply inflation and update history on the right turn', () => {
    const result = processInflation(countries, 'us', 4, 2025)

    expect(result.inflationNotification).not.toBeNull()
    expect(result.updatedCountries.us.inflation).toBeCloseTo(0.05) // 0.03 + 0.02
    expect(result.updatedCountries.us.keyRate).toBeCloseTo(0.06) // 0.05 + 0.01
    expect(result.updatedCountries.us.inflationHistory?.[0]).toBeCloseTo(0.05)
    expect(result.updatedCountries.us.inflationHistory).toHaveLength(3)
    expect(result.notification?.title).toContain('Инфляция')
  })
})
