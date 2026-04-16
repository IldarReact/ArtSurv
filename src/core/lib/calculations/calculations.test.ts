import { describe, it, expect } from 'vitest'

import type { CountryEconomy } from '@/core/types/economy.types'
import type { Player } from '@/core/types/game.types'
import type { Stats } from '@/core/types/stats.types'

import { createEmptyQuarterlyReport } from './financial-helpers'
import { calculateQuarterlyExpenses } from './quarterly/calculate-quarterly-expenses'
import { calculateQuarterlyIncome } from './quarterly/calculate-quarterly-income'
import { calculateQuarterlyTaxes } from './quarterly/calculate-quarterly-taxes'

describe('Quarterly Calculations', () => {
  const baseStats: Stats = {
    energy: 100,
    happiness: 100,
    health: 100,
    intelligence: 100,
    money: 10000,
    sanity: 80,
  }

  const mockPlayer: Player = {
    activeFreelanceGigs: [],
    activeLifestyle: {},
    age: 25,
    assets: [],
    businesses: [],
    businessIdeas: [],
    countryId: 'us',
    creditScore: { value: 650 },
    currentJob: null,

    debts: [],

    freelanceGigs: [],
    gender: 'male',

    happinessMultiplier: 1,

    housingId: 'housing_room',
    id: 'test',

    jobs: [],

    multipliers: {
      happiness: 1,
    },

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
      relations: { colleagues: 50, family: 50, friends: 50 },
      skills: [],
      stats: {
        energy: baseStats.energy,
        happiness: baseStats.happiness,
        health: baseStats.health,
        intelligence: baseStats.intelligence,
        money: baseStats.money,
        sanity: baseStats.sanity,
      },
    },
    quarterlyReport: createEmptyQuarterlyReport(),
    quarterlySalary: 15000, // 5000 * 3
    // ✅ новая статистика
    stats: { ...baseStats },
    traits: [],
  }

  const mockCountry: CountryEconomy = {
    activeEvents: [],
    archetype: 'rich_stable',
    corporateTaxRate: 20, // ✅ НОВОЕ — налог с прибыли бизнеса
    costOfLivingModifier: 1.0,
    gdpGrowth: 2.5,
    id: 'us',
    inflation: 2.0,

    interestRate: 5.0,
    keyRate: 5.0,

    name: 'USA',
    salaryModifier: 1.0,
    stockMarketInflation: 4.0,

    taxRate: 20, // налог с зарплаты
    unemployment: 4.0,
  }

  describe('calculateQuarterlyIncome', () => {
    it('should calculate gross income correctly', () => {
      const result = calculateQuarterlyIncome(mockPlayer)
      expect(result).toBe(15000)
    })
  })

  describe('calculateQuarterlyTaxes', () => {
    it('should calculate tax correctly', () => {
      const income = 15000

      const result = calculateQuarterlyTaxes({
        assets: mockPlayer.assets,
        country: mockCountry,
        income,
      })

      // 15000 * 0.20 = 3000
      expect(result.total).toBe(3000)
    })
  })

  describe('calculateQuarterlyExpenses', () => {
    it('should calculate base living expenses', () => {
      const result = calculateQuarterlyExpenses({
        assets: mockPlayer.assets,
        country: mockCountry,
        personal: mockPlayer.personal,
      })

      // Base 1000 * 3 * 1.0 = 3000
      expect(result).toBe(3000)
    })
  })
})
