import type { StateCreator } from 'zustand'

import type { GameStore, MarketSlice } from './types'

/**
 * Market Slice - управление глобальным рынком
 */
export const createMarketSlice: StateCreator<GameStore, [], [], MarketSlice> = (set, get) => ({
  /**
   * Добавить событие рынка
   */
  addMarketEvent: (event) => {
    const state = get()

    // Применяем влияние события к текущему значению рынка
    const newValue = state.globalMarket.value + event.impact
    const TREND_THRESHOLD = 0.1
    const trend: 'rising' | 'falling' | 'stable' =
      event.impact > TREND_THRESHOLD
        ? 'rising'
        : event.impact < -TREND_THRESHOLD
          ? 'falling'
          : 'stable'

    const MARKET_MIN = 0.1
    const MARKET_MAX = 2.0
    set({
      globalMarket: {
        description: event.description,
        lastUpdatedTurn: state.turn,
        trend,
        value: Math.max(MARKET_MIN, Math.min(MARKET_MAX, newValue)),
      },
      marketEvents: [...state.marketEvents, event],
    })
  },

  // Начальное состояние рынка - нормальное
  globalMarket: {
    description: 'Стабильный рынок',
    lastUpdatedTurn: 0,
    trend: 'stable',
    value: 1.0,
  },

  marketEvents: [],

  /**
   * Обновить состояние глобального рынка
   */
  updateMarketCondition: (newValue, description, trend) => {
    const state = get()

    // Ограничиваем значение в диапазоне 0.1 - 2.0
    const MARKET_MIN = 0.1
    const MARKET_MAX = 2.0
    const clampedValue = Math.max(MARKET_MIN, Math.min(MARKET_MAX, newValue))

    set({
      globalMarket: {
        description,
        lastUpdatedTurn: state.turn,
        trend,
        value: clampedValue,
      },
    })
  },
})
