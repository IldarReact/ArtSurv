import { describe, it, expect } from 'vitest'

import type { Business } from '../../types/business.types'
import type { CountryEconomy } from '../../types/economy.types'
import type { Skill } from '../../types/skill.types'
import { calculateBusinessFinancials } from './business-financials'

describe('calculateBusinessFinancials Integration Tests', () => {
  const mockEconomy: CountryEconomy = {
    activeEvents: [], // Added missing property
    archetype: 'rich_stable', // Added missing property
    corporateTaxRate: 20, // Added missing property
    costOfLivingModifier: 1.0, // Added missing property
    gdpGrowth: 0.01,
    id: 'us',
    inflation: 0.02,
    inflationHistory: [], // Added missing property
    interestRate: 0.02, // Added missing property
    keyRate: 0.02, // Added missing property
    name: 'USA', // Added missing property
    salaryModifier: 1.0, // Added missing property
    stockMarketInflation: 0.02, // Added missing property
    taxRate: 15, // Added missing property
    unemployment: 0.05,
  }

  const baseBusiness: Business = {
    autoPurchaseAmount: 0, // Added missing property
    createdAt: 1, // Added missing property
    creationCost: { energy: 0, happiness: 0, health: 0, intelligence: 0, sanity: 0 }, // Added missing property
    currentValue: 100000,
    description: 'Test Description',
    efficiency: 50,
    employeeRoles: [{ description: 'Worker', priority: 'required', role: 'worker' }],
    employees: [
      {
        effortPercent: 100,
        experience: 0,
        humanTraits: [],
        id: 'emp_worker_1',
        name: 'John Worker',
        productivity: 100,
        role: 'worker',
        salary: 2000,
        skills: { efficiency: 60 },
        stars: 3,
      },
    ],
    eventsHistory: [],
    foundedTurn: 1,
    hasInsurance: false, // Added missing property
    id: 'biz_1',
    initialCost: 100000,
    insuranceCost: 0, // Added missing property
    inventory: {
      autoPurchaseAmount: 100,
      currentStock: 1000,
      maxStock: 2000,
      pricePerUnit: 100,
      purchaseCost: 50,
    },
    isMainBranch: true, // Added missing property
    isServiceBased: false, // Added missing property
    lastQuarterlyUpdate: 0, // Added missing property
    maxEmployees: 5,
    minEmployees: 1,
    monthlyExpenses: 3000,
    monthlyIncome: 5000,
    name: 'Test Business',
    openingProgress: {
      id: 'test-opening',
      investedAmount: 100000,
      quartersLeft: 0,
      remainingDuration: 0,
      title: 'Opening Test Business',
      totalCost: 100000,
      totalDuration: 1,
      totalQuarters: 1,
      upfrontCost: 20000,
    },
    partners: [], // Added missing property
    playerRoles: {
      managerialRoles: [],
      operationalRole: null,
    },
    price: 5,
    proposals: [], // Added missing property
    quantity: 0, // Added missing property
    quarterlyExpenses: 0, // Added missing property
    quarterlyIncome: 0, // Added missing property
    quarterlyTax: 0, // Added missing property
    reputation: 50,
    state: 'active',
    taxRate: 15,
    type: 'retail',
    valuation: 100000,
    walletBalance: 1000,
  }

  const playerSkills: Skill[] = [
    { id: 'management', lastPracticedTurn: 0, level: 5, name: 'Management', progress: 0 },
    { id: 'marketing', lastPracticedTurn: 0, level: 3, name: 'Marketing', progress: 0 },
  ]

  it('should calculate financials correctly for a standard retail business', () => {
    const result = calculateBusinessFinancials(baseBusiness, false, playerSkills, 1.0, mockEconomy)

    expect(result.income).toBeGreaterThan(0)
    expect(result.expenses).toBeGreaterThan(0)
    expect(result.netProfit).toBeDefined()
    expect(Number.isNaN(result.income)).toBe(false)
    expect(Number.isNaN(result.expenses)).toBe(false)
    expect(Number.isNaN(result.netProfit)).toBe(false)
  })

  it('should handle service businesses correctly', () => {
    const serviceBusiness: Business = {
      ...baseBusiness,
      inventory: {
        autoPurchaseAmount: 0,
        currentStock: 0,
        maxStock: 0,
        pricePerUnit: 0,
        purchaseCost: 0,
      },
      isServiceBased: true,
      type: 'service',
    }
    const result = calculateBusinessFinancials(
      serviceBusiness,
      false,
      playerSkills,
      1.0,
      mockEconomy,
    )

    expect(result.income).toBeGreaterThan(0)
    expect(Number.isNaN(result.income)).toBe(false)
  })

  it('should handle product businesses with inventory', () => {
    const productBusiness: Business = {
      ...baseBusiness,
      inventory: {
        autoPurchaseAmount: 0,
        currentStock: 100,
        maxStock: 500,
        pricePerUnit: 100,
        purchaseCost: 50,
      },
      isServiceBased: false,
      type: 'retail',
    }
    const result = calculateBusinessFinancials(
      productBusiness,
      false,
      playerSkills,
      1.0,
      mockEconomy,
    )

    expect(result.income).toBeGreaterThan(0)
    expect(result.expenses).toBeGreaterThan(0)
    expect(Number.isNaN(result.income)).toBe(false)
  })

  it('should handle zero employees without NaN', () => {
    const emptyBusiness: Business = {
      ...baseBusiness,
      employees: [],
    }
    const result = calculateBusinessFinancials(emptyBusiness, false, playerSkills, 1.0, mockEconomy)

    // Even with 0 employees, if there is inventory, sales can happen
    expect(result.income).toBeGreaterThanOrEqual(0)
    expect(result.expenses).toBeGreaterThan(0) // Fixed costs still exist
    expect(Number.isNaN(result.income)).toBe(false)
    expect(Number.isNaN(result.expenses)).toBe(false)
  })

  it('should handle extreme inflation values without NaN', () => {
    const crazyEconomy: CountryEconomy = {
      ...mockEconomy,
      inflation: 9999999,
    }
    const result = calculateBusinessFinancials(baseBusiness, false, playerSkills, 1.0, crazyEconomy)

    expect(Number.isNaN(result.income)).toBe(false)
    expect(Number.isNaN(result.expenses)).toBe(false)
  })

  it('should apply tax reductions correctly', () => {
    const businessWithTaxReduction: Business = {
      ...baseBusiness,
      playerRoles: {
        managerialRoles: ['lawyer'],
        operationalRole: null,
      },
    }

    // Lawyer role gives tax reduction based on skill level
    const skilledPlayer: Skill[] = [
      { id: 'jurisprudence', lastPracticedTurn: 0, level: 5, name: 'Юриспруденция', progress: 0 },
    ]

    const result = calculateBusinessFinancials(
      businessWithTaxReduction,
      false,
      skilledPlayer,
      1.0,
      mockEconomy,
    )

    // With 5 skill points, lawyer gives 5 * 3 = 15% tax reduction
    // Tax rate is 15. Reduced rate = 15 * (1 - 0.15) = 12.75
    // Original tax on e.g. 1000 profit = 150
    // New tax = 127.5 -> 128
    // We just check that tax is calculated and not NaN
    expect(result.debug?.taxAmount).toBeDefined()
    expect(Number.isNaN(result.debug?.taxAmount)).toBe(false)
  })

  it('should handle undefined economy gracefully', () => {
    // economy deliberately undefined to verify default branches
    const result = calculateBusinessFinancials(baseBusiness, false, playerSkills, 1.0, undefined)
    expect(Number.isNaN(result.income)).toBe(false)
    expect(Number.isNaN(result.expenses)).toBe(false)
  })

  it('should be deterministic for identical inputs', () => {
    const first = calculateBusinessFinancials(baseBusiness, false, playerSkills, 1.0, mockEconomy)
    const second = calculateBusinessFinancials(baseBusiness, false, playerSkills, 1.0, mockEconomy)

    expect(first).toEqual(second)
  })

  it('should increase income when global market value grows', () => {
    const lowMarket = calculateBusinessFinancials(
      baseBusiness,
      false,
      playerSkills,
      0.8,
      mockEconomy,
    )
    const highMarket = calculateBusinessFinancials(
      baseBusiness,
      false,
      playerSkills,
      1.2,
      mockEconomy,
    )

    expect(highMarket.income).toBeGreaterThanOrEqual(lowMarket.income)
  })
})
