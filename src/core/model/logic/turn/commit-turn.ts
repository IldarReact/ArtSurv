import { isQuarterEnd } from '@/core/lib/quarter'

import type { GameStore } from '../../slices/types'
import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'

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

  if (!Number.isFinite(nextMoney)) {
    // console.error('CRITICAL: Invalid money calculation in commitTurn', {
    //   currentMoney: state.player.stats.money,
    //   moneyDelta,
    //   netProfit,
    // })
    nextMoney = state.player.stats.money // Fallback to current money to avoid NaN
  }

  return {
    // economy
    countries: state.countries,
    endReason: state.gameOverReason,
    gameStatus: nextGameStatus,
    globalEvents: state.globalEvents,
    globalMarket: {
      description: `Фаза: ${state.country.cycle?.phase ?? 'unknown'}`,
      lastUpdatedTurn: nextTurn,
      trend: 'stable',
      value: state.globalMarketValue,
    },
    history: state.historyEntry ? [...ctx.prev.history, state.historyEntry] : ctx.prev.history,
    // inflation
    inflationNotification: state.inflationNotification,

    isProcessingTurn: false,

    marketEvents: state.marketEvents,
    // notifications
    notifications: state.notifications,

    // applications
    pendingApplications: state.pendingApplications,
    pendingFreelanceApplications: state.pendingFreelanceApplications,

    // player
    player: {
      ...state.player,

      personal: {
        ...state.player.personal,
        stats: state.stats,
      },
      quarterlyReport: state.financial.quarterlyReport,

      stats: {
        ...state.player.stats,
        ...state.stats, // ✅ SYNC: Применяем изменения статов (Health, Energy, etc.)
        money: nextMoney,
      },
    },

    // meta
    turn: nextTurn,

    year: nextYear,
  }
}
