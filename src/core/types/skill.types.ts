import type { Progressable } from './progress.types'

export const LEVEL_0 = 0
export const LEVEL_1 = 1
export const LEVEL_2 = 2
export const LEVEL_3 = 3
export const LEVEL_4 = 4
export const LEVEL_5 = 5

// Skill level is now represented by stars: 0-5
export type SkillLevel =
  | typeof LEVEL_0
  | typeof LEVEL_1
  | typeof LEVEL_2
  | typeof LEVEL_3
  | typeof LEVEL_4
  | typeof LEVEL_5

export interface SkillRequirement {
  minLevel: SkillLevel
  skillId: string
}

export interface SkillDefinition {
  category?: 'technical' | 'creative' | 'social' | 'physical' | 'language'
  description: string
  id: string
  maxLevel?: number
  name: string
}

export interface Skill {
  id: string
  isBeingStudied?: boolean // Protected from decay while studying
  isBeingUsedAtWork?: boolean // Protected from decay and gains XP while working
  lastPracticedTurn: number // Turn number when skill was last used/studied
  level: SkillLevel // 0-5 stars
  name: string
  progress: number // 0-100 progress to next level
}

export interface ActiveCourse extends Progressable {
  courseName: string // Deprecated: use title from Progressable
  skillBonus: number
  skillName: string
  startedTurn: number
}

export interface ActiveUniversity extends Progressable {
  programName: string // Deprecated: use title from Progressable
  skillBonus: number
  skillName: string
  startedTurn: number
}
