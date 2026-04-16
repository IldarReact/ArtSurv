import type { Business, BusinessInventory } from '../../../types/business.types'
import { BUSINESS_BALANCE } from '../../data-loaders/business-balance-loader'
import { checkMinimumStaffing } from '../player-roles'

const MIN_VALUE = 0.1
const PRICE_NORMALIZATION_FACTOR = 5
const MARKET_THRESHOLD = 0.9
const HIGH_PRICE_THRESHOLD = 6
const LOW_MARKET_PENALTY = 0.6
const STAFFING_PENALTY = 0.5
const MARKUP_FACTOR = 0.5
const HIGH_MARKUP_THRESHOLD = 0.6
const LOW_MARKUP_THRESHOLD = 0.3
const HIGH_MARKUP_DEMAND_PENALTY = 0.7
const LOW_MARKUP_DEMAND_BONUS = 1.1
const RANDOM_DEMAND_BASE = 0.9
const RANDOM_DEMAND_VARIATION = 0.2
const DETERMINISTIC_DEMAND_FACTOR = RANDOM_DEMAND_BASE + RANDOM_DEMAND_VARIATION / 2
const PERCENT_DIVISOR = 100
const FULL_STAFFING_MODIFIER = 1

export interface RevenueResult {
  cogs: number
  marketDemand: number
  newInventory?: BusinessInventory
  productionCapacity: number
  purchaseAmount: number
  purchaseCost: number
  salesIncome: number
  salesVolume: number
  sellingPrice: number
  unitCost: number
}

export function calculateRevenue(
  business: Business,
  currentEfficiency: number,
  currentReputation: number,
  globalMarketValue: number,
  salesBonusPct: number,
  isPreview: boolean,
): RevenueResult {
  const inventory = business.inventory

  if (business.isServiceBased) {
    return calculateServiceRevenue(
      business,
      currentEfficiency,
      currentReputation,
      globalMarketValue,
      salesBonusPct,
    )
  }

  return calculateProductRevenue(
    business,
    inventory,
    currentEfficiency,
    currentReputation,
    globalMarketValue,
    salesBonusPct,
    isPreview,
  )
}

function calculateServiceDemand(
  business: Business,
  currentEfficiency: number,
  currentReputation: number,
  globalMarketValue: number,
  salesBonusPct: number,
): number {
  const { elasticity, production } = BUSINESS_BALANCE

  const priceLevel = business.price
  const baseServiceDemand = business.maxEmployees * production.baseServiceDemandPerMaxEmp

  const efficiencyMod = currentEfficiency / PERCENT_DIVISOR
  const reputationMod = currentReputation / PERCENT_DIVISOR

  const normalizedPrice = Math.max(MIN_VALUE, priceLevel / PRICE_NORMALIZATION_FACTOR)
  const effectiveSafeThreshold =
    elasticity.safePriceThreshold + reputationMod * elasticity.reputationSafetyBonus

  let priceMod = 1.0
  if (normalizedPrice > effectiveSafeThreshold) {
    priceMod = Math.pow(effectiveSafeThreshold / normalizedPrice, elasticity.demandExponent)
  }

  // Market cycle impact on service
  let cycleMod = globalMarketValue
  const isMarketLow = cycleMod < MARKET_THRESHOLD
  const isHighPrice = priceLevel > HIGH_PRICE_THRESHOLD
  if (isMarketLow && isHighPrice) {
    cycleMod *= LOW_MARKET_PENALTY
  }

  const staffingCheck = checkMinimumStaffing(business)
  const staffingMod = staffingCheck.isValid ? FULL_STAFFING_MODIFIER : STAFFING_PENALTY

  const salesBonusMod = 1 + salesBonusPct / PERCENT_DIVISOR

  return (
    baseServiceDemand *
    efficiencyMod *
    Math.max(MIN_VALUE, reputationMod) *
    priceMod *
    cycleMod *
    staffingMod *
    salesBonusMod
  )
}

function calculateServiceRevenue(
  business: Business,
  currentEfficiency: number,
  currentReputation: number,
  globalMarketValue: number,
  salesBonusPct: number,
): RevenueResult {
  const { production } = BUSINESS_BALANCE

  const priceLevel = business.price
  const serviceDemand = calculateServiceDemand(
    business,
    currentEfficiency,
    currentReputation,
    globalMarketValue,
    salesBonusPct,
  )

  const sellingPrice = production.baseServiceRevenuePerLevel * priceLevel
  const salesVolume = Math.floor(serviceDemand)
  const salesIncome = Math.floor(salesVolume * sellingPrice)

  return {
    cogs: 0,
    marketDemand: serviceDemand,
    productionCapacity: 0,
    purchaseAmount: 0,
    purchaseCost: 0,
    salesIncome: salesIncome,
    salesVolume: salesVolume,
    sellingPrice: sellingPrice,
    unitCost: 0,
  }
}

function calculateProductPrice(inventory: BusinessInventory, priceLevel: number): number {
  const unitCost = inventory.purchaseCost
  const markup = priceLevel * MARKUP_FACTOR
  const finalPrice = Math.round(unitCost * markup)
  return priceLevel <= 0 ? 0 : finalPrice
}

function calculateProductDemand(
  business: Business,
  reputationMod: number,
  globalMarketValue: number,
  sellingPrice: number,
  unitCost: number,
  salesBonusPct: number,
  isPreview: boolean,
): { finalDemand: number; marketDemand: number } {
  const { elasticity, production } = BUSINESS_BALANCE
  const baseDemand = business.maxEmployees * production.baseProductDemandPerMaxEmp
  const marketMod = globalMarketValue
  const reputationEffect = Math.max(MIN_VALUE, reputationMod)

  const effectiveSafeThreshold =
    elasticity.safePriceThreshold + reputationMod * elasticity.reputationSafetyBonus
  const currentMarkup = sellingPrice / Math.max(1, unitCost) - 1

  let priceMod = 1.0
  if (currentMarkup > effectiveSafeThreshold && currentMarkup > 0) {
    priceMod = Math.pow(effectiveSafeThreshold / currentMarkup, elasticity.demandExponent)
  }

  // Market collapse impact
  const isMarketCollapsed = marketMod < MARKET_THRESHOLD
  if (isMarketCollapsed) {
    const isHighMarkup = currentMarkup >= HIGH_MARKUP_THRESHOLD
    const isLowMarkup = currentMarkup <= LOW_MARKUP_THRESHOLD
    if (isHighMarkup) priceMod *= HIGH_MARKUP_DEMAND_PENALTY
    else if (isLowMarkup) priceMod *= LOW_MARKUP_DEMAND_BONUS
  }

  let finalDemand =
    baseDemand * reputationEffect * marketMod * priceMod * (1 + salesBonusPct / PERCENT_DIVISOR)

  const marketDemand = finalDemand

  if (!isPreview) {
    // Business financial outcomes must be reproducible for identical inputs.
    finalDemand *= DETERMINISTIC_DEMAND_FACTOR
  }

  return { finalDemand, marketDemand }
}

function calculateProduction(
  business: Business,
  currentEfficiency: number,
): { actualProduction: number; productionCapacity: number } {
  const { production } = BUSINESS_BALANCE

  let workersCount = business.employees.filter((e) => e.role === 'worker').length
  if (business.playerRoles.operationalRole === 'worker') {
    workersCount += 1
  }

  const efficiencyMod = currentEfficiency / 100

  const productionCapacity = Math.floor(
    (workersCount + STAFFING_PENALTY) * production.baseProductionPerWorker * efficiencyMod,
  )
  const planProduction = business.quantity
  const actualProduction = Math.min(planProduction, productionCapacity)

  return { actualProduction, productionCapacity }
}

function calculateProductRevenue(
  business: Business,
  inventory: BusinessInventory,
  currentEfficiency: number,
  currentReputation: number,
  globalMarketValue: number,
  salesBonusPct: number,
  isPreview: boolean,
): RevenueResult {
  const unitCost = inventory.purchaseCost
  const priceLevel = business.price
  const sellingPrice = calculateProductPrice(inventory, priceLevel)

  // 1. Production
  const { actualProduction, productionCapacity } = calculateProduction(business, currentEfficiency)

  const purchaseAmount = actualProduction
  const purchaseCost = Math.round(actualProduction * unitCost)

  // 2. Demand & Sales
  const reputationMod = currentReputation / 100
  const { finalDemand, marketDemand } = calculateProductDemand(
    business,
    reputationMod,
    globalMarketValue,
    sellingPrice,
    unitCost,
    salesBonusPct,
    isPreview,
  )

  const stock = inventory.currentStock
  const totalAvailable = stock + actualProduction
  const salesVolume = Math.min(totalAvailable, Math.floor(finalDemand))

  const salesIncome = Math.floor(salesVolume * sellingPrice)
  const cogs = Math.floor(salesVolume * unitCost)

  // 3. Inventory Update
  const remainingStock = Math.max(0, totalAvailable - salesVolume)
  const maxStock = inventory.maxStock

  const newInventory: BusinessInventory = {
    ...inventory,
    currentStock: Math.min(remainingStock, maxStock),
  }

  return {
    cogs,
    marketDemand,
    newInventory,
    productionCapacity,
    purchaseAmount,
    purchaseCost,
    salesIncome,
    salesVolume,
    sellingPrice,
    unitCost,
  }
}
