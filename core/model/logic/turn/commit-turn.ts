import type { GameStore } from '../../slices/types'

import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'

import { isQuarterEnd } from '@/core/lib/quarter'

export function commitTurn(ctx: TurnContext, state: TurnState): Partial<GameStore> {
  const nextTurn = ctx.turn + 1
  const isYearEnd = isQuarterEnd(ctx.turn)
  const nextYear = isYearEnd ? ctx.year + 1 : ctx.year

  let nextGameStatus = state.gameStatus
  if (isYearEnd && nextGameStatus === 'playing') {
    nextGameStatus = 'year_report'
  }

  // Safety check for money
  const netProfit = state.financial.adjustedNetProfit || 0
  const moneyDelta = state.moneyDelta || 0
  let nextMoney = state.player.stats.money + netProfit + moneyDelta

  if (isNaN(nextMoney) || !isFinite(nextMoney)) {
    console.error('CRITICAL: Invalid money calculation in commitTurn', {
      currentMoney: state.player.stats.money,
      netProfit,
      moneyDelta,
    })
    nextMoney = state.player.stats.money // Fallback to current money to avoid NaN
  }

  return {
    // meta
    turn: nextTurn,
    year: nextYear,
    isProcessingTurn: false,
    gameStatus: nextGameStatus,
    endReason: state.gameOverReason,
    globalEvents: state.globalEvents,
    history: state.historyEntry ? [...ctx.prev.history, state.historyEntry] : ctx.prev.history,

    // player
    player: {
      ...state.player,

      stats: {
        ...state.player.stats,
        ...state.stats, // ✅ SYNC: Применяем изменения статов (Health, Energy, etc.)
        money: nextMoney,
      },

      personal: {
        ...state.player.personal,
        stats: state.stats,
      },
    },

    // economy
    countries: state.countries,
    marketEvents: state.marketEvents,

    // applications
    pendingApplications: state.pendingApplications,

    globalMarket: {
      value: state.globalMarketValue,
      description: `Фаза: ${state.country.cycle?.phase ?? 'unknown'}`,
      trend: 'stable',
      lastUpdatedTurn: nextTurn,
    },

    // notifications
    notifications: state.notifications,

    // inflation
    inflationNotification: state.inflationNotification,
  }
}
