import { describe, it, expect } from 'vitest'

import type { Business } from '@/core/types'

import { calculateBusinessFinancials } from '../business-financials'

describe('Business Profitability (Financial Balance)', () => {
  const baseBusiness: Business = {
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
      autoPurchaseAmount: 1000,
      currentStock: 1000,
      maxStock: 5000,
      pricePerUnit: 100,
      purchaseCost: 50,
    },
    isMainBranch: true,
    isServiceBased: false,
    lastQuarterlyUpdate: 0,
    maxEmployees: 5,
    minEmployees: 1,
    monthlyExpenses: 0,
    monthlyIncome: 0,
    name: 'Test Shop',
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
    price: 3, // 1.5x markup (selling price = purchaseCost * (price * MARKUP_FACTOR))
    proposals: [],
    quantity: 1000,
    quarterlyExpenses: 0,
    quarterlyIncome: 0,
    quarterlyTax: 0,
    reputation: 80,
    state: 'active',
    taxRate: 15,
    type: 'retail',
    valuation: 20000,
  }

  it('should be profitable with 1 worker and good efficiency', () => {
    const biz: Business = {
      ...baseBusiness,
      employees: [
        {
          effortPercent: 100,
          experience: 5,
          humanTraits: [],
          id: 'emp1',
          name: 'Worker 1',
          productivity: 80,
          role: 'worker',
          salary: 1500, // Quarterly salary
          skills: { efficiency: 70 },
          stars: 3,
        },
      ],
    }

    const result = calculateBusinessFinancials(biz, true)

    // Debug output if needed: console.log('DEBUG:', result.debug);

    // При цене 3 и purchaseCost 50, sellingPrice = 50 * (3 * 0.5) = 75.
    // Маржа = 75 - 50 = 25 на единицу.
    // Один рабочий (productivity 80) производит 300 * 0.8 = 240 единиц.
    // Валовая прибыль = 240 * 25 = 6000.
    // Расходы: Зарплата (1500) + Налоги на ФОТ (10%) + KPI (+10%) = 1500 * 1.1 * 1.1 = 1815.
    // Постоянные расходы (Rent, Utilities, Fixed) при 1 рабочем и 5 max:
    // capacityFactor = 5 * 0.2 = 1.0, staffingFactor = 1 * 0.8 = 0.8. Total = 1.8.
    // Rent = 100 * 1.8 = 180. Utilities = 20 * 1.8 = 36. Fixed = 100.
    // Итого расходы ≈ 1815 + 180 + 36 + 100 = 2131.
    // Чистая прибыль (EBITDA) = 6000 - 2131 = 3869.
    // После налогов (15%) netProfit ≈ 3288.
    expect(result.netProfit).toBeGreaterThan(0)
  })

  it('should have negative profit if price is too low (below cost)', () => {
    const biz: Business = {
      ...baseBusiness,
      employees: [
        {
          effortPercent: 100,
          experience: 5,
          humanTraits: [],
          id: 'emp1',
          name: 'Worker 1',
          productivity: 80,
          role: 'worker',
          salary: 1500,
          skills: { efficiency: 70 },
          stars: 3,
        },
      ],
      price: 1.5, // 0.75x markup -> sellingPrice = 50 * 0.75 = 37.5 (below cost 50)
    }

    const result = calculateBusinessFinancials(biz, true)
    expect(result.netProfit).toBeLessThan(0)
  })
})
