import { describe, expect, it } from 'vitest'

import type { HistoryEntry, LifeEvent, Player } from '@/core/types'

import { calculateLifeScore, calculateNetWorth, createAnnualSnapshot } from './life-history'

const player: Player = {
  assets: [
    {
      currentValue: 150_000,
      expenses: 0,
      id: 'stock-1',
      income: 0,
      liquidity: 'high',
      name: 'Stock',
      purchasePrice: 100_000,
      risk: 'medium',
      type: 'stock',
      unrealizedGain: 50_000,
      value: 150_000,
    },
  ],
  businesses: [],
  debts: [],
  stats: {
    energy: 100,
    happiness: 100,
    health: 100,
    intelligence: 100,
    money: 100_000,
    sanity: 100,
  },
} as unknown as Player

describe('life history and scoring', () => {
  it('creates a complete annual snapshot and calculates net worth after debt', () => {
    const snapshot = createAnnualSnapshot(
      {
        assets: player.assets,
        businesses: [],
        debts: [
          {
            remainingAmount: 25_000,
          },
        ] as Player['debts'],
      },
      player.stats,
      80_000,
      3,
      2024,
    )

    expect(snapshot).toMatchObject({
      happiness: 100,
      health: 100,
      intelligence: 100,
      investmentCostBasis: 100_000,
      investmentValue: 150_000,
      money: 80_000,
      netWorth: 205_000,
      sanity: 100,
      turn: 3,
      year: 2024,
    })
    expect(snapshot).not.toHaveProperty('energy')
    expect(calculateNetWorth({ ...player, stats: { ...player.stats, money: 80_000 } })).toBe(
      230_000,
    )
  })

  it('scores all five stats, capital, capped annual events, and investment return', () => {
    const history: HistoryEntry[] = [
      {
        energy: 100,
        happiness: 100,
        health: 100,
        intelligence: 100,
        investmentCostBasis: 100_000,
        investmentValue: 150_000,
        money: 100_000,
        netWorth: 250_000,
        sanity: 100,
        turn: 79,
        year: 2043,
      },
    ]
    const lifeEvents: LifeEvent[] = [
      {
        category: 'family',
        id: 'partner',
        kind: 'relationship_started',
        turn: 2,
        year: 2024,
      },
      {
        amount: 2,
        category: 'family',
        id: 'children',
        kind: 'child_born',
        turn: 4,
        year: 2024,
      },
      ...Array.from({ length: 20 }, (_, index) => ({
        category: 'work' as const,
        id: `work-${String(index)}`,
        kind: 'work_quarter' as const,
        turn: index,
        year: 2024,
      })),
      {
        category: 'education',
        id: 'course',
        kind: 'course_completed',
        turn: 1,
        year: 2024,
      },
      {
        category: 'education',
        id: 'degree',
        kind: 'university_completed',
        turn: 2,
        year: 2024,
      },
      {
        category: 'work',
        id: 'fired',
        kind: 'job_lost',
        turn: 1,
        year: 2025,
      },
      {
        amount: 15_000,
        category: 'investments',
        costBasis: 10_000,
        gainOrLoss: 5_000,
        id: 'sold-stock',
        kind: 'asset_sold',
        turn: 1,
        year: 2025,
      },
    ]

    const result = calculateLifeScore(history, lifeEvents, player, 80)

    expect(result.stats).toEqual({
      happiness: 10,
      health: 10,
      intelligence: 10,
      sanity: 10,
    })
    expect(result.capital).toBe(15)
    expect(result.categories).toEqual({
      education: 1.5,
      family: 1.5,
      investments: 5.25,
      rest: 0,
      work: 0.5,
    })
    expect(result.total).toBe(63.75)
    expect(result.total).toBeLessThanOrEqual(90)
    expect(result.total).toBeLessThanOrEqual(90)
  })

  it('includes current stats when an ending has no annual snapshot', () => {
    const result = calculateLifeScore([], [], player, 1)

    expect(result.stats.happiness).toBe(10)
    expect(result.total).toBeGreaterThan(0)
  })
})
