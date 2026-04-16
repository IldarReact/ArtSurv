import type { FamilyMember, PotentialPartner } from '@/core/types'

const DEFAULT_LOYALTY = 100
const DEFAULT_RELATION = 50
const PET_RELATION = 80

const PET_HAPPINESS_BONUS = 2
const HUMAN_HAPPINESS_BONUS = 5
const PET_SANITY_BONUS = 3
const HUMAN_SANITY_BONUS = 1

const PARTNER_HAPPINESS_BONUS = 5
const PARTNER_SANITY_BONUS = 2

export const createNewMember = (
  name: string,
  type: FamilyMember['type'],
  age: number,
  income: number,
  expenses: number,
): FamilyMember => ({
  age,
  expenses,
  foodPreference: type === 'pet' ? undefined : 'food_homemade',
  id: `family_${String(Date.now())}`,
  income,
  loyalty: DEFAULT_LOYALTY,
  name,
  passiveEffects: {
    happiness: type === 'pet' ? PET_HAPPINESS_BONUS : HUMAN_HAPPINESS_BONUS,
    health: 0,
    sanity: type === 'pet' ? PET_SANITY_BONUS : HUMAN_SANITY_BONUS,
  },
  relationLevel: DEFAULT_RELATION,
  type,
})

export const createPet = (name: string, petExpenses: number): FamilyMember => ({
  age: 1,
  expenses: petExpenses,
  id: `pet_${String(Date.now())}`,
  income: 0,
  loyalty: DEFAULT_LOYALTY,
  name,
  passiveEffects: {
    happiness: PET_HAPPINESS_BONUS,
    health: 0,
    sanity: PET_SANITY_BONUS,
  },
  relationLevel: PET_RELATION,
  type: 'pet',
})

export const createPartner = (
  partner: PotentialPartner,
  partnerJob: { id: string; title: string; income: number },
): FamilyMember => ({
  age: partner.age,
  expenses: 0,
  foodPreference: 'food_homemade',
  id: partner.id,
  income: partner.income,
  jobId: partnerJob.id,
  loyalty: DEFAULT_LOYALTY,
  name: partner.name,
  occupation: partner.occupation,
  passiveEffects: {
    happiness: PARTNER_HAPPINESS_BONUS,
    health: 0,
    sanity: PARTNER_SANITY_BONUS,
  },
  relationLevel: DEFAULT_RELATION,
  type: 'wife',
})
