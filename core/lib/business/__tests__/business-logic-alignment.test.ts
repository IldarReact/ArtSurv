import { describe, it, expect } from 'vitest'

import type { Business, Country } from '@/core/types'

import { calculateBusinessFinancials } from '../business-financials'

describe('Business Logic Alignment (User Feedback & Refactoring)', () => {
  const mockBusiness: Business = {
    autoPurchaseAmount: 0,
    createdAt: 0,
    creationCost: { energy: 0, money: 0 },
    currentValue: 20000,
    description: 'Test',
    efficiency: 100,
    employeeRoles: [],
    employees: [],
    eventsHistory: [],
    foundedTurn: 1,
    hasInsurance: true,
    id: 'test-biz',
    initialCost: 10000,
    insuranceCost: 1000,
    inventory: {
      autoPurchaseAmount: 0,
      currentStock: 100,
      maxStock: 500,
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
    name: 'Test Retail',
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
    playerRoles: { managerialRoles: [], operationalRole: 'worker' },
    price: 5, // 2.5x multiplier
    proposals: [],
    quantity: 100,
    quarterlyExpenses: 0,
    quarterlyIncome: 0,
    quarterlyTax: 0,
    reputation: 50,
    state: 'active',
    taxRate: 20,
    type: 'retail',
    valuation: 20000,
    walletBalance: 0,
  }

  const mockEconomy = {
    archetype: 'rich_stable',
    corporateTaxRate: 15,
    id: 'us',
    inflation: 50, // High inflation to test if it's IGNORED for some fields
    name: 'USA',
  } as unknown as Country

  describe('Simplified Inflation ("3 излишне")', () => {
    it('should NOT apply economy inflation to unit cost', () => {
      const biz = { ...mockBusiness }
      const result = calculateBusinessFinancials(biz, true, [], 1.0, mockEconomy)

      // unitCost should be exactly purchaseCost from inventory, ignoring economy.inflation
      expect(result.debug?.unitCost).toBe(20)
    })

    it('should NOT apply economy inflation to rent and utilities', () => {
      // We need to know baseRentPerEmployee and baseUtilitiesPerEmployee from BUSINESS_BALANCE
      // Assuming they are fixed values from business-balance.json
      const result1 = calculateBusinessFinancials(
        mockBusiness,
        true,
        [],
        1.0,
        undefined as unknown as Country,
      )
      const result2 = calculateBusinessFinancials(mockBusiness, true, [], 1.0, mockEconomy)

      // Expenses breakdown for rent/equipment should be identical despite high inflation
      expect(result1.debug?.expensesBreakdown.rent).toBe(result2.debug?.expensesBreakdown.rent)
      expect(result1.debug?.expensesBreakdown.equipment).toBe(
        result2.debug?.expensesBreakdown.equipment,
      )
    })

    it('should NOT apply economy inflation to insurance cost', () => {
      const result1 = calculateBusinessFinancials(
        mockBusiness,
        true,
        [],
        1.0,
        undefined as unknown as Country,
      )
      const result2 = calculateBusinessFinancials(mockBusiness, true, [], 1.0, mockEconomy)

      expect(result1.debug?.expensesBreakdown.other).toBe(result2.debug?.expensesBreakdown.other)
    })
  })

  describe('NaN Safety & Zero Values', () => {
    it('should handle NaN in employees salary gracefully', () => {
      const bizWithNan: Business = {
        ...mockBusiness,
        employees: [
          {
            experience: 0,
            humanTraits: [],
            id: 'emp-1',
            name: 'NaN Guy',
            productivity: 100,
            role: 'worker',
            salary: NaN, // Dangerous!
            skills: { efficiency: 50 },
            stars: 3,
          },
        ],
      }

      const result = calculateBusinessFinancials(bizWithNan, true)
      expect(result.expenses).toBeGreaterThan(0)
      expect(Number.isNaN(result.expenses)).toBe(false)
    })

    it('should handle zero production quantity gracefully', () => {
      const bizWithZero: Business = {
        ...mockBusiness,
        quantity: 0,
      }

      const result = calculateBusinessFinancials(bizWithZero, true)
      expect(result.debug?.purchaseAmount).toBe(0)
      expect(result.debug?.purchaseCost).toBe(0)
    })
  })

  describe('Elasticity & Demand', () => {
    it('should show demand drop when price is too high', () => {
      const bizNormal = { ...mockBusiness, price: 5 } // 2.5x
      const bizHigh = { ...mockBusiness, price: 10 } // 5.0x

      const resultNormal = calculateBusinessFinancials(bizNormal, true)
      const resultHigh = calculateBusinessFinancials(bizHigh, true)

      expect(resultHigh.debug!.marketDemand).toBeLessThan(resultNormal.debug!.marketDemand)
    })
  })
})
