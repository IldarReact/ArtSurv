import type { Business } from './business.types'
import type { CountryEconomy, GlobalEvent } from './economy.types'
import type { Asset, Debt, QuarterlyReport } from './finance.types'
import type { ActiveFreelanceGig, FreelanceApplication } from './freelance.types'
import type { BusinessIdea } from './idea.types'
import type { Job, JobApplication } from './job.types'
import type { Notification } from './notification.types'
import type { PersonalLife } from './personal.types'
import type { StatEffect } from './stats.types'

export type GameStatus =
  | 'menu'
  | 'setup'
  | 'select_country'
  | 'select_character'
  | 'playing'
  | 'year_report'
  | 'ended'

export type GameOverReason =
  | 'DEATH' // Health = 0
  | 'MENTAL_BREAKDOWN' // Sanity = 0
  | 'DEGRADATION' // Intelligence = 0
  | 'DEPRESSION' // Happiness = 0
  | 'BANKRUPTCY' // Финансовый крах

export interface Player {
  // Freelance System
  activeFreelanceGigs: ActiveFreelanceGig[]
  freelanceGigs: unknown[] // From schema
  // Lifestyle System
  activeLifestyle: Partial<Record<string, string>> // category -> itemId
  age: number
  assets: Asset[]

  // Business System
  businesses: Business[]
  // Business Ideas System
  businessIdeas: BusinessIdea[]
  countryId: string
  creditScore: { value: number } | number
  debts: Debt[]

  happinessMultiplier: number

  // Housing System
  housingId: string // ID текущего жилья из housing.json

  id: string
  // New Job System
  currentJob: Job | null
  jobs: Job[]

  multipliers?: StatEffect
  name: string
  personal: PersonalLife
  quarterlyReport: QuarterlyReport

  quarterlySalary: number

  gender: 'male' | 'female' | 'other'
  avatar?: string

  stats: {
    money: number
    happiness: number
    energy: number
    sanity: number
    health: number
    intelligence: number
  }

  // Traits System
  traits: string[]
}

export interface HistoryEntry {
  eventDescription?: string
  happiness: number
  health: number
  netWorth: number
  turn: number
  year: number
}

export type ActivityType =
  | 'banking'
  | 'education'
  | 'events'
  | 'family'
  | 'investments'
  | 'leisure'
  | 'relocation'
  | 'shop'
  | 'work'

export interface GameState {
  activeActivity: ActivityType | null
  countries: Record<string, CountryEconomy>
  endReason: GameOverReason | null
  gameStatus: GameStatus
  globalEvents: GlobalEvent[]
  history: HistoryEntry[]
  isProcessingTurn: boolean
  // New fields
  notifications: Notification[]
  pendingApplications: JobApplication[]
  pendingEventNotification: GlobalEvent | null
  pendingFreelanceApplications: FreelanceApplication[]
  player: Player | null
  setupCountryId: string | null
  turn: number
  year: number
}
