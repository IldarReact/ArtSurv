import type { QuarterlyReport, IncomeBreakdown, Player } from '@/core/types'

import { sanitizeNumber } from '../financial-helpers'
import { getInflatedPrice } from '../price-helpers'
import { assembleQuarterlyReport } from './report-utils'
import {
  BASE_MONTHLY_LIFESTYLE_COST,
  DEFAULT_PLAYER_SHARE,
  MONTHS_IN_QUARTER,
  PERCENT_DIVISOR,
  type QuarterlyReportParams,
} from './report.types'

/**
 * Helper to calculate salary from businesses.
 */
function calculateBusinessSalary(player: Player): number {
  let salary = 0
  for (const b of player.businesses) {
    const pEmp = b.playerEmployment
    if (pEmp) {
      salary += Math.round(sanitizeNumber(pEmp.salary))
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
        businessSalary += Math.round(sanitizeNumber(pEmp.salary))
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

export function calculateMixedQuarterlyReport(params: QuarterlyReportParams): QuarterlyReport {
  const {
    assetIncome: rawAssetIncome,
    buffIncomeMod: rawBuffIncomeMod,
    country,
    familyIncome: rawFamilyIncome,
    player,
  } = params

  const familyIncome = sanitizeNumber(rawFamilyIncome)
  const assetIncome = sanitizeNumber(rawAssetIncome)
  const buffIncomeMod = sanitizeNumber(rawBuffIncomeMod)

  const { businessExpenses, businessRevenue, businessSalary, businessTaxes } =
    calculateBusinessData(params)

  let baseSalary = 0
  for (const job of player.jobs) {
    const monthlySalary = sanitizeNumber(job.salary)
    // Применить инфляцию к зарплате
    const inflatedMonthlySalary = getInflatedPrice(monthlySalary, country, 'salaries')
    baseSalary += inflatedMonthlySalary * MONTHS_IN_QUARTER
  }

  // Total personal income from work (external jobs + own business salary)
  const workSalary = (baseSalary + businessSalary) * (1 + buffIncomeMod / PERCENT_DIVISOR)
  const adjustedBusinessRevenue = businessRevenue * (1 + buffIncomeMod / PERCENT_DIVISOR)

  // Taxable income for personal taxes should only include business PROFIT, not gross REVENUE
  const businessProfit = Math.max(0, adjustedBusinessRevenue - businessExpenses - businessTaxes)
  const taxableIncome = workSalary + businessProfit + familyIncome + assetIncome

  // Total income for net profit calculation
  // NOTE: businessRevenue already includes the business expenses and taxes in the flow
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
  const baseLifestyleCost = BASE_MONTHLY_LIFESTYLE_COST * country.costOfLivingModifier
  const baseLiving = getInflatedPrice(baseLifestyleCost, country, 'services') * MONTHS_IN_QUARTER

  return assembleQuarterlyReport(
    params,
    income,
    taxableIncome,
    businessExpenses,
    businessTaxes,
    baseLiving,
  )
}
