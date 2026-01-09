import type { Progressable } from './progress.types'
import type { SkillRequirement } from './skill.types'
import type { StatEffect } from './stats.types'

export interface FreelanceGig {
  id: string
  title: string
  category: string
  description: string
  payment: number
  cost: StatEffect
  requirements: SkillRequirement[]
  imageUrl: string
  duration: number // Duration in quarters
}

export interface FreelanceApplication {
  id: string
  gigId: string
  title: string
  payment: number
  cost: StatEffect
  requirements: SkillRequirement[]
  duration: number // Duration in quarters
  daysPending?: number
}

export interface ActiveFreelanceGig extends Progressable {
  gigId: string
  payment: number
  cost: StatEffect
  requirements: SkillRequirement[]
  startedTurn: number
}
