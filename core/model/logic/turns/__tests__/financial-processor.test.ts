import { describe, expect, it } from 'vitest'

import type { GameStore } from '@/core/model/slices/types'
import type { CountryEconomy, FamilyMember } from '@/core/types'

import { processFinancials } from '../financial-processor'
import type { LifestyleExpensesBreakdown } from '../lifestyle-processor'

describe('Financial Processor', () => {
  const mockCountry: CountryEconomy = {
    activeEvents: [],
    archetype: 'rich_stable',
    corporateTaxRate: 20,
    costOfLivingModifier: 1.0,
    gdpGrowth: 2.5,
    id: 'us',
    inflation: 2.0,
    interestRate: 5.0,
    keyRate: 5.0,
    name: 'USA',
    salaryModifier: 1.0,
    stockMarketInflation: 4.0,
    taxRate: 20,
    unemployment: 4.0,
  }

  const createMockState = (overrides = {}): GameStore =>
    ({
      countries: { us: mockCountry },
      player: {
        assets: [],
        businesses: [],
        debts: [],
        jobs: [],
        personal: {
          familyMembers: [],
          stats: { money: 10000 },
        },
        quarterlySalary: 0,
      } as any,
      ...overrides,
    }) as unknown as GameStore

  it('should return zeros when no player exists', () => {
    const state = { countries: { us: mockCountry }, player: null } as unknown as GameStore
    const result = processFinancials(
      state as unknown as GameStore,
      'us',
      [],
      0,
      {
        credits: 0,
        food: 0,
        housing: 0,
        mortgage: 0,
        other: 0,
        total: 0,
        transport: 0,
      } as LifestyleExpensesBreakdown,
      { totalExpenses: 0, totalIncome: 0, totalTax: 0 },
      0,
    )

    expect(result.netProfit).toBe(0)
    expect(result.familyIncome).toBe(0)
  })

  it('should calculate family income and expenses correctly', () => {
    const state = createMockState()
    const familyMembers: FamilyMember[] = [
      { expenses: 500, id: '1', income: 1000 } as FamilyMember,
      { expenses: 800, id: '2', income: 2000 } as FamilyMember,
    ]

    const result = processFinancials(
      state as unknown as GameStore,
      'us',
      familyMembers,
      0,
      {
        credits: 0,
        food: 0,
        housing: 0,
        mortgage: 0,
        other: 0,
        total: 0,
        transport: 0,
      } as LifestyleExpensesBreakdown,
      { totalExpenses: 0, totalIncome: 0, totalTax: 0 },
      0,
    )

    expect(result.familyIncome).toBe(3000)
    expect(result.familyExpenses).toBe(1300)
  })

  it('should calculate asset income from deposits', () => {
    const state = createMockState({
      player: {
        assets: [
          {
            currentValue: 10000,
            description: 'Savings',
            expenses: 0,
            id: 'dep-1',
            income: 0,
            startedTurn: 1,
            title: 'Savings',
            totalExpenses: 0,
            totalIncome: 0,
            type: 'deposit',
          },
        ],
        businesses: [],
        debts: [],
        jobs: [],
        personal: { familyMembers: [] },
      } as any,
    })

    // keyRate 5%, multiplier 0.7 => 3.5% annual rate
    // quarterly rate = 3.5% / 4 = 0.875%
    // 10000 * 0.00875 = 87.5
    const result = processFinancials(
      state as unknown as GameStore,
      'us',
      [],
      0,
      {
        credits: 0,
        food: 0,
        housing: 0,
        mortgage: 0,
        other: 0,
        total: 0,
        transport: 0,
      } as LifestyleExpensesBreakdown,
      { totalExpenses: 0, totalIncome: 0, totalTax: 0 },
      0,
    )

    expect(result.assetIncome).toBeCloseTo(87.5, 1)
  })

  it('should include business financials in quarterly report', () => {
    const state = createMockState({
      player: {
        assets: [],
        businesses: [{ id: 'biz1' }], // Mark as business owner
        debts: [],
        jobs: [],
        personal: { familyMembers: [] },
      },
    })

    const businessResult = {
      totalExpenses: 5000,
      totalIncome: 10000,
      totalTax: 1000,
    }

    const result = processFinancials(
      state,
      'us',
      [],
      0,
      {
        credits: 0,
        food: 0,
        housing: 0,
        mortgage: 0,
        other: 0,
        total: 0,
        transport: 0,
      } as LifestyleExpensesBreakdown,
      businessResult,
      0,
    )

    expect(result.quarterlyReport.income.businessRevenue).toBe(10000)
    expect(result.quarterlyReport.expenses.business).toBe(5000)
    expect(result.quarterlyReport.taxes.business).toBe(1000)
  })

  it('should apply buff income modifier', () => {
    const state = createMockState({
      player: {
        assets: [],
        businesses: [],
        debts: [],
        jobs: [{ salary: 1000 }], // Employee
        personal: { familyMembers: [] },
      },
    })

    // Without buff: 1000 * 3 months = 3000
    // With 10% buff: 3000 * 1.1 = 3300
    const result = processFinancials(
      state,
      'us',
      [],
      0,
      {
        credits: 0,
        food: 0,
        housing: 0,
        mortgage: 0,
        other: 0,
        total: 0,
        transport: 0,
      } as LifestyleExpensesBreakdown,
      { totalExpenses: 0, totalIncome: 0, totalTax: 0 },
      10, // 10% buff
    )

    expect(result.quarterlyReport.income.salary).toBeCloseTo(3300)
  })
})
