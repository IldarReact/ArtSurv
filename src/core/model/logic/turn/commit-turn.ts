import { FINAL_GAME_TURN } from '@/core/lib/game-duration'
import { isQuarterEnd } from '@/core/lib/quarter'
import { createAnnualSnapshot } from '@/core/model/history/life-history'

import type { GameStore } from '../../slices/types'
import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'

export function commitTurn(ctx: TurnContext, state: TurnState): Partial<GameStore> {
  const nextTurn = ctx.turn + 1
  const isYearEnd = isQuarterEnd(ctx.turn)
  const isFinalTurn = ctx.turn >= FINAL_GAME_TURN
  const nextYear = isYearEnd ? ctx.year + 1 : ctx.year

  let nextGameStatus = state.gameStatus
  if (isFinalTurn && nextGameStatus === 'playing') {
    nextGameStatus = 'ended'
  } else if (isYearEnd && nextGameStatus === 'playing') {
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

  const annualSnapshot = isYearEnd
    ? createAnnualSnapshot(state.player, state.stats, nextMoney, ctx.turn, ctx.year)
    : null
  const history = annualSnapshot !== null ? [...ctx.prev.history, annualSnapshot] : ctx.prev.history
  const lifeEvents = [...ctx.prev.lifeEvents]
  const existingLifeEventIds = new Set(lifeEvents.map((event) => event.id))
  for (const event of state.lifeEvents) {
    if (!existingLifeEventIds.has(event.id)) {
      existingLifeEventIds.add(event.id)
      lifeEvents.push(event)
    }
  }

  return {
    // economy
    countries: state.countries,
    endReason: state.gameOverReason ?? (isFinalTurn ? 'COMPLETED' : ctx.prev.endReason),
    gameStatus: nextGameStatus,
    globalEvents: state.globalEvents,
    globalMarket: {
      description: `Фаза: ${state.country.cycle?.phase ?? 'unknown'}`,
      lastUpdatedTurn: nextTurn,
      trend: 'stable',
      value: state.globalMarketValue,
    },
    history,
    // inflation
    inflationNotification: state.inflationNotification,
    isProcessingTurn: false,

    lifeEvents,

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
