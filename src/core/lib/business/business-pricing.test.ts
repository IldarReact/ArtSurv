import { describe, it, expect } from 'vitest'

import type { Business, Employee } from '@/core/types'

import { calculateBusinessFinancials } from './business-utils'

describe('Business Pricing & Market Tests', () => {
  const createBaseBusiness = (overrides?: Partial<Business>): Business => ({
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

  const createMockEmployee = (role: Employee['role'], stars: Employee['stars'] = 3): Employee => ({
    experience: 4,
    humanTraits: [],
    id: `emp-${role}`,
    name: 'Test Employee',
    productivity: 100,
    role,
    salary: 1000,
    skills: {
      efficiency: 50,
    },
    stars,
  })

  describe('Price Impact on Demand', () => {
    it('should decrease demand when price increases', () => {
      const worker = createMockEmployee('worker')

      const lowPriceBusiness = createBaseBusiness({
        employees: [worker],
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 30, // Low price
          purchaseCost: 20,
        },
        price: 3,
      })

      const highPriceBusiness = createBaseBusiness({
        employees: [worker],
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 80, // High price
          purchaseCost: 20,
        },
        price: 8,
      })

      const lowPriceResult = calculateBusinessFinancials(lowPriceBusiness, true, undefined, 1.0)
      const highPriceResult = calculateBusinessFinancials(highPriceBusiness, true, undefined, 1.0)

      // Lower price should result in higher income (more sales)
      expect(lowPriceResult.income).toBeGreaterThan(highPriceResult.income)
    })

    it('should handle minimum price (1)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
        price: 1,
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)
      expect(result.income).toBeGreaterThan(0)
    })

    it('should handle maximum price (10)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
        price: 10,
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)
      expect(result.income).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Global Market Impact', () => {
    it('should increase income during market boom (value > 1.0)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
      })

      const normalMarket = calculateBusinessFinancials(business, true, undefined, 1.0)
      const boomMarket = calculateBusinessFinancials(business, true, undefined, 1.5)

      // Boom market should increase income
      expect(boomMarket.income).toBeGreaterThan(normalMarket.income)
    })

    it('should decrease income during market crisis (value < 1.0)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
      })

      const normalMarket = calculateBusinessFinancials(business, true, undefined, 1.0)
      const crisisMarket = calculateBusinessFinancials(business, true, undefined, 0.7)

      // Crisis market should decrease income
      expect(crisisMarket.income).toBeLessThan(normalMarket.income)
    })

    it('should handle extreme market collapse (value = 0.3)', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
      })

      const result = calculateBusinessFinancials(business, true, undefined, 0.3)

      // Should still calculate without errors
      expect(result.income).toBeGreaterThanOrEqual(0)
      expect(result.expenses).toBeGreaterThan(0)
    })
  })

  describe('Quantity Management', () => {
    it('should use quantity as target stock level', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 50,
          purchaseCost: 20,
        },
        quantity: 500, // Target 500 units
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)

      // Should calculate purchase based on target quantity
      expect(result.newInventory).toBeDefined()
    })

    it('should not affect service-based businesses', () => {
      const worker = createMockEmployee('worker')
      const serviceBusiness = createBaseBusiness({
        employees: [worker],
        isServiceBased: true,
        playerRoles: { managerialRoles: ['manager'], operationalRole: null },
        quantity: 0,
      })

      const result = calculateBusinessFinancials(serviceBusiness, true, undefined, 1.0)

      // Service business should not have inventory changes
      expect(result.income).toBeGreaterThan(0)
    })
  })

  describe('Tax Calculation', () => {
    it('should apply taxes to gross profit', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
        taxRate: 0.2, // 20% tax
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)

      // Taxes should be included in expenses
      expect(result.expenses).toBeGreaterThan(0)
    })

    it('should reduce taxes with accountant', () => {
      const worker = createMockEmployee('worker')
      const accountant = createMockEmployee('accountant', 5)

      const businessWithoutAccountant = createBaseBusiness({
        employees: [worker],
        taxRate: 0.2,
      })

      const businessWithAccountant = createBaseBusiness({
        employees: [worker, accountant],
        taxRate: 0.2,
      })

      const withoutResult = calculateBusinessFinancials(
        businessWithoutAccountant,
        true,
        undefined,
        1.0,
      )
      const withResult = calculateBusinessFinancials(businessWithAccountant, true, undefined, 1.0)

      const withoutTax = withoutResult.debug?.taxAmount ?? 0
      const withTax = withResult.debug?.taxAmount ?? 0
      expect(withTax).toBeLessThanOrEqual(withoutTax)
    })

    it('should reduce taxes when player acts as accountant (by skill)', () => {
      const worker = createMockEmployee('worker')

      const baseBusiness = createBaseBusiness({
        employees: [worker],
        playerRoles: { managerialRoles: [], operationalRole: null },
        taxRate: 0.2,
      })

      const playerAccountantBusiness = createBaseBusiness({
        employees: [worker],
        playerRoles: { managerialRoles: ['accountant'], operationalRole: null },
        taxRate: 0.2,
      })

      const control = calculateBusinessFinancials(baseBusiness, true, [], 1.0)
      const withPlayerAcc = calculateBusinessFinancials(
        playerAccountantBusiness,
        true,
        [
          {
            id: 'skill_accounting',
            lastPracticedTurn: 0,
            level: 4,
            name: 'Бухгалтерия',
            progress: 0,
          },
        ],
        1.0,
      )

      const taxControl = control.debug?.taxAmount ?? 0
      const taxWithPlayerAcc = withPlayerAcc.debug?.taxAmount ?? 0
      expect(taxWithPlayerAcc).toBeLessThanOrEqual(taxControl)
      expect(withPlayerAcc.netProfit).toBeGreaterThanOrEqual(control.netProfit)
    })
  })

  describe('Combined Effects', () => {
    it('should handle price + market + quantity together', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
        price: 7,
        quantity: 300,
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.2)

      expect(result.income).toBeGreaterThanOrEqual(0)
      expect(result.expenses).toBeGreaterThan(0)
      expect(result.profit).toBeDefined()
      expect(result.newInventory).toBeDefined()
    })

    it('should maintain inventory correctly over time', () => {
      const worker = createMockEmployee('worker')
      const business = createBaseBusiness({
        employees: [worker],
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 500,
          maxStock: 1000,
          pricePerUnit: 50,
          purchaseCost: 20,
        },
      })

      const result = calculateBusinessFinancials(business, true, undefined, 1.0)

      // New inventory should be calculated
      expect(result.newInventory.currentStock).toBeGreaterThanOrEqual(0)
      expect(result.newInventory.currentStock).toBeLessThanOrEqual(1000)
    })
  })

  describe('Crisis Demand vs Margin', () => {
    it('cheap goods should outperform luxury in crisis', () => {
      const worker = createMockEmployee('worker')
      const lowMarginBusiness = createBaseBusiness({
        employees: [worker],
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 26,
          purchaseCost: 20,
        },
        price: 2, // Low price slider
      })
      const highMarginBusiness = createBaseBusiness({
        employees: [worker],
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 80,
          purchaseCost: 20,
        },
        price: 8, // High price slider
      })

      const crisisValue = 0.7
      const lowMarginResult = calculateBusinessFinancials(
        lowMarginBusiness,
        true,
        undefined,
        crisisValue,
      )
      const highMarginResult = calculateBusinessFinancials(
        highMarginBusiness,
        true,
        undefined,
        crisisValue,
      )

      expect(lowMarginResult.income).toBeGreaterThan(highMarginResult.income)
    })
    it('cheap goods demand should be resilient in crisis vs normal', () => {
      const worker = createMockEmployee('worker')
      const lowMarginBusiness = createBaseBusiness({
        employees: [worker],
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 26,
          purchaseCost: 20,
        },
        price: 1, // Minimum price slider
      })
      const normal = calculateBusinessFinancials(lowMarginBusiness, true, undefined, 1.0)
      const crisis = calculateBusinessFinancials(lowMarginBusiness, true, undefined, 0.7)
      expect(crisis.income).toBeGreaterThan(normal.income * 0.7) // Resilient: better than market drop (0.7)
    })
    it('luxury goods income should drop in crisis vs normal', () => {
      const worker = createMockEmployee('worker')
      const highMarginBusiness = createBaseBusiness({
        employees: [worker],
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 80,
          purchaseCost: 20,
        },
      })
      const normal = calculateBusinessFinancials(highMarginBusiness, true, undefined, 1.0)
      const crisis = calculateBusinessFinancials(highMarginBusiness, true, undefined, 0.7)
      expect(crisis.income).toBeLessThanOrEqual(normal.income)
    })
  })

  describe('Workers-based demand', () => {
    it('income grows with more workers for product businesses', () => {
      const worker = createMockEmployee('worker')

      const noWorkersBiz = createBaseBusiness({
        employees: [],
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 50,
          purchaseCost: 20,
        },
      })
      const twoWorkersBiz = createBaseBusiness({
        employees: [worker, { ...worker, id: 'emp-worker-2' }],
        inventory: {
          autoPurchaseAmount: 0,
          currentStock: 1000,
          maxStock: 1000,
          pricePerUnit: 50,
          purchaseCost: 20,
        },
      })

      const res0 = calculateBusinessFinancials(noWorkersBiz, true, undefined, 1.0)
      const res2 = calculateBusinessFinancials(twoWorkersBiz, true, undefined, 1.0)

      expect(res2.income).toBeGreaterThan(res0.income)
    })
  })
})
