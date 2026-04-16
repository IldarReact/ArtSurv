import { describe, it, expect } from 'vitest'

import type { Country, HistoryEntry, Player } from '@/core/types'

import { commitTurn } from './commit-turn'
import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'

describe('commitTurn', () => {
  const mockPlayer = {
    id: 'player-1',
    personal: { stats: { energy: 100, health: 100 } },
    stats: { energy: 100, health: 100, money: 1000 },
  } as unknown as Player

  const mockCtx: TurnContext = {
    prev: { history: [] } as any,
    turn: 1,
    year: 2024,
  }

  const mockState: TurnState = {
    buffs: [],
    business: {
      totalExpenses: 0,
      totalIncome: 0,
      totalTax: 0,
    },
    countries: {} as unknown as Record<string, Country>,
    country: { cycle: { phase: 'growth' } } as unknown as Country,
    financial: { adjustedNetProfit: 200 } as unknown as TurnState['financial'],
    gameOverReason: null,
    gameStatus: 'playing',
    globalEvents: [],
    globalMarketValue: 100,
    historyEntry: { turn: 1, year: 2024 } as unknown as HistoryEntry,
    inflationNotification: null,
    isAborted: false,
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
    marketEvents: [],
    moneyDelta: 50,
    notifications: [],
    pendingApplications: [],
    pendingFreelanceApplications: [],
    player: mockPlayer,
    protectedSkills: new Set(),
    statModifiers: {},
    stats: { energy: 80, health: 90 } as unknown as TurnState['stats'],
    turn: 0,
    year: 2024,
  }

  it('should advance turn and keep year if not quarter end', () => {
    const result = commitTurn(mockCtx, mockState)
    expect(result.turn).toBe(2)
    expect(result.year).toBe(2024)
    expect(result.gameStatus).toBe('playing')
  })

  it('should advance year and change status to year_report at quarter end', () => {
    const yearEndCtx = { ...mockCtx, turn: 3 }
    const stateWithHistory: TurnState = {
      ...mockState,
      historyEntry: {
        happiness: 90,
        health: 90,
        netWorth: 1500,
        turn: 3,
        year: 2024,
      } as unknown as HistoryEntry,
    }
    const result = commitTurn(yearEndCtx, stateWithHistory)
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
    const stateWithHistory: TurnState = {
      ...mockState,
      historyEntry: {
        happiness: 100,
        health: 100,
        netWorth: 1000,
        turn: 1,
        year: 2024,
      } as unknown as HistoryEntry,
    }
    const result = commitTurn(mockCtx, stateWithHistory)
    expect(result.history).toHaveLength(1)
    expect(result.history![0].netWorth).toBe(1000)
  })

  it('should handle missing historyEntry gracefully', () => {
    const stateWithoutHistory = { ...mockState, historyEntry: null }
    const result = commitTurn(mockCtx, stateWithoutHistory as TurnState)
    expect(result.history).toHaveLength(0)
  })

  it('should handle broken/missing cycle data in globalMarket', () => {
    const brokenState = { ...mockState, country: {} as unknown as Country }
    const result = commitTurn(mockCtx, brokenState)
    expect(result.globalMarket?.description).toBe('Фаза: unknown')
  })
})
