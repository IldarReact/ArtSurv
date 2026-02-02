import type { HistoryEntry } from '@/core/types'

import type { TurnStep } from './step.types'

export const historyStep: TurnStep = (ctx, state) => {
  let totalAssetValue = 0
  for (const a of state.player.assets) {
    totalAssetValue += a.currentValue
  }

  const entry: HistoryEntry = {
    happiness: state.stats.happiness,
    health: state.stats.health,
    netWorth: state.stats.money + totalAssetValue,
    turn: ctx.turn,
    year: ctx.year,
  }

  state.historyEntry = entry
}
