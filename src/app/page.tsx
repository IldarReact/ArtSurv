'use client'

// Утилита для очистки сохранений (доступна в консоли браузера)
import '@/core/lib/persistence/clear-saves'

import { useGameStore } from '@/core/model/store'
import { NotificationsToast } from '@/shared/components/notifications-toast'
import { TopStatusBar } from '@/shared/components/top-bar/top-status-bar'
import { GameEnd } from '@/src/features/end/components'
import { EventModal } from '@/src/features/events/event-modal'
import { ActivityNavigation, ActivityContent } from '@/src/features/gameplay/components'
import { MainMenu } from '@/src/features/menu/main-menu'
import { MultiplayerHud } from '@/src/features/multiplayer/multiplayer-hub'
import { useOffersSync } from '@/src/features/multiplayer/use-offers-sync'
import { OffersList } from '@/src/features/notifications/offers-list'
import { YearReportModal } from '@/src/features/reports/year-report-modal'
import { CharacterSelect } from '@/src/features/setup/components'
import { WorldSelect } from '@/src/features/setup/components'

export default function Page() {
  const { gameStatus } = useGameStore()

  // Sync offers (multiplayer)
  useOffersSync()

  // Main Menu
  if (gameStatus === 'menu') {
    return <MainMenu />
  }

  // Setup Phase
  if (gameStatus === 'setup') {
    return <WorldSelect />
  }

  if (gameStatus === 'select_character') {
    return <CharacterSelect />
  }

  // Game End
  if (gameStatus === 'ended') {
    return (
      <div className="min-h-screen bg-background">
        <GameEnd />
      </div>
    )
  }

  // Main Gameplay
  return (
    <div className="min-h-screen flex flex-col">
      <TopStatusBar />
      <div className="flex flex-1 overflow-hidden">
        <ActivityNavigation />
        <div className="flex-1 overflow-auto">
          <ActivityContent />
        </div>
      </div>
      <EventModal />
      <YearReportModal />

      {/* Notifications & Overlays */}
      <NotificationsToast />
      <OffersList />

      {/* Multiplayer */}
      <MultiplayerHud />
    </div>
  )
}
