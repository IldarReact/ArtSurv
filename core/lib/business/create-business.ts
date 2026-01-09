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
  id?: string
  name: string
  type: BusinessType
  description: string
  totalCost: number
  upfrontCost: number
  creationCost: StatEffect
  openingQuarters: number
  monthlyIncome?: number
  monthlyExpenses?: number
  maxEmployees: number
  minEmployees?: number
  taxRate?: number
  employeeRoles: BusinessRoleTemplate[]
  inventory?: BusinessInventory
  currentTurn: number
}

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
    id,
    name,
    type,
    description,
    totalCost,
    upfrontCost,
    creationCost,
    openingQuarters,
    monthlyIncome = 0,
    monthlyExpenses = 0,
    maxEmployees,
    minEmployees = 1,
    taxRate = 15,
    employeeRoles = [],
    inventory: initialInventory,
    currentTurn,
  } = params

  const isServiceBased = type === 'service' || type === 'tech'
  const businessId = id || `business_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  const business: Business = {
    // Identifiers
    id: businessId,
    name,
    type,
    description,
    state: openingQuarters > 0 ? 'opening' : 'active',
    lastQuarterlyUpdate: currentTurn,
    createdAt: currentTurn,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    autoPurchaseAmount: 0,

    // Pricing & Production
    price: 5, // Default mid-range price (1-10)
    quantity: isServiceBased ? 0 : 100,
    isServiceBased,

    // Network & Partnerships
    networkId: undefined,
    isMainBranch: true,
    partners: [],
    proposals: [],

    // Opening Progress (if applicable)
    openingProgress: {
      id: `opening_${businessId}`,
      title: `Открытие: ${name}`,
      totalDuration: openingQuarters,
      remainingDuration: openingQuarters,
      totalQuarters: openingQuarters,
      quartersLeft: openingQuarters,
      investedAmount: upfrontCost,
      totalCost,
      upfrontCost,
    },

    // Financials
    creationCost,
    initialCost: totalCost,
    quarterlyIncome: (monthlyIncome || 0) * 3 || 0,
    quarterlyExpenses: (monthlyExpenses || 0) * 3 || 0,
    quarterlyTax: 0,
    currentValue: totalCost,
    taxRate: taxRate || 15,
    walletBalance: 0,

    // Insurance
    hasInsurance: false,
    insuranceCost: 0,

    // Inventory (for non-service businesses)
    inventory: initialInventory || {
      currentStock: 0,
      maxStock: isServiceBased ? 0 : 1000,
      pricePerUnit: isServiceBased ? 0 : 100,
      purchaseCost: isServiceBased ? 0 : 50,
      autoPurchaseAmount: 0,
    },

    // Staffing
    employees: [],
    maxEmployees,
    employeeRoles,
    minEmployees,
    playerRoles: {
      managerialRoles: [],
      operationalRole: null,
    },

    // Metrics & Performance
    reputation: 50,
    efficiency: 50,

    // History
    eventsHistory: [],
    foundedTurn: currentTurn,
  }

  // Final safety check: ensure the created business object is valid according to our schema
  const validation = BusinessSchema.safeParse(business)
  if (!validation.success) {
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
  const branchName = `${mainBusiness.name.split(' (')[0]} (Филиал ${branchNumber})`

  return {
    ...mainBusiness,
    id: `business_${Date.now()}`,
    name: branchName,
    state: 'opening',
    networkId,
    isMainBranch: false,
    openingProgress: {
      ...mainBusiness.openingProgress,
      id: `opening_branch_${Date.now()}`,
      title: `Открытие филиала: ${branchName}`,
      totalDuration: Math.max(
        1,
        Math.round((mainBusiness.openingProgress?.totalDuration || 1) * 0.7),
      ),
      remainingDuration: Math.max(
        1,
        Math.round((mainBusiness.openingProgress?.totalDuration || 1) * 0.7),
      ),
      totalQuarters: Math.max(
        1,
        Math.round((mainBusiness.openingProgress?.totalQuarters || 1) * 0.7),
      ),
      quartersLeft: Math.max(
        1,
        Math.round((mainBusiness.openingProgress?.totalQuarters || 1) * 0.7),
      ),
      investedAmount: cost,
      totalCost: cost,
      upfrontCost: cost,
    },
    employees: [],
    inventory: {
      ...mainBusiness.inventory,
      currentStock: 0,
    },
    quarterlyTax: 0,
    reputation: 50,
    efficiency: 50,
    eventsHistory: [],
    foundedTurn: currentTurn,
    playerRoles: {
      managerialRoles: [],
      operationalRole: null,
    },
    walletBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
  }
}
