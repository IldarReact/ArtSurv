import type { GlobalMarketCondition, MarketEvent } from '@/core/types'

export interface MarketSlice {
  addMarketEvent: (event: MarketEvent) => void
  globalMarket: GlobalMarketCondition

  marketEvents: MarketEvent[]
  // Actions
  updateMarketCondition: (
    newValue: number,
    description: string,
    trend: 'rising' | 'falling' | 'stable',
  ) => void
}
