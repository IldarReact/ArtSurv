import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import { getShopItem } from '@/core/lib/shop-helpers'
import type { CountryEconomy, Player } from '@/core/types'
import { getItemCost } from '@/core/types/shop.types'

/**
 * Calculates total income from all family members, adjusted for inflation.
 */
export function calculateFamilyIncome(player: Player, country: CountryEconomy | undefined) {
  return player.personal.familyMembers.reduce((sum, m) => {
    if (!m.income) return sum
    const inflatedIncome = country ? getInflatedPrice(m.income, country, 'salaries') : m.income
    return sum + inflatedIncome
  }, 0)
}

/**
 * Calculates financials for all businesses owned by the player.
 */
export function calculateBusinessFinancials(player: Player) {
  let businessRevenue = 0
  let businessExpenses = 0
  let businessTaxes = 0
  player.businesses.forEach((b) => {
    const sharePct = typeof b.playerShare === 'number' ? b.playerShare : 100
    const shareFactor = Math.max(0, Math.min(100, sharePct)) / 100
    businessRevenue += Math.round(b.quarterlyIncome * shareFactor)
    businessExpenses += Math.round(b.quarterlyExpenses * shareFactor)
    businessTaxes += Math.round(b.quarterlyTax * shareFactor)
  })
  return { businessExpenses, businessRevenue, businessTaxes }
}

/**
 * Calculates total food expenses for the player and family members.
 */
export function calculateFoodExpenses(player: Player, country: CountryEconomy | undefined) {
  let foodExpenses = 0
  const playerFood = player.activeLifestyle.food
    ? getShopItem(player.activeLifestyle.food, player.countryId)
    : null
  if (playerFood) {
    const basePrice = getItemCost(playerFood)
    foodExpenses += country ? getInflatedPrice(basePrice, country, 'food') : basePrice
  }
  player.personal.familyMembers.forEach((m) => {
    if (m.type === 'pet') return
    const foodId = m.foodPreference ?? 'food_homemade'
    const item = getShopItem(foodId, player.countryId)
    if (item) {
      const basePrice = getItemCost(item)
      foodExpenses += country ? getInflatedPrice(basePrice, country, 'food') : basePrice
    }
  })
  return foodExpenses
}

/**
 * Calculates housing expenses (rent or maintenance).
 */
export function calculateHousingExpenses(player: Player, country: CountryEconomy | undefined) {
  const housing = player.housingId ? getShopItem(player.housingId, player.countryId) : null
  if (!housing) return 0
  if (housing.isRecurring) {
    const basePrice = housing.costPerTurn
    return country ? getInflatedPrice(basePrice, country, 'housing') : basePrice
  }
  const baseMaintenance = housing.maintenanceCost ?? 0
  return country ? getInflatedPrice(baseMaintenance, country, 'housing') : baseMaintenance
}

/**
 * Calculates transport expenses for player and family members.
 */
export function calculateTransportExpenses(player: Player, country: CountryEconomy | undefined) {
  const transport = player.activeLifestyle.transport
    ? getShopItem(player.activeLifestyle.transport, player.countryId)
    : null
  if (!transport) return 0
  const baseCost = getItemCost(transport)
  const inflatedCost = country ? getInflatedPrice(baseCost, country, 'transport') : baseCost
  let commutersCount = 1
  player.personal.familyMembers.forEach((m) => {
    if (m.type !== 'pet' && m.age >= 10) commutersCount++
  })
  return inflatedCost * commutersCount
}
