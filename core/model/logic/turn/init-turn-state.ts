import { getCountry } from '@/core/lib/data-loaders/economy-loader'

import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'

export function initTurnState(ctx: TurnContext): TurnState {
  const prev = ctx.prev

  if (!prev.player) {
    throw new Error('initTurnState: player is missing in GameStore')
  }

  const player = structuredClone(prev.player)
  const country = prev.countries[player.countryId] ?? getCountry(player.countryId)

  return {
    // buffs
    buffs: player.personal.buffs,
    // business
    business: {
      totalExpenses: 0,
      totalIncome: 0,
      totalTax: 0,
    },
    countries: prev.countries,
    country,
    // finance
    financial: {
      adjustedNetProfit: 0,
      netProfit: 0,
      quarterlyReport: prev.player.quarterlyReport,
    },

    gameOverReason: null,
    gameStatus: prev.gameStatus,
    globalEvents: prev.globalEvents,
    globalMarketValue: 1,

    // history
    historyEntry: null,
    // economy
    inflationNotification: null,

    isAborted: false,
    // lifestyle
    lifestyle: {
      breakdown: {
        credits: 0,
        food: 0,
        housing: 0,
        mortgage: 0,
        other: 0,
        total: 0,
        transport: 0,
      },
      expenses: 0,
      modifiers: {},
    },
    // market
    marketEvents: prev.marketEvents,

    moneyDelta: 0,

    // system
    notifications: [],

    // jobs / education / freelance
    pendingApplications: prev.pendingApplications,

    pendingFreelanceApplications: prev.pendingFreelanceApplications,

    // snapshot
    player,
    protectedSkills: new Set(),
    statModifiers: {},

    // working stats
    stats: structuredClone(player.personal.stats),

    // meta
    turn: ctx.turn,

    year: ctx.year,
  }
}
