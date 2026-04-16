import { createEmptyQuarterlyReport } from '@/core/lib/calculations/financial-helpers'
import type { Player } from '@/core/types'
import type { Stats } from '@/core/types/stats.types'

export const createMockPlayer = (overrides?: Partial<Player>): Player => {
  const baseStats: Stats = {
    energy: 100,
    happiness: 100,
    health: 100,
    intelligence: 100,
    money: 50000,
    sanity: 100,
  }

  return {
    activeFreelanceGigs: [],
    activeLifestyle: {},
    age: 25,
    assets: [],
    businesses: [],
    businessIdeas: [],
    countryId: 'us',
    creditScore: { value: 650 },
    currentJob: null,

    debts: [],

    freelanceGigs: [],
    gender: 'male',

    happinessMultiplier: 1,
    housingId: 'housing_room',

    id: 'test',

    jobs: [],
    multipliers: {
      happiness: 1,
    },

    name: 'Test Player',
    personal: {
      activeCourses: [],

      activeUniversity: [],
      buffs: [],
      familyMembers: [],
      isDating: false,
      lifeGoals: [],
      potentialPartner: null,
      pregnancy: null,

      relations: { colleagues: 50, family: 50, friends: 50 },
      skills: [],
      stats: {
        energy: baseStats.energy,
        happiness: baseStats.happiness,
        health: baseStats.health,
        intelligence: baseStats.intelligence,
        money: 0, // Personal stats don't track money separately
        sanity: baseStats.sanity,
      },
    },
    quarterlyReport: createEmptyQuarterlyReport(),
    quarterlySalary: 150000,
    // ✅ Новая система статов
    stats: { ...baseStats },
    traits: [],

    ...overrides,
  }
}
