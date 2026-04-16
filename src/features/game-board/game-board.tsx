'use client'

import { useGameStore } from '@/core/model/store'
import type { GameStatus } from '@/core/types'
import { GameEnd } from '@/src/features/end/components'
import { EventModal } from '@/src/features/events/event-modal'
import { ActivityNavigation, ActivityContent } from '@/src/features/gameplay/components'
import { MainMenu } from '@/src/features/menu/main-menu'
import { YearReportModal } from '@/src/features/reports/year-report-modal'
import { WorldSelect, CharacterSelect } from '@/src/features/setup/components'
import { TopStatusBar } from '@/shared/components/top-bar/top-status-bar'

const GameplayScreen = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <TopStatusBar />
    <div className="flex flex-1 overflow-hidden">
      <ActivityNavigation />
      <div className="flex-1 overflow-auto">
        <ActivityContent />
      </div>
    </div>
    <EventModal />
  </div>
)

const GameEndScreenWrapper = () => (
  <div className="min-h-screen bg-background">
    <GameEnd />
  </div>
)

const SCREENS: Record<GameStatus, React.ComponentType> = {
  ended: GameEndScreenWrapper,
  menu: MainMenu,
  playing: GameplayScreen,
  select_character: CharacterSelect,
  select_country: WorldSelect, // Alias keeping consistent with setup
  setup: WorldSelect,
  year_report: YearReportModal,
}

export function GameBoard() {
  const { gameStatus } = useGameStore()

  const Screen = SCREENS[gameStatus]
  return <Screen />
}
