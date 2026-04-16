import type { Player } from '@/core/types'
import type { StatChangeEffect, StatEffect } from '@/core/types/stats.types'

export interface PlayerSlice {
  // Actions
  applyStatChanges: (effect: StatEffect) => void
  applyStatChangeEffect: (effect: StatChangeEffect) => void

  performTransaction: (
    cost: StatEffect,
    options?: { requireFunds?: boolean; title?: string },
  ) => boolean

  player: Player | null
  updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => void
}
