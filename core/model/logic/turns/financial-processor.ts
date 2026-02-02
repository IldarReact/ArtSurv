import { calculateQuarterlyReport } from '@/core/lib/calculations'
import type { FamilyMember, QuarterlyReport } from '@/core/types'

import type { GameStore } from '../../slices/types'
import type { LifestyleExpensesBreakdown } from './lifestyle-processor'

interface BusinessResult {
  totalExpenses: number
  totalIncome: number
  totalTax: number
}

export function processFinancials(
  state: GameStore,
  countryId: string,
  updatedFamilyMembers: FamilyMember[],
  lifestyleExpenses: number,
  lifestyleExpensesBreakdown: LifestyleExpensesBreakdown,
  businessResult: BusinessResult,
  buffIncomeMod: number,
) {
  if (!state.player) {
    const country = state.countries[countryId]

    return {
      assetIncome: 0,
      assetMaintenance: 0,
      country,
      debtInterest: 0,
      familyExpenses: 0,
      familyIncome: 0,
      netProfit: 0,
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
      } as QuarterlyReport,
    }
  }

  const country = state.countries[countryId]

  let familyIncome = 0
  let familyExpenses = 0
  for (const m of updatedFamilyMembers) {
    familyIncome += m.income
    familyExpenses += m.expenses
  }

  const DEPOSIT_RATE_MULTIPLIER = 0.7
  const QUARTERS_PER_YEAR = 4
  const MONTHS_PER_QUARTER = 3
  const PERCENT_BASE = 100

  const depositAnnualRate = (country.keyRate * DEPOSIT_RATE_MULTIPLIER) / PERCENT_BASE
  const depositQuarterlyRate = depositAnnualRate / QUARTERS_PER_YEAR

  let totalAssetIncome = 0
  let assetMaintenance = 0
  for (const a of state.player.assets) {
    if (a.type === 'deposit') {
      totalAssetIncome += a.currentValue * depositQuarterlyRate
    } else {
      totalAssetIncome += a.income * MONTHS_PER_QUARTER
    }
    assetMaintenance += a.expenses * MONTHS_PER_QUARTER
  }

  const assetIncome = totalAssetIncome

  let debtInterest = 0

  for (const d of state.player.debts) {
    // Реалистичный расчет процентов: Остаток долга * (Ставка / 100) / 4 квартала
    const quarterlyRate = d.interestRate / PERCENT_BASE / QUARTERS_PER_YEAR
    debtInterest += Math.round(d.remainingAmount * quarterlyRate)
  }

  const quarterlyReport = calculateQuarterlyReport({
    assetIncome,
    assetMaintenance,
    buffIncomeMod,
    businessFinancialsOverride: {
      expenses: businessResult.totalExpenses,
      income: businessResult.totalIncome,
      taxes: businessResult.totalTax,
    },
    country,
    debtInterest,
    expensesBreakdown: lifestyleExpensesBreakdown as unknown as Record<string, number>,
    familyExpenses,
    familyIncome,
    lifestyleExpenses,
    player: state.player,
  })

  const netProfit = quarterlyReport.netProfit

  return {
    assetIncome,
    assetMaintenance,
    country,
    debtInterest,
    familyExpenses,
    familyIncome,
    netProfit,
    quarterlyReport,
  }
}
