import { describe, it, expect } from 'vitest'

import { getInflatedBaseSalary } from '@/core/lib/calculations/price-helpers'
import { getFreelanceGigs } from '@/core/lib/data-loaders/freelance-loader'
import type { CountryEconomy } from '@/core/types/economy.types'

describe('Freelance Payment Inflation Tests', () => {
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

  describe('getInflatedBaseSalary для фриланса', () => {
    it('должна вернуть базовую оплату без инфляции', () => {
      const basePayment = 18000
      const result = getInflatedBaseSalary(basePayment, mockEconomyNoInflation)

      expect(result).toBe(basePayment)
    })

    it('должна применить инфляцию к оплате фриланса', () => {
      const basePayment = 18000
      const result = getInflatedBaseSalary(basePayment, mockEconomyWithInflation)

      expect(result).toBeGreaterThan(basePayment)
      // Категория 'salaries' имеет multiplier 0.95
      expect(result).toBeCloseTo(18830, -2)
    })
  })

  describe('Загрузка фриланс проектов', () => {
    it('должна загрузить проекты для US', () => {
      const gigs = getFreelanceGigs('us')

      expect(gigs.length).toBeGreaterThan(0)
      expect(gigs[0]).toHaveProperty('id')
      expect(gigs[0]).toHaveProperty('title')
      expect(gigs[0]).toHaveProperty('payment')
    })

    it('все проекты должны иметь корректную структуру', () => {
      const gigs = getFreelanceGigs('us')

      gigs.forEach((gig) => {
        expect(typeof gig.payment).toBe('number')
        expect(gig.payment).toBeGreaterThan(0)
        expect(gig.cost).toBeDefined()
        expect(Array.isArray(gig.requirements)).toBe(true)
      })
    })
  })

  describe('Реалистичность оплаты с инфляцией', () => {
    it('iOS приложение должно расти реалистично', () => {
      const basePayment = 18000
      const inflated = getInflatedBaseSalary(basePayment, mockEconomyWithInflation)

      const growthPercent = ((inflated - basePayment) / basePayment) * 100
      expect(growthPercent).toBeGreaterThan(4)
      expect(growthPercent).toBeLessThan(6)
    })

    it('Shopify магазин должен расти пропорционально', () => {
      const basePayment = 10000
      const inflated = getInflatedBaseSalary(basePayment, mockEconomyWithInflation)

      const growthPercent = ((inflated - basePayment) / basePayment) * 100
      expect(growthPercent).toBeGreaterThan(4)
      expect(growthPercent).toBeLessThan(6)
    })
  })
})
