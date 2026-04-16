import type { Debt } from './finance.types'
import type { Stats } from './stats.types'

export interface CharacterSkill {
  id: string
  level: number
  name: string
}

export interface CharacterDebt {
  id: string
  interestRate: number
  name: string
  principalAmount: number
  quarterlyPayment: number
  remainingAmount: number
  remainingQuarters: number
  termQuarters: number
  type: Debt['type']
}

export interface CharacterData {
  archetype: string
  description: string
  id: string
  imageUrl: string
  name: string
  startingDebts?: CharacterDebt[]
  startingJobId?: string
  startingMoney: number
  startingSalary?: number
  startingSkills?: CharacterSkill[]
  startingStats: Omit<Stats, 'money'>
  startingTraits?: string[]
  gender?: 'male' | 'female' | 'other'
}
