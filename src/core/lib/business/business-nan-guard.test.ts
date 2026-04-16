import { describe, it, expect } from 'vitest'

import type { Business, Employee } from '../../types/business.types'
import type { CountryEconomy } from '../../types/economy.types'
import { getInflatedPrice, getInflatedSalary } from '../calculations/price-helpers'
import { calculateBusinessFinancials } from './business-financials'

describe('Business Financials NaN Guards', () => {
  // Base mock business generator
  const createMockBusiness = (overrides: Partial<Business> = {}): Business => ({
    autoPurchaseAmount: 0,
    createdAt: 0,
    creationCost: { energy: 0, money: 0 },
    currentValue: 10000,
    description: 'Test',
    efficiency: 50,
    employeeRoles: [],
    employees: [],
    eventsHistory: [],
    foundedTurn: 1,
    hasInsurance: false,
    id: 'test-biz',
    initialCost: 10000,
    insuranceCost: 0,
    inventory: {
      autoPurchaseAmount: 0,
      currentStock: 1000,
      maxStock: 1000,
      pricePerUnit: 50,
      purchaseCost: 20,
    },
    isMainBranch: true,
    isServiceBased: false,
    lastQuarterlyUpdate: 0,
    maxEmployees: 5,
    minEmployees: 1,
    monthlyExpenses: 0,
    monthlyIncome: 0,
    name: 'Test Business',
    networkId: undefined,
    openingProgress: {
      id: 'test-opening',
      investedAmount: 0,
      quartersLeft: 0,
      remainingDuration: 0,
      title: 'Opening Test Business',
      totalCost: 0,
      totalDuration: 0,
      totalQuarters: 0,
      upfrontCost: 0,
    },
    partners: [],
    playerRoles: { managerialRoles: [], operationalRole: null },
    price: 5,
    proposals: [],
    quantity: 100,
    quarterlyExpenses: 0,
    quarterlyIncome: 0,
    quarterlyTax: 0,
    reputation: 50,
    state: 'active',
    taxRate: 20,
    type: 'retail',
    valuation: 10000,
    ...overrides,
  })

  describe('Service Business Resilience', () => {
    it('should handle NaN price', () => {
      const business = createMockBusiness({
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 0,
          maxStock: 0,
          pricePerUnit: 0,
          purchaseCost: 0,
        },
        isServiceBased: true,
        price: NaN,
      })
      const result = calculateBusinessFinancials(business, false)

      expect(result.income).not.toBeNaN()
      expect(result.income).toBeGreaterThanOrEqual(0)
    })

    it('should handle undefined price', () => {
      const business = createMockBusiness({
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 0,
          maxStock: 0,
          pricePerUnit: 0,
          purchaseCost: 0,
        },
        isServiceBased: true,
        price: undefined as unknown as number,
      })
      const result = calculateBusinessFinancials(business, false)

      expect(result.income).not.toBeNaN()
    })

    it('should handle NaN efficiency and reputation', () => {
      const business = createMockBusiness({
        efficiency: NaN,
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 0,
          maxStock: 0,
          pricePerUnit: 0,
          purchaseCost: 0,
        },
        isServiceBased: true,
        reputation: NaN,
      })
      const result = calculateBusinessFinancials(business, false)

      expect(result.income).not.toBeNaN()
      expect(result.income).toBe(0) // 0 efficiency usually means 0 demand
    })

    it('should handle NaN global market value', () => {
      const business = createMockBusiness({
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 0,
          maxStock: 0,
          pricePerUnit: 0,
          purchaseCost: 0,
        },
        isServiceBased: true,
      })
      const result = calculateBusinessFinancials(business, false, undefined, NaN)

      expect(result.income).not.toBeNaN()
    })
  })

  describe('Product Business Resilience', () => {
    it('should handle NaN inventory prices', () => {
      const business = createMockBusiness({
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 100,
          maxStock: 1000,
          pricePerUnit: NaN,
          purchaseCost: NaN,
        },
        isServiceBased: false,
      })
      const result = calculateBusinessFinancials(business, false)

      expect(result.income).not.toBeNaN()
      expect(result.expenses).not.toBeNaN()
      expect(result.profit).not.toBeNaN()
      // Should default to safe values (price 100, cost 50)
      expect(result.debug?.priceUsed).toBe(100)
    })

    it('should handle NaN current stock', () => {
      const business = createMockBusiness({
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: NaN,
          maxStock: 1000,
          pricePerUnit: 50,
          purchaseCost: 20,
        },
        isServiceBased: false,
      })
      const result = calculateBusinessFinancials(business, false)

      expect(result.income).not.toBeNaN()
      expect(result.newInventory.currentStock).not.toBeNaN()
    })

    it('should handle zero price (infinite margin percentage protection)', () => {
      const business = createMockBusiness({
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 100,
          maxStock: 1000,
          pricePerUnit: 0,
          purchaseCost: 20,
        },
        isServiceBased: false,
        price: 0,
      })
      const result = calculateBusinessFinancials(business, false)

      expect(result.income).not.toBeNaN() // Sales income 0
      expect(result.income).toBe(0)
    })
  })

  describe('Employee and Tax Resilience', () => {
    it('should handle employees with NaN salary', () => {
      const emp: Employee = {
        experience: 1,
        humanTraits: [],
        id: 'e1',
        name: 'Test',
        productivity: 100,
        role: 'worker',
        salary: NaN,
        skills: { efficiency: 50 },
        stars: 3,
      }
      const business = createMockBusiness({
        employees: [emp],
      })
      const result = calculateBusinessFinancials(business, true)

      expect(result.expenses).not.toBeNaN()
    })

    it('should handle NaN tax rate', () => {
      const business = createMockBusiness({
        taxRate: NaN,
      })
      const result = calculateBusinessFinancials(business, true)

      expect(result.netProfit).not.toBeNaN()
    })
  })

  describe('Inflation and Price Helpers Resilience', () => {
    const mockEconomy: CountryEconomy = {
      activeEvents: [],
      archetype: 'rich_stable',
      corporateTaxRate: 0.2,
      costOfLivingModifier: 1.0,
      gdpGrowth: 0.02,
      id: 'us',
      inflation: 2.5,
      inflationHistory: [2.5, 3.0, 2.8],
      interestRate: 0.05,
      keyRate: 0.05,
      name: 'USA',
      salaryModifier: 1.0,
      stockMarketInflation: 0.03,
      taxRate: 0.2,
      unemployment: 0.05,
    }

    it('should handle NaN in inflation history', () => {
      const economyWithNaN = {
        ...mockEconomy,
        inflationHistory: [2.5, NaN, 3.0],
      }
      const price = getInflatedPrice(100, economyWithNaN, 'default')
      expect(price).not.toBeNaN()
      expect(price).toBeGreaterThan(0)
    })

    it('should handle NaN base salary in getInflatedSalary', () => {
      const salary = getInflatedSalary(NaN, mockEconomy, 4)
      expect(salary).not.toBeNaN()
    })

    it('should handle NaN base price in getInflatedPrice', () => {
      const price = getInflatedPrice(NaN, mockEconomy, 'default')
      expect(price).not.toBeNaN()
    })
  })
})
