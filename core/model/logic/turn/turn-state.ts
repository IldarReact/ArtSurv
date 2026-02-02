import type { InflationNotification } from '@/core/lib/calculations/inflation-engine'
import type {
  Player,
  Notification,
  JobApplication,
  FreelanceApplication,
  MarketEvent,
  QuarterlyReport,
  Stats,
  TimedBuff,
  GameStatus,
  GameOverReason,
  HistoryEntry,
} from '@/core/types'
import type { CountryEconomy, GlobalEvent } from '@/core/types/economy.types'

export interface TurnState {
  // buffs
  buffs: TimedBuff[]
  // business (aggregated result of turn)
  business: {
    totalIncome: number
    totalExpenses: number
    totalTax: number
  }
  countries: Record<string, CountryEconomy>
  country: CountryEconomy
  // finance
  financial: {
    quarterlyReport: QuarterlyReport
    netProfit: number
    adjustedNetProfit: number
  }

  gameOverReason: GameOverReason | null
  gameStatus: GameStatus
  globalEvents: GlobalEvent[]
  globalMarketValue: number

  // history
  historyEntry: HistoryEntry | null
  // economy
  inflationNotification: InflationNotification | null

  isAborted: boolean
  // lifestyle
  lifestyle: {
    expenses: number
    breakdown: {
      food: number
      housing: number
      transport: number
      credits: number
      mortgage: number
      other: number
      total: number
    }
    modifiers: Partial<Stats>
  }
  // market
  marketEvents: MarketEvent[]

  moneyDelta: number

  // system
  notifications: Notification[]

  // jobs / education / freelance
  pendingApplications: JobApplication[]

  pendingFreelanceApplications: FreelanceApplication[]

  // snapshot
  player: Player
  protectedSkills: Set<string>
  statModifiers: Partial<Stats> & { income?: number }

  // working stats (before commit)
  stats: Stats

  // meta
  turn: number

  year: number
}
