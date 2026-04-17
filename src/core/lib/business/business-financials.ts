import type { Business, BusinessInventory } from '../../types/business.types'
import type { CountryEconomy } from '../../types/economy.types'
import type { Skill } from '../../types/skill.types'
import type { StatEffect } from '../../types/stats.types'
import { sanitizeNumber } from '../calculations/financial-helpers'
import { calculateTotalBusinessImpact } from './business-impacts'
import { calculateEfficiency, calculateReputation } from './business-metrics'
import { calculateOpEx } from './financials/opex-calculator'
import { calculateRevenue } from './financials/revenue-calculator'
import {
  calculateEstimatedMonthlyProfit as _calcMonthlyProfit,
  calculateTaxes,
} from './financials/tax-calculator'
import { calculatePlayerRoleEffects } from './player-roles'

const DEFAULT_TAX_RATE = 15
const DEFAULT_FALLBACK_PRICE = 5
const DEFAULT_FALLBACK_PURCHASE_COST = 40
const DEFAULT_FALLBACK_PRICE_PER_UNIT = 50

/**
 * Рассчитывает детальные финансовые показатели бизнеса за квартал
 */
export function calculateBusinessFinancials(
  business: Business,
  isPreview = false,
  playerSkills?: Skill[],
  globalMarketValueInput = 1.0,
  economy?: CountryEconomy,
): {
  income: number
  expenses: number
  taxAmount: number
  profit: number
  netProfit: number
  cashFlow: number
  newInventory: BusinessInventory
  playerStatEffects: StatEffect
  debug?: {
    productionCapacity?: number
    salesVolume: number
    marketDemand: number
    purchaseAmount: number
    purchaseCost: number
    priceUsed: number
    unitCost: number
    taxAmount: number
    opEx: number
    cogs: number
    grossProfit: number
    expensesBreakdown: {
      employees: number
      inventory: number
      marketing: number
      rent: number
      equipment: number
      other: number
    }
  }
} {
  // NaN Guards for inputs
  const globalMarketValue = sanitizeNumber(globalMarketValueInput, 1.0)
  const efficiency = sanitizeNumber(business.efficiency)
  const reputation = sanitizeNumber(business.reputation)

  const safeBusiness: Business = {
    ...business,
    efficiency,
    inventory: {
      ...business.inventory,
      currentStock: sanitizeNumber(business.inventory.currentStock),
      pricePerUnit: sanitizeNumber(
        business.inventory.pricePerUnit,
        DEFAULT_FALLBACK_PRICE_PER_UNIT,
      ),
      purchaseCost: sanitizeNumber(business.inventory.purchaseCost, DEFAULT_FALLBACK_PURCHASE_COST),
    },
    price: sanitizeNumber(business.price, DEFAULT_FALLBACK_PRICE),
    quarterlyExpenses: business.quarterlyExpenses,
    reputation,
  }

  const state = safeBusiness.state
  if (state !== 'active') {
    const fixedExpenses = safeBusiness.quarterlyExpenses
    return {
      cashFlow: -fixedExpenses,
      expenses: fixedExpenses,
      income: 0,
      netProfit: -fixedExpenses,
      newInventory: safeBusiness.inventory,
      playerStatEffects: { energy: 0, sanity: 0 },
      profit: -fixedExpenses,
      taxAmount: 0,
    }
  }

  // 1. Impacts & Metrics
  const impacts = calculateTotalBusinessImpact(safeBusiness, playerSkills)
  const currentEfficiency = isPreview
    ? calculateEfficiency(safeBusiness, playerSkills)
    : safeBusiness.efficiency
  const currentReputation = isPreview
    ? calculateReputation(safeBusiness, currentEfficiency, playerSkills)
    : safeBusiness.reputation

  // 2. OpEx Calculation
  const opexResult = calculateOpEx(safeBusiness, economy, impacts.expenseReductionPct)
  const { totalOpEx } = opexResult

  // 3. Revenue & Inventory Calculation
  const revenueResult = calculateRevenue(
    safeBusiness,
    currentEfficiency,
    currentReputation,
    globalMarketValue,
    impacts.salesBonusPct,
    impacts.staffProductivityBonus,
    isPreview,
  )
  const {
    cogs,
    marketDemand,
    productionCapacity,
    purchaseAmount,
    purchaseCost,
    salesIncome,
    salesVolume,
    sellingPrice,
    unitCost,
  } = revenueResult

  const newInventory = revenueResult.newInventory ?? safeBusiness.inventory

  // 4. Profit & Taxes
  const grossProfit = salesIncome - cogs
  const ebitda = grossProfit - totalOpEx

  const taxResult = calculateTaxes(
    ebitda,
    economy?.corporateTaxRate,
    safeBusiness.taxRate,
    impacts.taxReductionPct,
  )
  const { netProfit, taxAmount } = taxResult

  // Cash Flow includes production costs (purchaseCost) and taxes
  const cashFlow = salesIncome - (totalOpEx + purchaseCost + taxAmount)

  return {
    cashFlow: Math.round(sanitizeNumber(cashFlow)),
    debug: {
      cogs: Math.round(sanitizeNumber(cogs)),
      expensesBreakdown: {
        employees: sanitizeNumber(opexResult.reducedEmployeesCost),
        equipment: sanitizeNumber(opexResult.reducedUtilities),
        inventory: Math.round(sanitizeNumber(purchaseCost)),
        marketing: 0,
        other:
          sanitizeNumber(opexResult.reducedInsurance) + sanitizeNumber(opexResult.minFixedCosts),
        rent: sanitizeNumber(opexResult.reducedRent),
      },
      grossProfit: Math.round(sanitizeNumber(grossProfit)),
      marketDemand: sanitizeNumber(marketDemand),
      opEx: Math.round(sanitizeNumber(totalOpEx)),
      priceUsed: Math.round(sanitizeNumber(sellingPrice)),
      productionCapacity: sanitizeNumber(productionCapacity),
      purchaseAmount: sanitizeNumber(purchaseAmount),
      purchaseCost: Math.round(sanitizeNumber(purchaseCost)),
      salesVolume: sanitizeNumber(salesVolume),
      taxAmount: Math.round(sanitizeNumber(taxAmount)),
      unitCost: Math.round(sanitizeNumber(unitCost)),
    },
    expenses: Math.round(sanitizeNumber(purchaseCost) + sanitizeNumber(totalOpEx)),
    income: Math.round(sanitizeNumber(salesIncome)),
    netProfit: Math.round(sanitizeNumber(netProfit)),
    newInventory,
    playerStatEffects: calculatePlayerRoleEffects(safeBusiness),
    profit: Math.round(sanitizeNumber(cashFlow)),
    taxAmount: Math.round(sanitizeNumber(taxAmount)),
  }
}

/**
 * Рассчитывает примерную месячную прибыль для отображения в UI
 */
export function calculateEstimatedMonthlyProfit(
  monthlyIncome: number,
  monthlyExpenses: number,
  corporateTaxRatePercent = DEFAULT_TAX_RATE,
): number {
  return _calcMonthlyProfit(monthlyIncome, monthlyExpenses, corporateTaxRatePercent)
}

/**
 * Рассчитывает доход бизнеса (упрощенная версия для UI)
 */
export function calculateBusinessIncome(business: Business): number {
  const financials = calculateBusinessFinancials(business, true)
  return financials.income
}
