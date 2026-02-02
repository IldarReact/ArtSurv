import type { Player, QuarterlyReport, IncomeBreakdown, TaxesBreakdown } from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'

import { sanitizeNumber } from '../financial-helpers'
import { calculateQuarterlyTaxes } from '../quarterly/calculate-quarterly-taxes'

export interface ReportParams {
  player: Player
  country: CountryEconomy
  familyIncome: number
  familyExpenses: number
  assetIncome: number
  assetMaintenance: number
  debtInterest: number
  buffIncomeMod: number
  lifestyleExpenses?: number
  expensesBreakdown?: Record<string, number>
}

export function assembleQuarterlyReport(
  params: ReportParams,
  income: IncomeBreakdown,
  taxableIncome: number,
  businessExpenses: number,
  businessTaxes: number,
  baseLiving: number,
): QuarterlyReport {
  const {
    assetMaintenance,
    country,
    debtInterest,
    expensesBreakdown,
    familyExpenses,
    lifestyleExpenses,
    player,
  } = params

  const breakdown = expensesBreakdown ?? {
    credits: debtInterest,
    food: sanitizeNumber(lifestyleExpenses),
    housing: 0,
    mortgage: 0,
    other: familyExpenses,
    transport: 0,
  }

  const expensesTotal = Math.round(
    baseLiving +
      sanitizeNumber(breakdown.food) +
      sanitizeNumber(breakdown.housing) +
      sanitizeNumber(breakdown.transport) +
      sanitizeNumber(breakdown.other) +
      sanitizeNumber(breakdown.credits) +
      sanitizeNumber(breakdown.mortgage) +
      familyExpenses +
      businessExpenses +
      assetMaintenance,
  )

  const personalTaxes = calculateQuarterlyTaxes({
    assets: player.assets,
    country,
    income: taxableIncome,
  })

  const taxes: TaxesBreakdown = {
    business: Math.round(businessTaxes),
    capital: personalTaxes.capital,
    income: personalTaxes.income,
    property: personalTaxes.property,
    total: Math.round(personalTaxes.total + businessTaxes),
  }

  const netProfit = income.total - expensesTotal - taxes.total

  return {
    expenses: {
      assetMaintenance: Math.round(assetMaintenance),
      business: Math.round(businessExpenses),
      credits: Math.round(sanitizeNumber(breakdown.credits)),
      debtInterest: Math.round(debtInterest),
      family: Math.round(familyExpenses),
      food: Math.round(sanitizeNumber(breakdown.food)),
      housing: Math.round(sanitizeNumber(breakdown.housing)),
      living: Math.round(
        baseLiving +
          sanitizeNumber(breakdown.food) +
          sanitizeNumber(breakdown.housing) +
          sanitizeNumber(breakdown.transport) +
          sanitizeNumber(breakdown.other),
      ),
      mortgage: Math.round(sanitizeNumber(breakdown.mortgage)),
      other: Math.round(sanitizeNumber(breakdown.other)),
      total: expensesTotal,
      transport: Math.round(sanitizeNumber(breakdown.transport)),
    },
    income,
    netProfit: Math.round(netProfit),
    taxes,
    warning: netProfit < 0 ? 'Вы теряете деньги!' : null,
  }
}
