import { describe, it, expect } from 'vitest'

import type { Business } from '@/core/types'

import { calculateBusinessFinancials } from '../business-financials'

describe('Business Comprehensive Financials', () => {
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
    hasInsurance: false,
    id: 'test-biz',
    initialCost: 10000,
    insuranceCost: 0,
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

  describe('Price Scaling (10 = 5x)', () => {
    it('should apply 5x multiplier when price level is 10', () => {
      const biz = {
        ...mockBusiness,
        inventory: { ...mockBusiness.inventory, purchaseCost: 100 },
        price: 10,
      }
      const result = calculateBusinessFinancials(biz, true)
      // Multiplier = 10 * 0.5 = 5.0
      // sellingPrice = 100 * 5.0 = 500
      expect(result.debug?.priceUsed).toBe(500)
    })

    it('should apply 0.5x multiplier when price level is 1', () => {
      const biz = {
        ...mockBusiness,
        inventory: { ...mockBusiness.inventory, purchaseCost: 100 },
        price: 1,
      }
      const result = calculateBusinessFinancials(biz, true)
      // Multiplier = 1 * 0.5 = 0.5
      // sellingPrice = 100 * 0.5 = 50
      expect(result.debug?.priceUsed).toBe(50)
    })
  })

  describe('Lifecycle Management', () => {
    it('should return zero income and limited expenses when frozen', () => {
      const frozenBiz = { ...mockBusiness, quarterlyExpenses: 500, state: 'frozen' as const }
      const result = calculateBusinessFinancials(frozenBiz)

      expect(result.income).toBe(0)
      expect(result.expenses).toBe(500)
      expect(result.profit).toBe(-500)
    })
  })

  describe('Financial Synchronization', () => {
    it('should provide a correct expenses breakdown for UI', () => {
      const result = calculateBusinessFinancials(mockBusiness, true)
      const breakdown = result.debug?.expensesBreakdown

      expect(breakdown).toBeDefined()
      // baseRentPerEmployee (100) * effectiveScalingCount (maxEmp * 0.2 + actualStaff * 0.8)
      // 100 * (5 * 0.2 + 0 * 0.8) = 100
      expect(breakdown?.rent).toBe(100)
      // baseUtilitiesPerEmployee (20) * effectiveScalingCount (1) = 20
      expect(breakdown?.equipment).toBe(20)
    })
  })
})
