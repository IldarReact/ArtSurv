import { describe, expect, it, vi } from 'vitest'

import type { MarketEvent } from '@/core/types'

import { processMarket } from '../market-processor'

// Mock generator
vi.mock('@/core/lib/market-events-generator', () => ({
  cleanupExpiredMarketEvents: (events: MarketEvent[], turn: number) =>
    events.filter((e) => (e.startTurn ?? 0) + e.duration > turn),
  generateMarketEvent: (turn: number) => {
    if (turn === 1)
      return {
        description: 'Market is growing',
        duration: 2,
        effects: { marketValue: 0.1 },
        id: 'market-1',
        startTurn: turn,
        title: 'Growth',
        type: 'positive',
      }
    return null
  },
}))

describe('market-processor', () => {
  it('should generate new market event', () => {
    const result = processMarket([], 1, 2025)

    expect(result.marketEvents).toHaveLength(1)
    expect(result.marketEvents[0].title).toBe('Growth')
    expect(result.notifications).toHaveLength(1)
    expect(result.notifications[0].title).toContain('📈 Рынок')
  })

  it('should cleanup expired events', () => {
    const oldEvent: MarketEvent = {
      description: 'Old event',
      duration: 1,
      effect: { marketValue: 0 },
      id: 'old',
      impact: 0,
      startTurn: 0,
      title: 'Old',
      turn: 0,
      type: 'neutral',
    } as unknown as MarketEvent

    // Turn 2, oldEvent started at 0 with duration 1, so it should be expired
    const result = processMarket([oldEvent], 2, 2025)

    expect(result.marketEvents).toHaveLength(0)
  })
})
