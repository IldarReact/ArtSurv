import type { InflationNotification } from '@/core/lib/calculations/inflation-engine'
import type { GameState, ActivityType } from '@/core/types'
import type { LifeEvent } from '@/core/types/life-history.types'

export interface GameSlice {
  activeActivity: ActivityType | null
  clearInflationNotification: () => void
  closeYearReport: () => void
  endReason: GameState['endReason']
  gameStatus: GameState['gameStatus']
  inflationNotification: InflationNotification | null
  initializeGame: (countryId: string, archetype: string) => void
  isProcessingTurn: boolean

  nextTurn: () => void
  resetGame: () => void
  recordLifeEvent: (event: LifeEvent) => void
  resolveCrisis: (actionType: string) => void
  setActiveActivity: (activity: ActivityType | null) => void
  // Actions
  setSetupCountry: (id: string) => void
  setupCountryId: string | null
  startSinglePlayer: () => void
  turn: number
  year: number
}
