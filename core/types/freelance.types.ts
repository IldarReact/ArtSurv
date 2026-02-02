import type { Progressable } from './progress.types'
import type { SkillRequirement } from './skill.types'
import type { StatEffect } from './stats.types'

export interface FreelanceGig {
  category: string
  cost: StatEffect
  description: string
  duration: number // Duration in quarters
  id: string
  imageUrl: string
  payment: number
  requirements: SkillRequirement[]
  title: string
}

export interface FreelanceApplication {
  cost: StatEffect
  daysPending?: number
  duration: number // Duration in quarters
  gigId: string
  id: string
  payment: number
  requirements: SkillRequirement[]
  title: string
}

export interface ActiveFreelanceGig extends Progressable {
  cost: StatEffect
  gigId: string
  payment: number
  requirements: SkillRequirement[]
  startedTurn: number
}
