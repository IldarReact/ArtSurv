import { describe, expect, it, vi } from 'vitest'

import type { Business, Skill, SkillLevel } from '@/core/types'

import { processBusinessTurn } from '../business-turn-processor'

describe('business-turn-processor', () => {
  const mockSkill: Skill = {
    experience: 0,
    id: 'Management',
    isBeingUsedAtWork: false,
    lastPracticedTurn: 0,
    level: 1 as SkillLevel,
    name: 'Management',
    progress: 0,
  } as Skill

  const createMockBusiness = (
    id: string,
    state: 'active' | 'frozen' | 'opening' = 'active',
  ): Business =>
    ({
      autoPurchaseAmount: 0,
      createdAt: 0,
      creationCost: { energy: 10, money: 1000 },
      currentValue: 12000,
      efficiency: 100,
      employeeRoles: [],
      employees: [],
      eventsHistory: [],
      foundedTurn: 1,
      hasInsurance: false,
      id,
      imageUrl: '',
      initialCost: 10000,
      insuranceCost: 0,
      inventory: { currentStock: 0, maxStock: 1000, stockPrice: 10 },
      isMainBranch: true,
      isServiceBased: false,
      lastQuarterlyUpdate: 0,
      management: {
        autoRestock: false,
        marketingBudget: 0,
        priceMarkup: 50,
        qualityFocus: 50,
      },
      maxEmployees: 10,
      metrics: {
        customerSatisfaction: 80,
        lastQuarterIncome: 0,
        marketShare: 5,
        monthlyRevenue: 0,
      },
      minEmployees: 1,
      monthlyExpenses: 2000,
      monthlyIncome: 5000,
      name: 'Test Business',
      openingProgress: {
        id: 'op-' + id,
        investedAmount: 0,
        remainingDuration: 0,
        title: 'Opening',
        totalCost: 10000,
        totalDuration: 6,
        upfrontCost: 2000,
      },
      ownerId: 'player',
      partners: [],
      playerRoles: { managerialRoles: [], operationalRole: 'worker' },
      playerShare: 100,
      price: 5,
      proposals: [],
      quantity: 100,
      quarterlyExpenses: 0,
      quarterlyIncome: 0,
      quarterlyTax: 0,
      reputation: 80,
      state,
      taxRate: 20,
      type: 'retail',
      valuation: 12000,
      walletBalance: 0,
    }) as unknown as Business

  it('should process active business financials correctly', () => {
    const biz = createMockBusiness('biz-1')
    const result = processBusinessTurn([biz], [mockSkill], 1, 2025)

    expect(result.updatedBusinesses).toHaveLength(1)
    expect(result.totalIncome).toBeGreaterThan(0)
    expect(result.updatedBusinesses[0].lastQuarterSummary).toBeDefined()
  })

  it('should handle opening state by progressing opening progress', () => {
    const biz = createMockBusiness('biz-opening', 'opening')
    if (biz.openingProgress) {
      biz.openingProgress.remainingDuration = 6
    }

    const result = processBusinessTurn([biz], [mockSkill], 1, 2025)

    expect(result.updatedBusinesses[0].state).toBe('opening')
    // processProgress уменьшает на квартал (3 месяца)
    expect(result.updatedBusinesses[0].openingProgress?.remainingDuration).toBe(3)
  })

  it('should handle frozen state with minimal expenses', () => {
    const biz = createMockBusiness('biz-frozen', 'frozen')
    biz.quarterlyExpenses = 500

    const result = processBusinessTurn([biz], [mockSkill], 1, 2025)

    expect(result.totalIncome).toBe(0)
    expect(result.totalExpenses).toBe(500)
    expect(result.updatedBusinesses[0].state).toBe('frozen')
  })

  it('should apply player share to totals', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5)

    const biz = createMockBusiness('biz-share')
    biz.playerShare = 50 // 50% share

    const resultFull = processBusinessTurn([createMockBusiness('biz-full')], [mockSkill], 1, 2025)
    const resultHalf = processBusinessTurn([biz], [mockSkill], 1, 2025)

    // С фиксированным random результаты должны быть точно пропорциональны
    expect(resultHalf.totalIncome).toBeLessThan(resultFull.totalIncome)
    expect(resultHalf.totalIncome).toBeGreaterThan(0)

    const expectedHalf = Math.round(resultFull.totalIncome * 0.5)
    expect(resultHalf.totalIncome).toBe(expectedHalf)

    randomSpy.mockRestore()
  })
})
