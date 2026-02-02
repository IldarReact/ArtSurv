import { describe, it, expect } from 'vitest'

import { generateEmployeeCandidate, calculateSalary } from '@/core/lib/business/employee-generator'
import { getInflatedBaseSalary } from '@/core/lib/calculations/price-helpers'
import type { CountryEconomy } from '@/core/types/economy.types'

describe('Salary Inflation Tests', () => {
  const mockEconomyNoInflation: CountryEconomy = {
    activeEvents: [],
    archetype: 'rich_stable',
    baseSalaries: {
      accountant: 4000,
      manager: 4500,
      marketer: 3500,
      salesperson: 3000,
      technician: 3000,
      worker: 2200,
    },
    corporateTaxRate: 20,
    costOfLivingModifier: 1.0,
    gdpGrowth: 2.0,
    id: 'test',
    inflation: 0,
    inflationHistory: [],
    interestRate: 2.0,
    keyRate: 2.0,
    name: 'Test Country',
    salaryModifier: 1.0,
    stockMarketInflation: 0,
    taxRate: 20,
    unemployment: 5.0,
  }

  const mockEconomyWithInflation: CountryEconomy = {
    ...mockEconomyNoInflation,
    inflation: 2.5,
    inflationHistory: [2.5, 2.3],
  }

  describe('getInflatedBaseSalary', () => {
    it('должна вернуть базовую зарплату без инфляции', () => {
      const baseSalary = 4500
      const result = getInflatedBaseSalary(baseSalary, mockEconomyNoInflation)

      expect(result).toBe(baseSalary)
    })

    it('должна применить инфляцию к базовой зарплате', () => {
      const baseSalary = 4500
      const result = getInflatedBaseSalary(baseSalary, mockEconomyWithInflation)

      expect(result).toBeGreaterThan(baseSalary)
      expect(result).toBeCloseTo(4706, -1)
    })
  })

  describe('calculateSalary', () => {
    it('должна применить инфляцию к зарплате', () => {
      const withoutInflation = calculateSalary('manager', 1, mockEconomyNoInflation)
      const withInflation = calculateSalary('manager', 1, mockEconomyWithInflation)

      expect(withInflation).toBeGreaterThan(withoutInflation)
    })
  })

  describe('generateEmployeeCandidate', () => {
    it('должна генерировать кандидата с инфлированной зарплатой', () => {
      const candidateNoInflation = generateEmployeeCandidate('manager', 1, mockEconomyNoInflation)
      const candidateWithInflation = generateEmployeeCandidate(
        'manager',
        1,
        mockEconomyWithInflation,
      )

      expect(candidateWithInflation.requestedSalary).toBeGreaterThan(
        candidateNoInflation.requestedSalary,
      )
    })
  })

  describe('UI Integration', () => {
    it('зарплата в UI должна отражать инфляцию', () => {
      const candidate = generateEmployeeCandidate('manager', 3, mockEconomyWithInflation)
      const displaySalary = `$${candidate.requestedSalary.toLocaleString()}/мес`

      expect(displaySalary).toMatch(/\$[\d\s,]+\/мес/)
      expect(candidate.requestedSalary).toBeGreaterThan(4500)
    })
  })
})
