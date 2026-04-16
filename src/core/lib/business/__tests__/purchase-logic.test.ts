import { describe, it, expect } from 'vitest'

import type { BusinessTemplate } from '../purchase-logic'
import { createBusinessPurchase } from '../purchase-logic'

describe('createBusinessPurchase', () => {
  const mockTemplate: BusinessTemplate = {
    description: 'A test business',
    employeeRoles: [],
    id: 'bus_retail',
    initialCost: 100000,
    inventory: undefined,
    maxEmployees: 5,
    minEmployees: 1,
    monthlyExpenses: 5000,
    monthlyIncome: 10000,
    name: 'Test Business',
    upfrontPaymentPercentage: 20,
  }

  const currentTurn = 1

  it('should create a solo business correctly with default upfront percentage', () => {
    const inflatedCost = 120000 // Inflation applied
    const result = createBusinessPurchase(mockTemplate, inflatedCost, currentTurn)

    // Check cost calculation - Always 100% per current logic
    expect(result.cost).toBe(120000)

    // Check business object
    expect(result.business.name).toBe('Test Business')
    expect(result.business.initialCost).toBe(120000)
    // If openingQuarters is 0 (as in createBusinessPurchase), openingProgress is undefined
    expect(result.business.openingProgress).toBeUndefined()
    expect(result.business.state).toBe('active')
    expect(result.business.partners).toEqual([])
  })

  it('should create a solo business correctly even if template has upfront percentage', () => {
    const templateWithCustomUpfront = { ...mockTemplate, upfrontPaymentPercentage: 50 }
    const inflatedCost = 100000
    const result = createBusinessPurchase(templateWithCustomUpfront, inflatedCost, currentTurn)

    // Should still be 100% because createBusinessPurchase ignores upfrontPaymentPercentage
    expect(result.cost).toBe(100000)
    expect(result.business.openingProgress).toBeUndefined()
    expect(result.business.state).toBe('active')
  })

  it('should create a partner business correctly', () => {
    const inflatedCost = 200000
    const partnerConfig = {
      partnerId: 'partner_1',
      partnerName: 'Partner Name',
      playerShare: 40, // Player pays 40%
    }

    const result = createBusinessPurchase(mockTemplate, inflatedCost, currentTurn, partnerConfig)

    // Check cost calculation for partner (full share)
    expect(result.cost).toBe(80000) // 40% of 200000

    // Check business object
    expect(result.business.name).toBe('Test Business')
    expect(result.business.initialCost).toBe(200000)
    expect(result.business.playerShare).toBe(40)
    expect(result.business.partners).toHaveLength(2)

    // Check partner details
    const playerPartner = result.business.partners.find(
      (p) => p.type === 'player' && p.share === 40,
    )
    const npcPartner = result.business.partners.find((p) => p.id === 'partner_1')

    expect(playerPartner).toBeDefined()
    expect(playerPartner?.investedAmount).toBe(80000)

    expect(npcPartner).toBeDefined()
    expect(npcPartner?.share).toBe(60)
    expect(npcPartner?.investedAmount).toBe(120000)
  })

  it('should handle ID prefixes correctly', () => {
    const templateWithPrefix = { ...mockTemplate, id: 'bus_retail' }
    const result = createBusinessPurchase(templateWithPrefix, 100000, currentTurn)

    expect(result.business.type).toBe('retail')
  })
})
