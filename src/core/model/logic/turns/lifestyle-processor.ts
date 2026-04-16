import { getShopItemById } from '@/core/lib/data-loaders/shop-loader'
import { calculateMemberExpenses } from '@/core/lib/lifestyle-expenses'
import { calculateLifestyleExpenses } from '@/core/lib/lifestyle-expenses'
import type { CountryEconomy, Player, FamilyMember } from '@/core/types'
import traitsData from '@/shared/data/world/commons/human-traits.json'

/**
 * Breakdown of lifestyle expenses.
 * This is a subset of ExpensesBreakdown used for lifestyle processing.
 */
export interface LifestyleExpensesBreakdown {
  credits: number
  food: number
  housing: number
  mortgage: number
  other: number
  total: number
  transport: number
}

interface LifestyleResult {
  lifestyleExpenses: number
  lifestyleExpensesBreakdown: LifestyleExpensesBreakdown
  modifiers: {
    happiness: number
    health: number
    energy: number
    sanity: number
    intelligence: number
  }
  updatedFamilyMembers: FamilyMember[]
}

/**
 * Рассчитывает модификаторы от жилья
 */
function calculateHousingModifiers(player: Player) {
  let happiness = 0
  let health = 0
  let sanity = 0
  let intelligence = 0

  if (!player.housingId) return { happiness, health, intelligence, sanity }

  const housing = getShopItemById(player.housingId, player.countryId)
  if (housing?.effects) {
    if (housing.effects.happiness) happiness += housing.effects.happiness
    if (housing.effects.sanity) sanity += housing.effects.sanity
    if (housing.effects.health) health += housing.effects.health
  }

  // Overcrowding penalty
  if (housing && 'capacity' in housing && housing.capacity) {
    const familySize = 1 + player.personal.familyMembers.length
    const capacity = housing.capacity ?? 2

    if (familySize > capacity) {
      const overcrowdingPercent = ((familySize - capacity) / capacity) * 100
      // Formula: -1 per 10% overcrowding (rounded up)
      const penalty = Math.ceil(overcrowdingPercent / 10)

      happiness -= penalty
      sanity -= penalty
      intelligence -= Math.floor(penalty / 2)
    }
  }

  return { happiness, health, intelligence, sanity }
}

/**
 * Рассчитывает модификаторы от предметов (еда, транспорт)
 */
function calculateItemModifiers(itemId: string | undefined, countryId: string) {
  let happiness = 0
  let health = 0
  let energy = 0
  let sanity = 0
  let intelligence = 0

  if (!itemId) return { energy, happiness, health, intelligence, sanity }

  const item = getShopItemById(itemId, countryId)
  if (item?.effects) {
    if (item.effects.happiness) happiness += item.effects.happiness
    if (item.effects.health) health += item.effects.health
    if (item.effects.energy) energy += item.effects.energy
    if (item.effects.sanity) sanity += item.effects.sanity
    if (item.effects.intelligence) intelligence += item.effects.intelligence
  }

  return { energy, happiness, health, intelligence, sanity }
}

/**
 * Рассчитывает модификаторы от черт характера
 */
function calculateTraitModifiers(player: Player) {
  let happiness = 0
  let health = 0
  let sanity = 0
  let intelligence = 0

  player.traits.forEach((traitId: string) => {
    const trait = traitsData.find((t) => t.id === traitId)
    if (trait?.effects) {
      if (trait.effects.happiness) happiness += trait.effects.happiness
      if (trait.effects.health) health += trait.effects.health
      if (trait.effects.sanity) sanity += trait.effects.sanity
      if (trait.effects.intelligence) intelligence += trait.effects.intelligence
    }
  })

  return { happiness, health, intelligence, sanity }
}

/**
 * Рассчитывает модификаторы состояния игрока на основе его образа жизни
 */
function calculateLifestyleModifiers(player: Player) {
  const housingMods = calculateHousingModifiers(player)
  const foodMods = calculateItemModifiers(player.activeLifestyle.food, player.countryId)
  const transportMods = calculateItemModifiers(player.activeLifestyle.transport, player.countryId)
  const traitMods = calculateTraitModifiers(player)

  return {
    energy: foodMods.energy + transportMods.energy,
    happiness:
      housingMods.happiness + foodMods.happiness + transportMods.happiness + traitMods.happiness,
    health: housingMods.health + foodMods.health + transportMods.health + traitMods.health,
    intelligence:
      housingMods.intelligence +
      foodMods.intelligence +
      transportMods.intelligence +
      traitMods.intelligence,
    sanity: housingMods.sanity + foodMods.sanity + transportMods.sanity + traitMods.sanity,
  }
}

export function processLifestyle(
  player: Player,
  countries: Record<string, CountryEconomy>,
): LifestyleResult {
  const countryId = player.countryId
  const country = countries[countryId]
  const costModifier = country.costOfLivingModifier

  const familyMembers = player.personal.familyMembers

  const updatedFamilyMembers = familyMembers.map((member: FamilyMember) => {
    const memberExpenses = calculateMemberExpenses(member, player.countryId, costModifier)
    return {
      ...member,
      expenses: memberExpenses,
    }
  })

  const playerWithUpdatedMembers = {
    ...player,
    personal: {
      ...player.personal,
      familyMembers: updatedFamilyMembers,
    },
  }

  const lifestyleExpensesBreakdown = calculateLifestyleExpenses(
    playerWithUpdatedMembers,
    costModifier,
  )
  const lifestyleExpenses = lifestyleExpensesBreakdown.total

  // Calculate modifiers from housing/food/transport/traits
  const modifiers = calculateLifestyleModifiers(player)

  return {
    lifestyleExpenses,
    lifestyleExpensesBreakdown,
    modifiers,
    updatedFamilyMembers,
  }
}
