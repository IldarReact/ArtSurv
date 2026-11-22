import { describe, it, expect } from 'vitest'

import type { Country, Player } from '@/core/types'

import { commitTurn } from './commit-turn'
import type { TurnContext } from './turn-context'
import type { TurnState } from './turn-state'

describe('commitTurn', () => {
  const mockPlayer = {
    assets: [
      {
        currentValue: 500,
        expenses: 0,
        id: 'stock-1',
        income: 0,
        liquidity: 'high',
        name: 'Stock',
        purchasePrice: 300,
        risk: 'medium',
        type: 'stock',
        unrealizedGain: 200,
        value: 500,
      },
    ],
    businesses: [],
    debts: [
      {
        id: 'debt-1',
        interestRate: 10,
        name: 'Loan',
        principalAmount: 100,
        quarterlyInterest: 0,
        quarterlyPayment: 0,
        quarterlyPrincipal: 0,
        remainingAmount: 100,
        remainingQuarters: 1,
        startTurn: 0,
        termQuarters: 1,
        type: 'consumer_credit',
      },
    ],
    id: 'player-1',
    personal: { stats: { energy: 100, health: 100 } },
    quarterlyReport: { netProfit: 0 },
    stats: { energy: 100, health: 100, money: 1000 },
  } as unknown as Player

  const mockCtx: TurnContext = {
    prev: { history: [], lifeEvents: [] } as any,
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
    financial: {
      adjustedNetProfit: 200,
      netProfit: 200,
      quarterlyReport: { netProfit: 200 } as any,
    } as unknown as TurnState['financial'],
    gameOverReason: null,
    gameStatus: 'playing',
    globalEvents: [],
    globalMarketValue: 100,
    inflationNotification: null,
    isAborted: false,
    lifeEvents: [],
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
    pendingStatEffects: [],
    player: mockPlayer,
    protectedSkills: new Set(),
    statModifiers: {},
    stats: {
      energy: 80,
      happiness: 70,
      health: 90,
      intelligence: 60,
      money: 1000,
      sanity: 50,
    },
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
    const result = commitTurn(yearEndCtx, mockState)
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

  it('should commit quarterly report to player state', () => {
    const result = commitTurn(mockCtx, mockState)
    expect(result.player?.quarterlyReport).toEqual(mockState.financial.quarterlyReport)
  })

  it('should commit country event history with the country economy', () => {
    const recordedEvent = {
      appliedChanges: {
        inflation: { delta: 1, from: 2, to: 3 },
      },
      description: 'Инфляция выросла',
      duration: 1,
      effects: { inflationChange: 1 },
      id: 'event_1_inflation_spike',
      title: 'Скачок инфляции',
      turn: 1,
      type: 'inflation_spike',
    } as const
    const eventCountry = {
      activeEvents: [recordedEvent],
      eventHistory: [recordedEvent],
    } as unknown as Country
    const stateWithCountry = {
      ...mockState,
      countries: { us: eventCountry },
    }

    const result = commitTurn(mockCtx, stateWithCountry)

    expect(result.countries?.us.eventHistory).toEqual([recordedEvent])
  })

  it('records post-commit stats, cash, assets, and debts in an annual snapshot', () => {
    const result = commitTurn({ ...mockCtx, turn: 3 }, mockState)
    const snapshot = result.history?.[0]

    expect(snapshot).toMatchObject({
      happiness: 70,
      health: 90,
      intelligence: 60,
      investmentCostBasis: 300,
      investmentValue: 500,
      money: 1250,
      netWorth: 1650,
      sanity: 50,
      turn: 3,
      year: 2024,
    })
    expect(snapshot).not.toHaveProperty('energy')
  })

  it('does not create annual snapshots before the year-end quarter', () => {
    const result = commitTurn(mockCtx, mockState)
    expect(result.history).toEqual([])
  })

  it('ends the game after the twentieth year and keeps the final annual report', () => {
    const result = commitTurn({ ...mockCtx, turn: 79 }, mockState)

    expect(result.gameStatus).toBe('ended')
    expect(result.endReason).toBe('COMPLETED')
    expect(result.history).toHaveLength(1)
  })

  it('does not append the same life event twice', () => {
    const event = {
      category: 'work',
      id: 'work-1',
      kind: 'work_quarter',
      turn: 1,
      year: 2024,
    } as const
    const result = commitTurn(
      { ...mockCtx, prev: { history: [], lifeEvents: [event] } as any },
      { ...mockState, lifeEvents: [event] },
    )

    expect(result.lifeEvents).toEqual([event])
  })

  it('should handle broken/missing cycle data in globalMarket', () => {
    const brokenState = { ...mockState, country: {} as unknown as Country }
    const result = commitTurn(mockCtx, brokenState)
    expect(result.globalMarket?.description).toBe('Фаза: unknown')
  })
})
