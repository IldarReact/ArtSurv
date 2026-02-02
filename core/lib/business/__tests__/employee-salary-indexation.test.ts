import { describe, it, expect } from 'vitest'

import { getQuarterlyInflatedSalary } from '@/core/lib/calculations/price-helpers'
import type { CountryEconomy } from '@/core/types/economy.types'

describe('Employee Salary Indexation Tests', () => {
  const mockEconomy: CountryEconomy = {
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
    inflation: 2.5,
    inflationHistory: [2.5, 2.3],
    interestRate: 2.0,
    keyRate: 2.0,
    name: 'Test Country',
    salaryModifier: 1.0,
    stockMarketInflation: 0,
    taxRate: 20,
    unemployment: 5.0,
  }

  describe('getQuarterlyInflatedSalary', () => {
    it('должна вернуть базовую зарплату без опыта', () => {
      const baseSalary = 3000
      const result = getQuarterlyInflatedSalary(baseSalary, mockEconomy, 0)

      expect(result).toBe(baseSalary)
    })

    it('должна применить индексацию после 4 кварталов (1 год)', () => {
      const baseSalary = 3000
      const result = getQuarterlyInflatedSalary(baseSalary, mockEconomy, 4)

      expect(result).toBeGreaterThan(baseSalary)
    })

    it('не должна индексировать в течение первого года', () => {
      const baseSalary = 3000
      const result1 = getQuarterlyInflatedSalary(baseSalary, mockEconomy, 1)
      const result2 = getQuarterlyInflatedSalary(baseSalary, mockEconomy, 2)
      const result3 = getQuarterlyInflatedSalary(baseSalary, mockEconomy, 3)

      expect(result1).toBe(baseSalary)
      expect(result2).toBe(baseSalary)
      expect(result3).toBe(baseSalary)
    })
  })
})
