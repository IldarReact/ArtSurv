import { describe, expect, it } from 'vitest'

import { statEffectsStep } from '@/core/model/logic/steps/stat-effects.step'
import type { TurnState } from '@/core/model/logic/turn/turn-state'

function createState(): TurnState {
  return {
    buffs: [],
    business: { totalExpenses: 0, totalIncome: 0, totalTax: 0 },
    countries: {},
    country: {} as TurnState['country'],
    financial: {
      adjustedNetProfit: 0,
      netProfit: 0,
      quarterlyReport: {} as TurnState['financial']['quarterlyReport'],
    },
    gameOverReason: null,
    gameStatus: 'playing',
    globalEvents: [],
    globalMarketValue: 1,
    historyEntry: null,
    inflationNotification: null,
    isAborted: false,
    lifestyle: {
      breakdown: { credits: 0, food: 0, housing: 0, mortgage: 0, other: 0, total: 0, transport: 0 },
      expenses: 0,
      modifiers: {},
    },
    marketEvents: [],
    moneyDelta: 0,
    notifications: [],
    pendingApplications: [],
    pendingFreelanceApplications: [],
    pendingStatEffects: [],
    player: {
      activeStatEffects: [],
    } as TurnState['player'],
    protectedSkills: new Set(),
    statModifiers: {},
    stats: {
      energy: 50,
      happiness: 50,
      health: 50,
      intelligence: 50,
      money: 1000,
      sanity: 50,
    },
    turn: 1,
    year: 2026,
  }
}

describe('statEffectsStep', () => {
  it('applies one_time effects and does not persist them', () => {
    const state = createState()
    state.pendingStatEffects.push({
      effects: { energy: -10, money: 100 },
      kind: 'one_time',
    })

    statEffectsStep({ prev: {} as never, turn: 1, year: 2026 }, state)

    expect(state.statModifiers.energy).toBe(-10)
    expect(state.moneyDelta).toBe(100)
    expect(state.player.activeStatEffects).toEqual([])
  })

  it('applies temporary effects and decrements duration by quarter', () => {
    const state = createState()
    state.player.activeStatEffects = [
      {
        durationMonths: 6,
        effects: { happiness: 5 },
        kind: 'temporary',
      },
    ]

    statEffectsStep({ prev: {} as never, turn: 1, year: 2026 }, state)

    expect(state.statModifiers.happiness).toBe(5)
    expect(state.player.activeStatEffects).toEqual([
      {
        durationMonths: 3,
        effects: { happiness: 5 },
        kind: 'temporary',
      },
    ])
  })

  it('keeps persistent effects and applies only active ones', () => {
    const state = createState()
    state.player.activeStatEffects = [
      {
        effects: { sanity: 3 },
        isActive: true,
        kind: 'persistent',
        sourceId: 'mentor_trait',
      },
      {
        effects: { health: 10 },
        isActive: false,
        kind: 'persistent',
        sourceId: 'inactive_source',
      },
    ]

    statEffectsStep({ prev: {} as never, turn: 1, year: 2026 }, state)

    expect(state.statModifiers.sanity).toBe(3)
    expect(state.statModifiers.health).toBeUndefined()
    expect(state.player.activeStatEffects).toHaveLength(2)
  })
})
