import type { MarketEvent } from '@/core/types'

/**
 * Генератор событий глобального рынка
 */

interface MarketEventTemplate {
  description: string
  duration: number
  impact: number
  probability: number // 0.0 - 1.0
  title: string
  type: 'positive' | 'negative' | 'neutral'
}

const MARKET_EVENT_TEMPLATES: MarketEventTemplate[] = [
  // Позитивные события (рост рынка)
  {
    description:
      'Мировая экономика переживает период бурного роста. Спрос на товары и услуги значительно вырос.',
    duration: 4,
    impact: 0.5,
    probability: 0.05,
    title: 'Экономический бум',
    type: 'positive',
  },
  {
    description:
      'Новые технологии открывают новые возможности для бизнеса. Потребительский спрос растет.',
    duration: 6,
    impact: 0.3,
    probability: 0.08,
    title: 'Технологический прорыв',
    type: 'positive',
  },
  {
    description:
      'Правительство снизило налоги для бизнеса. Покупательская способность населения выросла.',
    duration: 8,
    impact: 0.2,
    probability: 0.1,
    title: 'Снижение налогов',
    type: 'positive',
  },
  {
    description: 'Потребители стали более оптимистичны и активнее тратят деньги.',
    duration: 3,
    impact: 0.15,
    probability: 0.15,
    title: 'Рост потребительского доверия',
    type: 'positive',
  },

  // Негативные события (падение рынка)
  {
    description: 'Мировая экономика вошла в рецессию. Спрос на товары и услуги немного упал.',
    duration: 4, // Reduced from 6
    impact: -0.25, // Reduced from -0.6
    probability: 0.02, // Reduced from 0.03
    title: 'Экономический кризис',
    type: 'negative',
  },
  {
    description: 'Крах фондового рынка вызвал временную панику среди инвесторов.',
    duration: 6, // Reduced from 8
    impact: -0.4, // Reduced from -0.8
    probability: 0.005, // Reduced from 0.01
    title: 'Финансовый коллапс',
    type: 'negative',
  },
  {
    description: 'Инфляция немного снижает покупательскую способность населения.',
    duration: 4,
    impact: -0.15, // Reduced from -0.3
    probability: 0.1,
    title: 'Рост инфляции',
    type: 'negative',
  },
  {
    description: 'Международные торговые конфликты негативно влияют на мировую экономику.',
    duration: 4,
    impact: -0.25,
    probability: 0.08,
    title: 'Торговые войны',
    type: 'negative',
  },
  {
    description: 'Резкий рост цен на энергоносители увеличивает издержки бизнеса.',
    duration: 3,
    impact: -0.2,
    probability: 0.1,
    title: 'Энергетический кризис',
    type: 'negative',
  },

  // Нейтральные/стабилизирующие события
  {
    description: 'Рынок постепенно возвращается к нормальным показателям.',
    duration: 2,
    impact: 0.1,
    probability: 0.2,
    title: 'Стабилизация рынка',
    type: 'neutral',
  },
]

/**
 * Генерирует случайное событие рынка на основе вероятностей
 */
export function generateMarketEvent(currentTurn: number): MarketEvent | null {
  // Выбираем событие на основе вероятностей
  const roll = Math.random()
  let cumulativeProbability = 0

  for (const template of MARKET_EVENT_TEMPLATES) {
    cumulativeProbability += template.probability
    if (roll <= cumulativeProbability) {
      return {
        description: template.description,
        duration: template.duration,
        endTurn: currentTurn + template.duration,
        id: `market_event_${String(currentTurn)}_${String(Date.now())}`,
        impact: template.impact,
        startTurn: currentTurn,
        title: template.title,
        turn: currentTurn,
        type: template.type,
      }
    }
  }

  return null
}

/**
 * Проверяет, истекли ли активные события рынка
 */
export function cleanupExpiredMarketEvents(
  events: MarketEvent[],
  currentTurn: number,
): MarketEvent[] {
  return events.filter((event) => (event.endTurn ?? 0) > currentTurn)
}

/**
 * Рассчитывает суммарное влияние всех активных событий на рынок
 */
export function calculateTotalMarketImpact(events: MarketEvent[]): number {
  let total = 0
  for (const event of events) {
    total += event.impact
  }
  return total
}
