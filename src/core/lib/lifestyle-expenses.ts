import { getShopItem } from '@/core/lib/shop-helpers'
import type { Player, FamilyMember } from '@/core/types'
import { getItemCost, isRecurringItem } from '@/core/types/shop.types'

export function calculateFoodExpenses(player: Player, costModifier = 1.0): number {
  let total = 0
  const countryId = player.countryId

  // Еда игрока (обязательно)
  const playerFoodId = player.activeLifestyle.food
  if (playerFoodId) {
    const item = getShopItem(playerFoodId, countryId)
    if (item) total += getItemCost(item) * costModifier
  }

  // Еда членов семьи
  player.personal.familyMembers.forEach((member) => {
    if (member.type === 'pet') return
    const foodId = member.foodPreference ?? 'food_homemade'
    const item = getShopItem(foodId, countryId)
    if (item) total += getItemCost(item) * costModifier
  })

  return Math.round(total)
}

export function calculateTransportExpenses(player: Player, costModifier = 1.0): number {
  let total = 0
  const countryId = player.countryId

  // Транспорт игрока (обязательно)
  const playerTransportId = player.activeLifestyle.transport
  if (playerTransportId) {
    const item = getShopItem(playerTransportId, countryId)
    if (item) total += getItemCost(item) * costModifier
  }

  // Транспорт членов семьи
  player.personal.familyMembers.forEach((member) => {
    const MIN_TRANSPORT_AGE = 10
    if (member.type === 'pet' || member.age < MIN_TRANSPORT_AGE) return
    const transportId = member.transportPreference ?? 'transport_public'
    const item = getShopItem(transportId, countryId)
    if (item) total += getItemCost(item) * costModifier
  })

  return Math.round(total)
}

export function calculateHousingExpenses(player: Player, costModifier = 1.0): number {
  const housingId = player.housingId
  if (!housingId) return 0

  const item = getShopItem(housingId, player.countryId)
  if (!item) return 0

  // Для рекуррентных (аренда) - costPerTurn
  // Для разовых (покупка) - maintenanceCost
  if (isRecurringItem(item)) {
    return item.costPerTurn * costModifier
  } else {
    return (item.maintenanceCost ?? 0) * costModifier
  }
}

export function calculateLifestyleExpenses(player: Player, costModifier = 1.0) {
  const food = calculateFoodExpenses(player, costModifier)
  const transport = calculateTransportExpenses(player, costModifier)
  const housing = calculateHousingExpenses(player, costModifier)

  let credits = 0
  for (const debt of player.debts) {
    if (debt.type !== 'mortgage') {
      credits += debt.quarterlyPayment || 0
    }
  }

  let mortgage = 0
  for (const debt of player.debts) {
    if (debt.type === 'mortgage') {
      mortgage += debt.quarterlyPayment || 0
    }
  }

  const other = 0

  return {
    credits,
    food,
    housing,
    mortgage,
    other,
    total: food + transport + housing + credits + mortgage + other,
    transport,
  }
}

export function calculateMemberExpenses(
  member: FamilyMember,
  countryId?: string,
  costModifier = 1.0,
): number {
  let total = 0

  // Питание
  if (member.type !== 'pet') {
    const foodId = member.foodPreference ?? 'food_homemade'
    const item = getShopItem(foodId, countryId)
    if (item) total += getItemCost(item) * costModifier
  }

  // Транспорт
  const MIN_TRANSPORT_AGE = 10
  if (member.type !== 'pet' && member.age >= MIN_TRANSPORT_AGE) {
    const transportId = member.transportPreference ?? 'transport_public'
    const item = getShopItem(transportId, countryId)
    if (item) total += getItemCost(item) * costModifier
  }

  // Другое (страховки, мелочи)
  const BASE_PARTNER_EXPENSES = 300
  const BASE_CHILD_EXPENSES = 500
  const BASE_PET_EXPENSES = 200

  if (member.type === 'wife' || member.type === 'husband') {
    total += BASE_PARTNER_EXPENSES * costModifier // Базовые расходы партнера
  } else if (member.type === 'child') {
    total += BASE_CHILD_EXPENSES * costModifier // Расходы на ребенка
  } else if (member.type === 'pet') {
    total += BASE_PET_EXPENSES * costModifier // Расходы на питомца
  }

  return Math.round(total)
}
