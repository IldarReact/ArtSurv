import { describe, it, expect } from 'vitest'

import type { GameStore } from '../../../slices/types'
import { financialStep } from '../../steps/financial.step'
import type { TurnContext, TurnState } from '../../steps/step.types'
import { processFinancials } from '../financial-processor'

describe('Financial Logic Integration', () => {
  const mockCountry = {
    currencySymbol: '$',
    id: 'us',
    inflation: 0,
    keyRate: 10, // 10%
    taxRates: { business: 0, capital: 0, income: 0, property: 0 },
  }

  const mockState: Partial<GameStore> = {
    countries: { us: mockCountry as any },
    player: {
      assets: [{ currentValue: 10000, expenses: 0, income: 0, type: 'deposit' }],
      businesses: [],
      countryId: 'us',
      debts: [
        {
          id: 'd1',
          interestRate: 20, // 20% annual = 5% quarterly
          quarterlyPayment: 3000,
          remainingAmount: 10000,
          remainingQuarters: 4,
          type: 'consumer_credit',
        },
      ],
      jobs: [],
      personal: { familyMembers: [] },
      quarterlySalary: 0,
      stats: { money: 1000 },
    } as any,
  }

  describe('processFinancials', () => {
    it('should calculate realistic debt interest and deposit income', () => {
      const res = processFinancials(
        mockState as GameStore,
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
        },
        { totalExpenses: 0, totalIncome: 0, totalTax: 0 },
        0,
      )

      // Deposit income: 10000 * (10% * 0.7 / 4) = 10000 * 0.0175 = 175
      expect(res.assetIncome).toBeCloseTo(175)

      // Debt interest: 10000 * (20% / 4) = 10000 * 0.05 = 500
      expect(res.debtInterest).toBe(500)
    })
  })

  describe('financialStep', () => {
    it('should amortize debt correctly', () => {
      const ctx: TurnContext = {
        prev: mockState as GameStore,
        turn: 1,
        year: 2024,
      }
      const state: TurnState = {
        business: { totalExpenses: 0, totalIncome: 0, totalTax: 0 },
        financial: {},
        lifestyle: {
          breakdown: {
            credits: 3000,
            food: 0,
            housing: 0,
            mortgage: 0,
            other: 0,
            total: 3000,
            transport: 0,
          },
          expenses: 3000,
        },
        player: { ...mockState.player } as any,
        statModifiers: {},
      } as any

      financialStep(ctx, state)

      // In processFinancials: debtInterest = 500
      // In calculateQuarterlyReport (mocked logic):
      // If player has consumer_credit, it might be included in expenses.credits
      // Let's assume the processor calculated quarterlyPayment or similar.

      const debt = state.player.debts[0]
      // quarterlyRate = 20 / 100 / 4 = 0.05
      // interestPart = 10000 * 0.05 = 500
      // if expenses.credits was say 3000
      // principalPart = 3000 - 500 = 2500
      // remainingAmount = 10000 - 2500 = 7500

      expect(debt.remainingQuarters).toBe(3)
      expect(debt.remainingAmount).toBeLessThan(10000)
    })
  })
})
