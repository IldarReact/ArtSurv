import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import type { QuarterlyReport, IncomeBreakdown, Player } from '@/core/types'

import { sanitizeNumber } from '../financial-helpers'
import { assembleQuarterlyReport } from './report-utils'
import {
  PERCENT_DIVISOR,
  BASE_MONTHLY_LIFESTYLE_COST,
  MONTHS_IN_QUARTER,
  DEFAULT_PLAYER_SHARE,
} from './report.types'
import type { QuarterlyReportParams } from './report.types'

/**
 * Helper to calculate salary from businesses.
 */
function calculateBusinessSalary(player: Player): number {
  let salary = 0
  for (const b of player.businesses) {
    const pEmp = b.playerEmployment
    if (pEmp) {
      const sharePct = typeof b.playerShare === 'number' ? b.playerShare : DEFAULT_PLAYER_SHARE
      const shareFactor = Math.max(0, Math.min(DEFAULT_PLAYER_SHARE, sharePct)) / PERCENT_DIVISOR
      salary += Math.round(sanitizeNumber(pEmp.salary) * shareFactor)
    }
  }
  return salary
}

/**
 * Calculates business financial data for the quarterly report.
 */
function calculateBusinessData(params: QuarterlyReportParams) {
  const { businessFinancialsOverride, player } = params
  let businessRevenue = 0
  let businessExpenses = 0
  let businessTaxes = 0
  let businessSalary = 0

  if (businessFinancialsOverride) {
    businessRevenue = sanitizeNumber(businessFinancialsOverride.income)
    businessExpenses = sanitizeNumber(businessFinancialsOverride.expenses)
    businessTaxes = sanitizeNumber(businessFinancialsOverride.taxes)
    businessSalary = calculateBusinessSalary(player)
  } else {
    for (const b of player.businesses) {
      const sharePct = typeof b.playerShare === 'number' ? b.playerShare : DEFAULT_PLAYER_SHARE
      const shareFactor = Math.max(0, Math.min(DEFAULT_PLAYER_SHARE, sharePct)) / PERCENT_DIVISOR

      businessRevenue += Math.round(sanitizeNumber(b.quarterlyIncome) * shareFactor)
      businessExpenses += Math.round(sanitizeNumber(b.quarterlyExpenses) * shareFactor)
      businessTaxes += Math.round(sanitizeNumber(b.quarterlyTax) * shareFactor)

      const pEmp = b.playerEmployment
      if (pEmp) {
        businessSalary += Math.round(sanitizeNumber(pEmp.salary) * shareFactor)
      }
    }
  }

  return {
    businessExpenses,
    businessRevenue,
    businessSalary,
    businessTaxes,
  }
}

export function calculateBusinessOwnerQuarterlyReport(
  params: QuarterlyReportParams,
): QuarterlyReport {
  const {
    assetIncome: rawAssetIncome,
    buffIncomeMod: rawBuffIncomeMod,
    country,
    familyIncome: rawFamilyIncome,
  } = params

  const familyIncome = sanitizeNumber(rawFamilyIncome)
  const assetIncome = sanitizeNumber(rawAssetIncome)
  const buffIncomeMod = sanitizeNumber(rawBuffIncomeMod)

  const { businessExpenses, businessRevenue, businessSalary, businessTaxes } =
    calculateBusinessData(params)

  const adjustedBusinessRevenue = businessRevenue * (1 + buffIncomeMod / PERCENT_DIVISOR)
  const workSalary = businessSalary * (1 + buffIncomeMod / PERCENT_DIVISOR)

  // Taxable income for personal taxes should only include business PROFIT, not gross REVENUE
  const businessProfit = Math.max(0, adjustedBusinessRevenue - businessExpenses - businessTaxes)
  const taxableIncome = workSalary + businessProfit + familyIncome + assetIncome

  const totalIncome = workSalary + adjustedBusinessRevenue + familyIncome + assetIncome

  const income: IncomeBreakdown = {
    assetIncome,
    businessRevenue: adjustedBusinessRevenue,
    capitalGains: 0,
    familyIncome,
    salary: workSalary,
    total: totalIncome,
  }

  // Базовые расходы на жизнь с инфляцией (категория services)
  const baseLifestyleCost =
    BASE_MONTHLY_LIFESTYLE_COST * MONTHS_IN_QUARTER * country.costOfLivingModifier
  const baseLiving = getInflatedPrice(baseLifestyleCost, country, 'services')

  return assembleQuarterlyReport(
    params,
    income,
    taxableIncome,
    businessExpenses,
    businessTaxes,
    baseLiving,
  )
}
