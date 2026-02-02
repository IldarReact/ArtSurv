/**
 * Глобальное состояние рынка
 * Влияет на спрос на все товары и услуги
 */
export interface GlobalMarketCondition {
  /**
   * Описание текущего состояния
   */
  description: string

  /**
   * Когда последний раз обновлялось
   */
  lastUpdatedTurn: number

  /**
   * Тренд (растет/падает/стабильно)
   */
  trend: 'rising' | 'falling' | 'stable'

  /**
   * Текущее состояние рынка (0.0 - 2.0)
   * 2.0 = мировой бум (все покупают, рост спроса)
   * 1.0 = нормальный рынок
   * 0.5 = кризис
   * 0.2 = мировой коллапс (почти ничего не покупают)
   */
  value: number
}

/**
 * Событие глобального рынка
 */
export interface MarketEvent {
  description: string
  duration: number
  effect?: {
    globalMarketModifier?: number
  }
  endTurn?: number
  id: string
  impact: number // Изменение значения рынка (-1.0 до +1.0)
  startTurn?: number
  title: string
  turn: number
  type?: 'positive' | 'negative' | 'neutral'
}

export interface MarketResult {
  marketEvents: MarketEvent[]
  notifications: Notification[]
}
