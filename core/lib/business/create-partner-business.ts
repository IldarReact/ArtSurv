import type { Business, BusinessType, BusinessRoleTemplate, BusinessInventory } from '@/core/types'

import { createBusinessPurchase } from './purchase-logic'

const DEFAULT_MAX_EMPLOYEES = 25

export function createPartnerBusiness(
  offer: {
    details: {
      businessName: string
      businessType: BusinessType
      businessDescription: string
      totalCost: number
      yourInvestment: number
      yourShare: number
      businessId?: string
      monthlyIncome?: number
      monthlyExpenses?: number
      maxEmployees?: number
      minEmployees?: number
      employeeRoles: BusinessRoleTemplate[]
      inventory?: BusinessInventory
    }
    fromPlayerId: string
    fromPlayerName: string
  },
  currentTurn: number,
  playerId: string,
  isInitiator = false,
): Business & { partnerBusinessId?: string } {
  const now = Date.now()
  const businessId = offer.details.businessId ?? `biz_${String(now)}`
  const partnerBusinessId = isInitiator ? undefined : `biz_${String(now + 1)}`

  const { business } = createBusinessPurchase(
    {
      description: offer.details.businessDescription,
      employeeRoles: offer.details.employeeRoles,
      id: businessId,
      initialCost: offer.details.totalCost, // Use totalCost as initialCost for the purchase logic
      inventory: offer.details.inventory,
      maxEmployees: offer.details.maxEmployees ?? DEFAULT_MAX_EMPLOYEES,
      minEmployees: offer.details.minEmployees,
      monthlyExpenses: offer.details.monthlyExpenses ?? 0,
      monthlyIncome: offer.details.monthlyIncome ?? 0,
      name: offer.details.businessName,
      type: offer.details.businessType,
    },
    offer.details.totalCost,
    currentTurn,
    {
      initialState: 'active', // Partner businesses in this flow are usually active immediately
      partnerBusinessId,
      partnerId: offer.fromPlayerId,
      partnerName: offer.fromPlayerName,
      playerId,
      playerName: 'Вы', // We can still use 'Вы' for the current player's display name
      playerShare: offer.details.yourShare,
    },
  )

  return business
}
