// Economy-related types

export type CountryArchetype =
  | 'rich_resource'
  | 'rich_stable'
  | 'growing_resource'
  | 'growing_stable'
  | 'poor'

export type EconomicEventType =
  | 'crisis' // Кризис
  | 'boom' // Экономический рост
  | 'recession' // Рецессия
  | 'inflation_spike' // Скачок инфляции
  | 'rate_hike' // Повышение ставки
  | 'rate_cut' // Снижение ставки

export interface EconomicEvent {
  description: string
  duration: number // Длительность в кварталах
  effects: {
    readonly corporateTaxRateChange?: number // Изменение налога на прибыль бизнеса (%)
    readonly inflationChange?: number // Изменение инфляции (%)
    readonly keyRateChange?: number // Изменение ключевой ставки (%)
    readonly gdpGrowthChange?: number // Изменение роста ВВП (%)
    readonly personalTaxRateChange?: number // Изменение личного налога (%)
    readonly psychologicalStabilityChange?: number // Изменение психологической стабильности страны
    readonly unemploymentChange?: number // Изменение безработицы (%)
    salaryModifierChange?: number // Изменение зарплат (множитель)
  }
  id: string
  title: string
  turn: number // Когда произошло
  type: EconomicEventType
}

export type EconomicPhase = 'growth' | 'peak' | 'recession' | 'recovery'

export interface EconomicCycle {
  durationLeft: number // Quarters left in current phase
  intensity: number // 0.0 to 1.0 (how strong is the effect)
  marketModifier: number // Multiplier for demand (e.g., 1.2 for growth, 0.7 for recession)
  phase: EconomicPhase
}

export interface CountryEconomy {
  activeEvents: EconomicEvent[] // Активные экономические события
  archetype: CountryArchetype
  baseSalaries?: Record<string, number> // Базовые зарплаты по ролям
  baseYear?: number // Базовый год для расчета инфляции (обычно год начала игры)
  readonly corporateTaxRate: number // Налог на прибыль бизнеса (%)
  costOfLivingModifier: number // Модификатор стоимости жизни
  cycle?: EconomicCycle // Текущий экономический цикл
  gdpGrowth: number // Рост ВВП (%)
  id: string
  imageUrl?: string // URL изображения страны
  readonly inflation: number // Инфляция (% годовых)
  inflationHistory?: number[] // История годовой инфляции для накопленного расчета
  interestRate: number // Базовая процентная ставка (deprecated, используем keyRate)
  readonly keyRate: number // Ключевая ставка ЦБ (% годовых)
  name: string
  readonly psychologicalStability?: number // Психологическая стабильность страны (0-100)
  salaryModifier: number // Модификатор зарплат
  stockMarketInflation: number // Инфляция фондового рынка (% годовых)
  readonly taxRate: number // Личный налог на доход (зарплата, дивиденды) (%)
  unemployment: number // Безработица (%)
}

export type Country = CountryEconomy

export interface GlobalEvent {
  description: string
  id: string
  impact: {
    gdp?: number
    inflation?: number
    market?: number
  }
  title: string
}
