import { describe, it, expect } from 'vitest'

import type { Player } from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'

import {
  calculateCreditLimit,
  getLoanInterestRate,
  getDepositInterestRate,
} from '../lib/bank-rules'

describe('Bank Rules', () => {
  const mockCountry: CountryEconomy = {
    activeEvents: [],
    archetype: 'rich_stable',
    corporateTaxRate: 0.1,
    costOfLivingModifier: 1,
    gdpGrowth: 0.02,
    id: 'us',
    inflation: 2,
    interestRate: 5,
    keyRate: 5,
    name: 'USA',
    salaryModifier: 1,
    stockMarketInflation: 0.05,
    taxRate: 0.1,
    unemployment: 0.05,
  }

  const mockPlayer: Player = {
    activeFreelanceGigs: [],
    activeLifestyle: {},
    age: 25,
    assets: [],
    businesses: [],
    businessIdeas: [],
    countryId: 'us',
    creditScore: 600,
    currentJob: null,
    debts: [],
    freelanceGigs: [],
    gender: 'male',
    happinessMultiplier: 1,
    housingId: 'h1',
    id: 'p1',
    jobs: [],
    name: 'Test',
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
        happiness: 100,
        health: 100,
        intelligence: 100,
        money: 1000,
        sanity: 100,
      },
    },
    quarterlyReport: {
      expenses: {
        assetMaintenance: 0,
        business: 0,
        credits: 0,
        debtInterest: 0,
        family: 0,
        food: 200,
        housing: 300,
        living: 1000,
        mortgage: 0,
        other: 500,
        total: 1000,
        transport: 0,
      },
      income: {
        assetIncome: 0,
        businessRevenue: 0,
        capitalGains: 0,
        familyIncome: 0,
        salary: 3000,
        total: 3000,
      },
      netProfit: 2000,
      taxes: {
        business: 0,
        capital: 0,
        income: 0,
        property: 0,
        total: 0,
      },
      warning: null,
    },
    quarterlySalary: 3000,
    stats: {
      energy: 100,
      happiness: 100,
      health: 100,
      intelligence: 100,
      money: 1000,
      sanity: 100,
    },
    traits: [],
  }

  describe('calculateCreditLimit', () => {
    it('should calculate limit based on net profit', () => {
      const limit = calculateCreditLimit(mockPlayer)
      // avgNetProfit = 5000 - 3000 = 2000
      // baseLimit = 2000 * 8 = 16000
      // scoreMultiplier = 600 / 600 = 1
      expect(limit).toBe(16000)
    })

    it('should include assets in limit calculation', () => {
      const playerWithAssets = {
        ...mockPlayer,
        assets: [{ currentValue: 10000 }],
      } as Player
      const limit = calculateCreditLimit(playerWithAssets)
      // baseLimit = 2000 * 8 + 10000 * 0.2 = 16000 + 2000 = 18000
      expect(limit).toBe(18000)
    })

    it('should adjust limit based on credit score', () => {
      const playerWithLowScore = { ...mockPlayer, creditScore: 300 } as Player
      const limit = calculateCreditLimit(playerWithLowScore)
      // scoreMultiplier = 300 / 600 = 0.5
      expect(limit).toBe(8000)
    })

    it('should return minimum limit of 1000', () => {
      const poorPlayer = {
        ...mockPlayer,
        quarterlyReport: {
          expenses: { total: 0 },
          income: { total: 0 },
        },
      } as unknown as Player
      const limit = calculateCreditLimit(poorPlayer)
      expect(limit).toBe(1000)
    })
  })

  describe('getLoanInterestRate', () => {
    it('should calculate rate based on key rate and score', () => {
      const rate = getLoanInterestRate(mockCountry, 600)
      // baseRate = 5 + 5 = 10
      // riskPremium = (800 - 600) / 20 = 10
      expect(rate).toBe(20)
    })

    it('should have lower rate for higher score', () => {
      const rate = getLoanInterestRate(mockCountry, 800)
      // riskPremium = 0
      expect(rate).toBe(10)
    })
  })

  describe('getDepositInterestRate', () => {
    it('should be 80% of key rate', () => {
      const rate = getDepositInterestRate(mockCountry)
      expect(rate).toBe(4)
    })
  })
})
