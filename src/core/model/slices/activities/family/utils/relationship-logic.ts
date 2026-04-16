import { FAMILY_PRICES } from '@/core/lib/calculations/family-prices'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import { normalizeDurationMonths } from '@/core/lib/stats/stat-change-format'
import { PREGNANCY_DURATION_MONTHS } from '@/core/lib/time/constants'
import type { Player, Country, FamilyMember } from '@/core/types'

import { createPartner, createPet } from './member-factory'

export const processStartDating = (player: Player, countries: Record<string, Country>) => {
  const energy = player.personal.stats.energy
  const money = player.stats.money

  const economy = countries[player.countryId]
  const datingCost = getInflatedPrice(FAMILY_PRICES.DATING_SEARCH, economy, 'services')

  if (energy < FAMILY_PRICES.DATING_ENERGY_COST || money < datingCost) return null

  return {
    energy: FAMILY_PRICES.DATING_ENERGY_COST,
    money: datingCost,
  }
}

export const processAcceptPartner = (
  player: Player,
  countries: Record<string, Country>,
  calculateMemberExpenses: (member: FamilyMember, countryId: string, modifier: number) => number,
) => {
  if (!player.personal.potentialPartner) return null

  const partner = player.personal.potentialPartner
  const economy = countries[player.countryId]

  const jobs = [
    { id: 'job_worker_start', income: 3000, title: 'Рабочий' },
    { id: 'job_indebted_start', income: 18000, title: 'Офисный работник' },
    { id: 'job_marketing', income: 22500, title: 'Digital Marketing Specialist' },
  ]
  const partnerJob = jobs.find((j) => j.title === partner.occupation) ?? jobs[0]

  const newMember = createPartner(partner, partnerJob)
  const costModifier = economy.costOfLivingModifier
  newMember.expenses = calculateMemberExpenses(newMember, player.countryId, costModifier)

  return {
    newMember,
    partnerName: partner.name,
  }
}

export const processTryForBaby = (player: Player) => {
  const hasPartner = player.personal.familyMembers.some(
    (m) => m.type === 'wife' || m.type === 'husband',
  )

  if (!hasPartner) return null

  const normalizedDuration = normalizeDurationMonths(PREGNANCY_DURATION_MONTHS)

  return {
    pregnancy: {
      id: `pregnancy_${String(Date.now())}`,
      isTwins: Math.random() < 0.1,
      motherId: 'wife',
      remainingDuration: normalizedDuration,
      title: 'Беременность',
      totalDuration: normalizedDuration,
      turnsLeft: normalizedDuration,
    },
  }
}

export const processAdoptPet = (
  player: Player,
  countries: Record<string, Country>,
  cost: number,
  name: string,
) => {
  if (player.stats.money < cost) return null

  const economy = countries[player.countryId]
  const petExpenses = getInflatedPrice(FAMILY_PRICES.PET_QUARTERLY_EXPENSES, economy, 'services')

  const newPet = createPet(name, petExpenses)

  return {
    cost,
    newPet,
  }
}
