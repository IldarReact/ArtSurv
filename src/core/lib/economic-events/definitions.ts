import type { EconomicEvent, EconomicEventType } from '@/core/types'

export const ECONOMIC_EVENT_DEFINITIONS: Record<
  EconomicEventType,
  Omit<EconomicEvent, 'id' | 'turn'>
> = {
  boom: {
    description:
      'Экономика переживает период быстрого роста. ВВП растет, безработица снижается, зарплаты увеличиваются.',
    duration: 6,
    effects: {
      gdpGrowthChange: 3,
      inflationChange: 1,
      keyRateChange: -0.5,
      salaryModifierChange: 1.15,
      unemploymentChange: -2,
    },
    title: 'Экономический бум',
    type: 'boom',
  },
  crisis: {
    description:
      'Мировой финансовый кризис затронул экономику. Инфляция растет, ключевая ставка повышается, безработица увеличивается.',
    duration: 8,
    effects: {
      gdpGrowthChange: -4,
      inflationChange: 5,
      keyRateChange: 3,
      salaryModifierChange: 0.9,
      unemploymentChange: 3,
    },
    title: 'Экономический кризис',
    type: 'crisis',
  },
  inflation_spike: {
    description: 'Резкий рост цен на товары и услуги. Центральный банк вынужден повышать ставку.',
    duration: 4,
    effects: {
      gdpGrowthChange: -1,
      inflationChange: 4,
      keyRateChange: 2,
      salaryModifierChange: 1.05,
      unemploymentChange: 1,
    },
    title: 'Скачок инфляции',
    type: 'inflation_spike',
  },
  rate_cut: {
    description:
      'Центральный банк снижает ключевую ставку для стимулирования экономики. Кредиты становятся дешевле.',
    duration: 4,
    effects: {
      gdpGrowthChange: 1.5,
      inflationChange: 1,
      keyRateChange: -2,
      salaryModifierChange: 1.05,
      unemploymentChange: -1,
    },
    title: 'Снижение ключевой ставки',
    type: 'rate_cut',
  },
  rate_hike: {
    description:
      'Центральный банк повышает ключевую ставку для борьбы с инфляцией. Кредиты становятся дороже.',
    duration: 4,
    effects: {
      gdpGrowthChange: -0.5,
      inflationChange: -2,
      keyRateChange: 2.5,
      salaryModifierChange: 1.0,
      unemploymentChange: 0.5,
    },
    title: 'Повышение ключевой ставки',
    type: 'rate_hike',
  },
  recession: {
    description:
      'Экономика замедляется. Рост ВВП снижается, безработица растет, но инфляция под контролем.',
    duration: 6,
    effects: {
      gdpGrowthChange: -2,
      inflationChange: -1,
      keyRateChange: -1,
      salaryModifierChange: 0.95,
      unemploymentChange: 2,
    },
    title: 'Рецессия',
    type: 'recession',
  },
}

export function createEconomicEvent(type: EconomicEventType, turn: number): EconomicEvent {
  const def = ECONOMIC_EVENT_DEFINITIONS[type]
  return {
    id: `event_${String(turn)}_${type}`,
    turn,
    ...def,
  }
}
