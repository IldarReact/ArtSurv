import { describe, it, expect } from 'vitest'

import { commitTurn } from './commit-turn'
import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'

describe('commitTurn', () => {
  const mockPlayer: any = {
    id: 'player-1',
    stats: { money: 1000, health: 100, energy: 100 },
    personal: { stats: { health: 100, energy: 100 } },
  }

  const mockCtx: TurnContext = {
    turn: 1,
    year: 2024,
    prev: { history: [] } as any,
  }

  const mockState: TurnState = {
    turn: 0,
    year: 2024,
    gameStatus: 'playing',
    isAborted: false,
    gameOverReason: null,
    player: mockPlayer,
    stats: { health: 90, energy: 80 } as any,
    financial: { adjustedNetProfit: 200 } as any,
    moneyDelta: 50,
    countries: {} as any,
    country: { cycle: { phase: 'growth' } } as any,
    globalMarketValue: 100,
    notifications: [],
    pendingFreelanceApplications: [],
    globalEvents: [],
    marketEvents: [],
    historyEntry: { turn: 1, year: 2024 } as any,
    inflationNotification: null,
    buffs: [],
    statModifiers: {},
    lifestyle: {
      expenses: 0,
      breakdown: {
        food: 0,
        housing: 0,
        transport: 0,
        credits: 0,
        mortgage: 0,
        other: 0,
        total: 0,
      },
      modifiers: {},
    },
    business: {
      totalIncome: 0,
      totalExpenses: 0,
      totalTax: 0,
    },
    pendingApplications: [],
    protectedSkills: new Set(),
  }

  it('should advance turn and keep year if not quarter end', () => {
    const result = commitTurn(mockCtx, mockState)
    expect(result.turn).toBe(2)
    expect(result.year).toBe(2024)
    expect(result.gameStatus).toBe('playing')
  })

  it('should advance year and change status to year_report at quarter end', () => {
    const yearEndCtx = { ...mockCtx, turn: 3 }
    const stateWithHistory = {
      ...mockState,
      historyEntry: { turn: 3, year: 2024, netWorth: 1500, happiness: 90, health: 90 },
    }
    const result = commitTurn(yearEndCtx, stateWithHistory as any)
    expect(result.turn).toBe(4)
    expect(result.year).toBe(2025)
    expect(result.gameStatus).toBe('year_report')
    expect(result.history).toHaveLength(1)
    expect(result.history![0].year).toBe(2024) // History stores PREVIOUS state
  })

  it('should correctly calculate money', () => {
    const result = commitTurn(mockCtx, mockState)
    // 1000 (base) + 200 (profit) + 50 (delta) = 1250
    expect(result.player?.stats.money).toBe(1250)
  })

  it('should update history if historyEntry is present', () => {
    const stateWithHistory = {
      ...mockState,
      historyEntry: { turn: 1, year: 2024, netWorth: 1000, happiness: 100, health: 100 },
    }
    const result = commitTurn(mockCtx, stateWithHistory as any)
    expect(result.history).toHaveLength(1)
    expect(result.history![0].netWorth).toBe(1000)
  })

  it('should handle missing historyEntry gracefully', () => {
    const stateWithoutHistory = { ...mockState, historyEntry: null }
    const result = commitTurn(mockCtx, stateWithoutHistory as any)
    expect(result.history).toHaveLength(0)
  })

  it('should handle broken/missing cycle data in globalMarket', () => {
    const brokenState = { ...mockState, country: {} as any }
    const result = commitTurn(mockCtx, brokenState)
    expect(result.globalMarket?.description).toBe('Фаза: unknown')
  })
})
