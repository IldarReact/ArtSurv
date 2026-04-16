// Family and personal life types

import type { Progressable } from './progress.types'
import type { StatEffect } from './stats.types'

export interface TimedBuff extends Progressable {
  description: string
  /** @deprecated use remainingDuration */
  duration: number
  effects: StatEffect
  id: string
  source: string
}

export interface PotentialPartner {
  age: number
  avatar?: string
  id: string
  income: number // Quarterly
  name: string
  occupation: string
}

export interface Pregnancy extends Progressable {
  isTwins: boolean
  motherId: string // ID of the mother (wife or player if female)
  /** @deprecated use remainingDuration */
  turnsLeft: number // 3 turns (9 months)
}

export interface FamilyMember {
  age: number
  avatar?: string
  employedInBusinessId?: string // ID бизнеса, где работает
  expenses: number // Quarterly expenses
  // Detailed expenses
  expensesBreakdown?: {
    food: number
    housing: number
    transport: number
    credits: number
    mortgage: number
    other: number
    total: number
  }
  // Lifestyle preferences (references to shop items)
  foodPreference?: string // ID товара из категории 'food'
  goals?: LifeGoal[] // Personal goals of the family member
  id: string
  income: number // Quarterly income contribution
  jobId?: string // ID работы из jobs.json для отображения деталей
  loyalty: number // 0-100, семейная лояльность
  name: string
  occupation?: string // Название работы (если работает не в бизнесе игрока)
  passiveEffects: StatEffect // Passive effects per turn

  relationLevel: number // 0-100
  // Traits
  traits?: string[] // IDs from human-traits.json

  transportPreference?: string // ID товара из категории 'transport'

  type: 'wife' | 'husband' | 'child' | 'pet' | 'parent' | 'friend' | 'colleague'
}

export interface LifeGoal {
  description: string
  id: string
  isCompleted: boolean
  progress: number
  requirements?: {
    cash?: number
    salary?: number
    jobTitle?: string
    skillLevel?: { skill: string; level: number }
    hasCar?: boolean
    hasHouse?: boolean
    hasFamily?: boolean
  }
  reward: {
    perTurnReward: StatEffect
    durationTurns: number // How long the reward lasts
  }
  target: number
  title: string
  type: 'dream' | 'goal'
}

export interface StatModifier {
  energy?: number
  happiness?: number
  health?: number
  intelligence?: number
  money?: number
  sanity?: number
  source: string
}

export interface StatModifiers {
  energy: StatModifier[]
  happiness: StatModifier[]
  health: StatModifier[]
  intelligence: StatModifier[]
  money: StatModifier[]
  sanity: StatModifier[]
}
