import { describe, expect, it, vi } from 'vitest'

import type { Player, CountryEconomy, ShopItem } from '@/core/types'

import { processLifestyle } from '../lifestyle-processor'

// Mock shop loader to avoid data dependencies
vi.mock('@/core/lib/data-loaders/shop-loader', () => ({
  getShopItemById: (id: string) => {
    const items: Record<string, ShopItem> = {
      food_homemade: {
        category: 'food',
        costPerTurn: 100,
        id: 'food_homemade',
        isRecurring: true,
      } as ShopItem,
      food_luxury: {
        category: 'food',
        costPerTurn: 500,
        effects: { happiness: 5, health: 2 },
        id: 'food_luxury',
        isRecurring: true,
      } as ShopItem,
      housing_mansion: {
        capacity: 10,
        category: 'housing',
        costPerTurn: 2000,
        effects: { happiness: 10, sanity: 5 },
        id: 'housing_mansion',
        isRecurring: true,
      } as ShopItem,
      transport_public: {
        category: 'transport',
        costPerTurn: 50,
        id: 'transport_public',
        isRecurring: true,
      } as ShopItem,
    }
    return items[id] ?? null
  },
}))

describe('Lifestyle Processor', () => {
  const mockCountry: CountryEconomy = {
    activeEvents: [],
    archetype: 'rich_stable',
    corporateTaxRate: 20,
    costOfLivingModifier: 1.0,
    gdpGrowth: 2.0,
    id: 'us',
    inflation: 2.0,
    interestRate: 5.0,
    keyRate: 5.0,
    name: 'USA',
    salaryModifier: 1.0,
    stockMarketInflation: 5.0,
    taxRate: 15,
    unemployment: 4.0,
  }

  const mockPlayer: Player = {
    activeFreelanceGigs: [],
    activeLifestyle: {
      food: 'food_luxury',
      transport: undefined,
    },
    age: 25,
    assets: [],
    businesses: [],
    businessHistory: [],
    businessIdeas: [],
    countryId: 'us',
    creditScore: 700,
    currentJob: null,
    debts: [],
    freelanceGigs: [],
    gender: 'male',
    happinessMultiplier: 1.0,
    housingId: 'housing_mansion',
    id: 'p1',
    jobs: [],
    name: 'Test Player',
    personal: {
      activeCourses: [],
      activeUniversity: [],
      buffs: [],
      familyMembers: [],
      isDating: false,
      lifeGoals: [],
      potentialPartner: null,
      pregnancy: null,
      relations: {
        colleagues: 50,
        family: 50,
        friends: 50,
      },
      skills: [],
      stats: {
        energy: 100,
        happiness: 80,
        health: 100,
        intelligence: 100,
        money: 100000,
        sanity: 80,
      },
    },
    quarterlyReport: {
      expenses: {
        assetMaintenance: 0,
        business: 0,
        credits: 0,
        debtInterest: 0,
        family: 0,
        food: 0,
        housing: 0,
        living: 0,
        mortgage: 0,
        other: 0,
        total: 0,
        transport: 0,
      },
      income: {
        assetIncome: 0,
        businessRevenue: 0,
        capitalGains: 0,
        familyIncome: 0,
        salary: 0,
        total: 0,
      },
      netProfit: 0,
      taxes: {
        business: 0,
        capital: 0,
        income: 0,
        property: 0,
        total: 0,
      },
      warning: null,
    },
    quarterlySalary: 0,
    stats: {
      energy: 100,
      happiness: 80,
      health: 100,
      intelligence: 100,
      money: 100000,
      sanity: 80,
    },
    traits: [],
  } as Player

  it('should calculate lifestyle expenses and modifiers', () => {
    const result = processLifestyle(mockPlayer, { us: mockCountry })

    expect(result.lifestyleExpenses).toBeGreaterThan(0)
    expect(result.modifiers.happiness).toBe(15) // 5 (food) + 10 (housing)
    expect(result.modifiers.health).toBe(2) // 2 (food)
    expect(result.modifiers.sanity).toBe(5) // 5 (housing)
  })

  it('should apply overcrowding penalty', () => {
    const crowdedPlayer: Player = {
      ...mockPlayer,
      personal: {
        ...mockPlayer.personal,
        familyMembers: new Array(15).fill(null).map((_, i) => ({
          age: 30,
          expenses: 0,
          id: `m${i}`,
          income: 0,
          loyalty: 50,
          name: `Member ${i}`,
          passiveEffects: {},
          relationLevel: 50,
          type: 'friend',
        })), // 16 people total (player + 15 members)
      },
    }
    // capacity is 10. 16/10 = 60% overcrowding.
    // penalty = ceil(60/10) = 6.

    const result = processLifestyle(crowdedPlayer, { us: mockCountry })

    // Base happiness: 15 (from food/housing) - 6 (penalty) = 9
    expect(result.modifiers.happiness).toBe(9)
    // Base sanity: 5 - 6 = -1
    expect(result.modifiers.sanity).toBe(-1)
  })

  it('should update family member expenses', () => {
    const playerWithFamily: Player = {
      ...mockPlayer,
      personal: {
        ...mockPlayer.personal,
        familyMembers: [
          {
            age: 30,
            expenses: 0,
            id: 'm1',
            income: 0,
            loyalty: 100,
            name: 'Member 1',
            passiveEffects: {},
            relationLevel: 100,
            type: 'wife',
          },
        ],
      },
    }

    const result = processLifestyle(playerWithFamily, { us: mockCountry })

    expect(result.updatedFamilyMembers[0].expenses).toBeGreaterThan(0)
    expect(result.lifestyleExpensesBreakdown.total).toBeGreaterThan(0)
  })
})
