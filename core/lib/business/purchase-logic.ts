/**
 * Shared business purchase logic to ensure DRY compliance across solo and partner flows.
 */

import type { Business, BusinessType, BusinessInventory, BusinessRoleTemplate } from '@/core/types'

import { createBusinessObject } from './create-business'

export interface BusinessTemplate {
  description: string
  employeeRoles: BusinessRoleTemplate[]
  id: string
  initialCost: number
  inventory?: BusinessInventory
  maxEmployees: number
  minEmployees?: number
  monthlyExpenses: number
  monthlyIncome: number
  name: string
  price?: number
  quantity?: number
  type?: BusinessType
  upfrontPaymentPercentage?: number
}

export interface PartnerConfig {
  initialState?: 'active' | 'opening' // Force state
  partnerId: string
  partnerName: string
  playerId?: string // Optional custom player ID
  playerName?: string // Optional custom player name
  playerShare: number // 0-100
}

export interface PurchaseResult {
  business: Business & { partnerBusinessId?: string }
  cost: number // The amount the player actually pays upfront
}

const INSURANCE_COST_PERCENT = 0.01

/**
 * Unifies the creation of a business object and calculates the upfront cost.
 */
export function createBusinessPurchase(
  template: BusinessTemplate,
  inflatedCost: number,
  currentTurn: number,
  partnerConfig?: PartnerConfig & { partnerBusinessId?: string },
): PurchaseResult {
  const totalCost = inflatedCost

  // Calculate how much the player pays
  let playerInvestment: number
  let business: Business & { partnerBusinessId?: string }

  const businessType =
    template.type ??
    (template.id.startsWith('bus_')
      ? (template.id.replace('bus_', '') as BusinessType)
      : (template.id as BusinessType))

  if (partnerConfig) {
    // Partner purchase: player pays their share of the total cost
    playerInvestment = Math.round((totalCost * partnerConfig.playerShare) / 100)

    // Create business with partner info
    business = createBusinessObject({
      creationCost: { energy: -20 }, // Standard energy cost for starting with partner
      currentTurn,
      description: template.description,
      employeeRoles: template.employeeRoles,
      id: template.id,
      inventory: template.inventory,
      maxEmployees: template.maxEmployees,
      minEmployees: template.minEmployees ?? 1,
      monthlyExpenses: template.monthlyExpenses,
      monthlyIncome: template.monthlyIncome,
      name: template.name,
      openingQuarters: 0, // При покупке с партнером обычно уже готовый бизнес или открывается сразу
      price: template.price,
      quantity: template.quantity,
      totalCost: totalCost,
      type: businessType,
      upfrontCost: totalCost, // 100% оплачено
    })

    // Special initialization for partner businesses (from existing logic)
    business.playerRoles.managerialRoles = ['manager']
    business.hasInsurance = true
    business.insuranceCost = Math.round(totalCost * INSURANCE_COST_PERCENT) // 1% of total cost

    // Add partner specific data
    business.partners = [
      {
        id: partnerConfig.playerId ?? 'player',
        investedAmount: playerInvestment,
        name: partnerConfig.playerName ?? 'Вы',
        relation: 100,
        share: partnerConfig.playerShare,
        type: 'player',
      },
      {
        id: partnerConfig.partnerId,
        investedAmount: totalCost - playerInvestment,
        name: partnerConfig.partnerName,
        relation: 50,
        share: 100 - partnerConfig.playerShare,
        type: 'player',
      },
    ]
    business.playerShare = partnerConfig.playerShare
    business.playerInvestment = playerInvestment
    business.partnerId = partnerConfig.partnerId
    business.partnerName = partnerConfig.partnerName
    business.partnerBusinessId = partnerConfig.partnerBusinessId
  } else {
    // Solo purchase: always 100% for now as per current game design (upfrontPaymentPercentage ignored for solo)
    const upfrontPercent = 100
    playerInvestment = Math.round((totalCost * upfrontPercent) / 100)

    business = createBusinessObject({
      creationCost: { energy: -15 }, // Standard energy cost for solo start
      currentTurn,
      description: template.description,
      employeeRoles: template.employeeRoles,
      id: template.id,
      inventory: template.inventory,
      maxEmployees: template.maxEmployees,
      minEmployees: template.minEmployees ?? 1,
      monthlyExpenses: template.monthlyExpenses,
      monthlyIncome: template.monthlyIncome,
      name: template.name,
      openingQuarters: 0, // Бизнес становится активным сразу после покупки
      price: template.price,
      quantity: template.quantity,
      totalCost: totalCost,
      type: businessType,
      upfrontCost: playerInvestment,
    })
  }

  return {
    business,
    cost: playerInvestment,
  }
}
