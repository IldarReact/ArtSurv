// Job-related types
import type { SkillRequirement } from './skill.types'
import type { StatEffect } from './stats.types'

export interface JobRequirements {
  education?: string
  experience?: number
  skills?: { name: string; level: number }[]
}

export interface Job {
  category?: string
  company: string
  cost: StatEffect
  description?: string
  id: string
  imageUrl: string
  requirements?: JobRequirements
  salary: number // Monthly salary
  startedTurn?: number
  title: string
}

export interface JobApplication {
  company: string
  cost: StatEffect
  daysPending: number
  id: string
  jobTitle: string
  requirements: SkillRequirement[]
  salary: number
}
