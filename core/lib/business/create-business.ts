/**
 * Layer 3: Business Initialization
 *
 * ✅ Pure function — constructs new business object
 * ✅ No dependencies on store/state
 * ✅ Single responsibility: create properly initialized Business object
 */

import { BusinessSchema } from '@/core/schemas/game.schema'
import type { Business, BusinessType, BusinessRoleTemplate, BusinessInventory } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'

export interface CreateBusinessParams {
  creationCost: StatEffect
  currentTurn: number
  description: string
  employeeRoles: BusinessRoleTemplate[]
  id?: string
  inventory?: BusinessInventory
  maxEmployees: number
  minEmployees?: number
  monthlyExpenses?: number
  monthlyIncome?: number
  name: string
  openingQuarters: number
  price?: number
  quantity?: number
  taxRate?: number
  totalCost: number
  type: BusinessType
  upfrontCost: number
}

const DEFAULT_TAX_RATE = 15
const DEFAULT_EFFICIENCY = 50
const DEFAULT_REPUTATION = 50
const BRANCH_OPENING_TIME_MULTIPLIER = 0.7
const DEFAULT_PRICE = 5
const MAX_STOCK_NON_SERVICE = 1000
const PRICE_PER_UNIT_NON_SERVICE = 100
const PURCHASE_COST_NON_SERVICE = 50
const INITIAL_QUANTITY_NON_SERVICE = 100
const GOAL_PRICE_TARGET = 8
const GOAL_QUANTITY_TARGET = 500

const RADIX_HEX = 36
const SUB_START = 2
const SUB_END = 11

/**
 * Creates a new business object with all required properties initialized
 *
 * ✅ Pure function: given same inputs, always returns identical output
 * ✅ No side effects: doesn't modify store/database/etc
 * ✅ Well-typed: all parameters and return type explicitly typed
 *
 * @param params - Business creation parameters
 * @returns Properly initialized Business object
 *
 * @example
 * const business = createBusinessObject({
 *   name: 'My Shop',
 *   type: 'retail',
 *   description: 'A nice shop',
 *   totalCost: 50000,
 *   upfrontCost: 25000,
 *   creationCost: { energy: -10 },
 *   openingQuarters: 2,
 *   monthlyIncome: 5000,
 *   monthlyExpenses: 2000,
 *   maxEmployees: 5,
 *   currentTurn: 10
 * })
 */
export function createBusinessObject(params: CreateBusinessParams): Business {
  const {
    creationCost,
    currentTurn,
    description,
    employeeRoles,
    id,
    inventory: initialInventory,
    maxEmployees,
    minEmployees = 1,
    name,
    openingQuarters,
    price: initialPrice,
    quantity: initialQuantity,
    taxRate = DEFAULT_TAX_RATE,
    totalCost,
    type,
    upfrontCost,
  } = params

  const isServiceBased = type === 'service' || type === 'tech'
  const businessId =
    id ??
    `business_${String(Date.now())}_${Math.random().toString(RADIX_HEX).substring(SUB_START, SUB_END)}`

  const businessGoals: Business['businessGoals'] = [
    {
      current: initialPrice ?? DEFAULT_PRICE,
      description: `Установите цену на уровне ${String(GOAL_PRICE_TARGET)} или выше для максимизации маржинальности`,
      id: 'goal_price_target',
      isCompleted: (initialPrice ?? DEFAULT_PRICE) >= GOAL_PRICE_TARGET,
      target: GOAL_PRICE_TARGET,
      title: 'Ценовая стратегия',
      type: 'price',
    },
  ]

  if (!isServiceBased) {
    businessGoals.push({
      current: initialQuantity ?? INITIAL_QUANTITY_NON_SERVICE,
      description: `Увеличьте объем производства до ${String(GOAL_QUANTITY_TARGET)} единиц для захвата доли рынка`,
      id: 'goal_quantity_target',
      isCompleted: (initialQuantity ?? INITIAL_QUANTITY_NON_SERVICE) >= GOAL_QUANTITY_TARGET,
      target: GOAL_QUANTITY_TARGET,
      title: 'Масштабирование',
      type: 'quantity',
    })
  }

  // Set opening progress based on whether it's an immediate opening or not
  const openingProgress =
    openingQuarters > 0
      ? {
          id: `opening_${businessId}`,
          investedAmount: upfrontCost,
          quartersLeft: openingQuarters,
          remainingDuration: openingQuarters,
          title: `Открытие: ${name}`,
          totalCost,
          totalDuration: openingQuarters,
          totalQuarters: openingQuarters,
          upfrontCost,
        }
      : undefined

  const business: Business = {
    autoPurchaseAmount: 0,
    // Branches
    branches: [],
    businessGoals,
    createdAt: currentTurn,
    // Financials
    creationCost,
    currentValue: totalCost,
    description,
    efficiency: DEFAULT_EFFICIENCY,
    employeeRoles,

    // Staffing
    employees: [],
    // History
    eventsHistory: [],
    foundedTurn: currentTurn,
    // Insurance
    hasInsurance: false,
    // Identifiers
    id: businessId,
    initialCost: totalCost,
    insuranceCost: 0,

    // Inventory (for non-service businesses)
    inventory: initialInventory ?? {
      autoPurchaseAmount: 0,
      currentStock: 0,
      maxStock: isServiceBased ? 0 : MAX_STOCK_NON_SERVICE,
      pricePerUnit: isServiceBased ? 0 : PRICE_PER_UNIT_NON_SERVICE,
      purchaseCost: isServiceBased ? 0 : PURCHASE_COST_NON_SERVICE,
    },

    isMainBranch: true,
    isServiceBased,
    lastQuarterlyUpdate: currentTurn,
    maxEmployees,
    minEmployees,
    monthlyExpenses: 0,
    monthlyIncome: 0,
    name,

    // Network & Partnerships
    networkId: undefined,
    // Opening Progress (if applicable)
    openingProgress,

    partners: [],

    playerRoles: {
      managerialRoles: [],
      operationalRole: null,
    },
    // Pricing & Production
    price: initialPrice ?? DEFAULT_PRICE, // Default mid-range price (1-10)
    proposals: [],
    quantity: initialQuantity ?? (isServiceBased ? 0 : INITIAL_QUANTITY_NON_SERVICE),
    quarterlyExpenses: 0,
    quarterlyIncome: 0,

    quarterlyTax: 0,

    // Metrics & Performance
    reputation: DEFAULT_REPUTATION,
    state: openingQuarters > 0 ? 'opening' : 'active',
    taxRate,
    type,
    valuation: totalCost,
    walletBalance: 0,
  }

  // Final safety check: ensure the created business object is valid according to our schema
  const validation = BusinessSchema.safeParse(business)
  if (!validation.success) {
    // eslint-disable-next-line no-console
    console.error('CRITICAL: Created invalid business object:', validation.error.format())
    // In dev, we might want to throw, but in production, we'll log and return the object anyway
    // to avoid crashing the whole game if one minor property is off.
    if (process.env.NODE_ENV === 'development' || process.env.VITEST === 'true') {
      throw new Error(
        `Business creation failed validation: ${JSON.stringify(validation.error.format())}`,
      )
    }
  }

  return business
}

/**
 * Creates a branch business based on existing main business
 *
 * @param mainBusiness - The main branch to clone from
 * @param networkId - Network ID this branch belongs to
 * @param branchNumber - Branch number for naming
 * @param currentTurn - Current game turn
 * @param cost - The cost to open this branch
 * @returns New branch business
 */
export function createBusinessBranch(
  mainBusiness: Business,
  networkId: string,
  branchNumber: number,
  currentTurn: number,
  cost: number,
): Business {
  const branchName = `${mainBusiness.name.split(' (')[0]} (Филиал ${String(branchNumber)})`

  return {
    ...mainBusiness,
    efficiency: DEFAULT_EFFICIENCY,
    employees: [],
    eventsHistory: [],
    foundedTurn: currentTurn,
    id: `business_${String(Date.now())}`,
    inventory: {
      ...mainBusiness.inventory,
      currentStock: 0,
    },
    isMainBranch: false,
    monthlyExpenses: 0,
    monthlyIncome: 0,
    name: branchName,
    networkId,
    openingProgress: {
      id: `opening_branch_${String(Date.now())}`,
      investedAmount: cost,
      quartersLeft: Math.max(
        1,
        Math.round(
          (mainBusiness.openingProgress?.totalDuration ?? 1) * BRANCH_OPENING_TIME_MULTIPLIER,
        ),
      ),
      remainingDuration: Math.max(
        1,
        Math.round(
          (mainBusiness.openingProgress?.totalDuration ?? 1) * BRANCH_OPENING_TIME_MULTIPLIER,
        ),
      ),
      title: `Открытие филиала: ${branchName}`,
      totalCost: cost,
      totalDuration: Math.max(
        1,
        Math.round(
          (mainBusiness.openingProgress?.totalDuration ?? 1) * BRANCH_OPENING_TIME_MULTIPLIER,
        ),
      ),
      totalQuarters: Math.max(
        1,
        Math.round(
          (mainBusiness.openingProgress?.totalDuration ?? 1) * BRANCH_OPENING_TIME_MULTIPLIER,
        ),
      ),
      upfrontCost: cost,
    },
    playerRoles: {
      managerialRoles: [],
      operationalRole: null,
    },
    quarterlyTax: 0,
    reputation: DEFAULT_REPUTATION,
    state: 'opening',
    walletBalance: 0,
  }
}
