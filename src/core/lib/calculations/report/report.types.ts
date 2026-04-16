import type { Player } from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'

export interface QuarterlyReportParams {
  assetIncome: number
  assetMaintenance: number
  buffIncomeMod: number
  businessFinancialsOverride?: {
    income: number
    expenses: number
    taxes: number
  }
  country: CountryEconomy
  debtInterest: number
  expensesBreakdown?: Record<string, number>
  familyExpenses: number
  familyIncome: number
  lifestyleExpenses?: number
  player: Player
}

export const MONTHS_IN_QUARTER = 3
export const PERCENT_DIVISOR = 100
export const BASE_MONTHLY_LIFESTYLE_COST = 1000
export const DEFAULT_PLAYER_SHARE = 100
