import { createDebt } from '@/core/lib/calculations/debt-helpers'
import { createEmptyQuarterlyReport } from '@/core/lib/calculations/financial-helpers'
import { getCharacterByArchetype } from '@/core/lib/data-loaders/characters-loader'
import { getStartingJob, getJobById } from '@/core/lib/data-loaders/jobs-loader'
import { NEUTRAL_RELATION } from '@/core/types/business.types'
import type { Player } from '@/core/types/game.types'
import type { Job } from '@/core/types/job.types'
import { LEVEL_0, LEVEL_5, type SkillLevel } from '@/core/types/skill.types'
import type { Stats } from '@/core/types/stats.types'

// Deprecated: use getCountry(id) instead

export function createInitialPlayer(archetype: string, countryId: string): Player {
  const characterData = getCharacterByArchetype(archetype, countryId)

  if (!characterData) {
    throw new Error(
      `Character data not found for archetype "${archetype}" in country "${countryId}"`,
    )
  }

  const baseStats: Stats = {
    energy: characterData.startingStats.energy,
    happiness: characterData.startingStats.happiness,
    health: characterData.startingStats.health,
    intelligence: characterData.startingStats.intelligence,
    money: characterData.startingMoney,
    sanity: characterData.startingStats.sanity,
  }

  const statEffect = {
    energy: baseStats.energy,
    happiness: baseStats.happiness,
    health: baseStats.health,
    intelligence: baseStats.intelligence,
    money: baseStats.money,
    sanity: baseStats.sanity,
  }

  // Получаем стартовую вакансию по ID из characters.json
  const startingJob = characterData.startingJobId
    ? getJobById(characterData.startingJobId, countryId)
    : getStartingJob(countryId, characterData.startingSkills)

  const DEFAULT_ENERGY_COST = -20
  const initialJob: Job = startingJob ?? {
    company: 'Start Corp',
    cost: {
      energy: DEFAULT_ENERGY_COST,
    },
    description: characterData.description,
    // Fallback если вакансий нет (не должно случиться)
    id: `job_${String(Date.now())}`,
    imageUrl: characterData.imageUrl,
    salary: characterData.startingSalary ?? 0,
    title: characterData.name,
  }

  const ID_SLICE_START = 2
  const ID_SLICE_END = 9
  const RANDOM_BASE_36 = 36
  const DEFAULT_AGE = 24
  const DEFAULT_CREDIT_SCORE = 650
  const QUARTERS_IN_YEAR = 3
  const base: Player = {
    activeFreelanceGigs: [],
    // Обязательные расходы (нельзя снизить до 0)
    activeLifestyle: {
      food: 'food_home', // Дефолт: готовит сам
      transport: 'tr_public', // Дефолт: общественный транспорт
    },
    age: DEFAULT_AGE,
    assets: [],

    businesses: [],

    businessIdeas: [],
    countryId,
    creditScore: { value: DEFAULT_CREDIT_SCORE },
    currentJob: null,
    debts: [],

    freelanceGigs: [],
    gender: characterData.gender ?? 'male',
    happinessMultiplier: -1,

    // Текущее жильё (обязательно)
    housingId: 'housing_room', // Дефолт: комната в аренде

    id: `player_${String(Date.now())}_${Math.random().toString(RANDOM_BASE_36).slice(ID_SLICE_START, ID_SLICE_END)}`,
    jobs: [],

    multipliers: {
      happiness: -1,
    },
    name: 'Player',
    personal: {
      activeCourses: [],

      activeUniversity: [],

      buffs: [],
      familyMembers: [],
      isDating: false,
      lifeGoals: [],
      potentialPartner: null,
      pregnancy: null,

      relations: {
        colleagues: NEUTRAL_RELATION,
        family: NEUTRAL_RELATION,
        friends: NEUTRAL_RELATION,
      },
      skills:
        characterData.startingSkills?.map((s) => ({
          ...s,
          lastPracticedTurn: -1,
          level: Math.min(LEVEL_5, Math.max(LEVEL_0, s.level)) as SkillLevel,
          progress: 0,
        })) ?? [],
      stats: { ...statEffect },
    },
    quarterlyReport: createEmptyQuarterlyReport(),

    quarterlySalary: (characterData.startingSalary ?? 0) * QUARTERS_IN_YEAR,

    stats: { ...baseStats },

    // Начальные черты (для теста)
    traits: characterData.startingTraits ?? ['ambitious'],
  }

  const finalState = { ...base }

  // Add starting debts if any
  if (characterData.startingDebts && characterData.startingDebts.length > 0) {
    characterData.startingDebts.forEach((debt) => {
      finalState.debts.push(
        createDebt({
          id: debt.id,
          interestRate: debt.interestRate,
          name: debt.name,
          principalAmount: debt.principalAmount,
          quarterlyPayment: debt.quarterlyPayment,
          remainingAmount: debt.remainingAmount,
          remainingQuarters: debt.remainingQuarters,
          startTurn: 0,
          termQuarters: debt.termQuarters,
          type: debt.type,
        }),
      )
    })
  }

  finalState.jobs = [initialJob]

  return finalState
}
