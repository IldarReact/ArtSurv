// Player and personal life state types
import type { TimedBuff, FamilyMember, LifeGoal, PotentialPartner, Pregnancy } from './family.types'
import type { Skill, ActiveCourse, ActiveUniversity } from './skill.types'
import type { Stats } from './stats.types'

export interface PersonalLife {
  activeCourses: ActiveCourse[]
  activeUniversity: ActiveUniversity[]
  buffs: TimedBuff[]
  // New Family & Goals System
  familyMembers: FamilyMember[]
  // Relationship System
  isDating: boolean
  lifeGoals: LifeGoal[]

  potentialPartner: PotentialPartner | null
  pregnancy: Pregnancy | null

  relations: {
    family: number
    friends: number
    colleagues: number
  }
  skills: Skill[]
  stats: Stats
}
