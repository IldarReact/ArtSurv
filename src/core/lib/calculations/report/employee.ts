import type { QuarterlyReport, IncomeBreakdown } from '@/core/types'

import { sanitizeNumber } from '../financial-helpers'
import { getInflatedPrice } from '../price-helpers'
import { assembleQuarterlyReport } from './report-utils'
import { MONTHS_IN_QUARTER, PERCENT_DIVISOR, BASE_MONTHLY_LIFESTYLE_COST } from './report.types'
import type { QuarterlyReportParams } from './report.types'

export function calculateEmployeeQuarterlyReport(params: QuarterlyReportParams): QuarterlyReport {
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

  // Income (с инфляцией)
  let baseSalary = 0
  for (const job of player.jobs) {
    const monthlySalary = sanitizeNumber(job.salary)
    // Применить инфляцию к зарплате
    const inflatedMonthlySalary = getInflatedPrice(monthlySalary, country, 'salaries')
    baseSalary += inflatedMonthlySalary * MONTHS_IN_QUARTER
  }
  const salary = baseSalary * (1 + buffIncomeMod / PERCENT_DIVISOR)
  const totalIncome = salary + familyIncome + assetIncome

  const income: IncomeBreakdown = {
    assetIncome,
    businessRevenue: 0,
    capitalGains: 0,
    familyIncome,
    salary,
    total: totalIncome,
  }

  // Базовые расходы на жизнь с инфляцией (категория services)
  const baseLifestyleCost =
    BASE_MONTHLY_LIFESTYLE_COST * MONTHS_IN_QUARTER * country.costOfLivingModifier
  const baseLiving = getInflatedPrice(baseLifestyleCost, country, 'services')

  return assembleQuarterlyReport(params, income, totalIncome, 0, 0, baseLiving)
}
