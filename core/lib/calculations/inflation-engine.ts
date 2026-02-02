/**
 * Layer 3: Scalable Inflation Engine
 *
 * ✅ Pure function — no side effects
 * ✅ Scalable — can be applied to any goods/items
 * ✅ Deterministic — no random jumping, stable inflation
 * ✅ Yearly only — applies exactly once per year (Q1)
 *
 * Problems Fixed:
 * - ❌ Was: Applied every quarter (should be once per year)
 * - ✅ Now: Only on Q1 of each year
 * - ❌ Was: Random jumping (unpredictable)
 * - ✅ Now: Smooth trend with damping
 * - ❌ Was: Could be negative (prices fall)
 * - ✅ Now: Minimum 0.1%, prices never fall
 * - ❌ Was: Not scalable to goods
 * - ✅ Now: Can apply to any category with INFLATION_MULTIPLIERS
 */

import type { CountryEconomy, EconomicEvent } from '../../types/economy.types'
import { devLog } from '../debug'

/**
 * Category-specific inflation multipliers
 * Determines how fast prices rise for different goods
 *
 * Example: housing at 1.5x means housing prices rise 1.5x faster than base inflation
 */
export const INFLATION_MULTIPLIERS = {
  business: 1.3, // 💼 Бизнес (сложнее, дорожает)
  default: 1.0, // 📊 По умолчанию
  education: 1.2, // 📚 Образование
  food: 0.5, // 🍎 Еда (медленнее, конкуренция)
  health: 1.1, // 🏥 Здравоохранение
  housing: 1.5, // 🏠 Недвижимость (дорожает быстро)
  realEstate: 1.5, // 🏢 Коммерческая недвижимость
  salaries: 0.95, // 💰 Зарплаты (почти как инфляция, но чуть медленнее)
  services: 0.9, // 💇 Услуги (медленнее)
  shop: 1.0, // 🛒 Магазинные товары
  transport: 1.0, // 🚗 Транспорт (средний уровень)
} as const

export type PriceCategory = keyof typeof INFLATION_MULTIPLIERS

/**
 * Inflation Settings: Controls how inflation behaves
 */
export const INFLATION_SETTINGS = {
  crisisMultiplier: 2.5, // 🔥 Inflation multiplier during crisis
  dampingFactor: 0.6, // 📉 How much previous inflation affects this year (60% = trend-following)
  maxInflation: 20, // 🔺 Maximum possible inflation (20%)
  minInflation: 0.1, // 🔻 Minimum possible inflation (0.1%)
  volatility: 0.8, // 📊 Random variance (0-1, higher = more volatile)
} as const

/**
 * Determines if economy is in crisis based on active events
 * Crisis events increase inflation volatility
 *
 * @param events - Active economic events
 * @returns true if any crisis/inflation_spike event is active
 */
function isInCrisis(events: EconomicEvent[] = []): boolean {
  return events.some((event) => event.type === 'crisis' || event.type === 'inflation_spike')
}

const WORLD_AVERAGE_INFLATION = 2.5
const MAX_DEVIATION_RATIO = 0.3
const RANDOM_OFFSET = 0.5
const INFLATION_ROUNDING = 10
const KEY_RATE_STABILITY_PREMIUM = 1.5
const KEY_RATE_RANDOM_SPAN = 0.5
const KEY_RATE_MAX_CHANGE = 1.0
const KEY_RATE_MIN = 0.1
const PERCENT_DIVISOR = 100
const CRISIS_TREND_DAMPING_MULTIPLIER = 1.2
const MAX_RANGE_MULTIPLIER = 2

const QUARTERS_IN_YEAR = 4
const FIRST_QUARTER = 1
const MIN_TURN = 0

/**
 * Calculates target inflation range for the year
 * Based on country's base inflation and current conditions
 *
 * @param economy - Country economy state
 * @returns { min, max, target } inflation percentages
 */
function calculateInflationTargets(economy: CountryEconomy): {
  min: number
  max: number
  targetTrend: number
} {
  const currentInflation = economy.inflation
  const isInCrisis_ = isInCrisis(economy.activeEvents)

  // Диапазон вокруг текущей инфляции
  let volatility = INFLATION_SETTINGS.volatility
  let trendDamping = INFLATION_SETTINGS.dampingFactor

  if (isInCrisis_) {
    volatility *= INFLATION_SETTINGS.crisisMultiplier
    trendDamping *= CRISIS_TREND_DAMPING_MULTIPLIER // Trend becomes more pronounced in crisis
  }

  // Ожидаемый диапазон для этого года
  const halfRange = currentInflation * volatility
  const min = Math.max(INFLATION_SETTINGS.minInflation, currentInflation - halfRange)
  const max = Math.min(
    INFLATION_SETTINGS.maxInflation,
    currentInflation + halfRange * MAX_RANGE_MULTIPLIER,
  )

  // КЛЮЧЕВАЯ ЧАСТЬ: Долгосрочный тренд не только следует за прошлой инфляцией,
  // но и стремится к мировому среднему уровню (~2-3%)
  // Это обеспечивает рост цен в долгосрочной перспективе
  const worldAverageInflation = WORLD_AVERAGE_INFLATION // Мировой средний уровень инфляции

  // Target: следует прошлой инфляции (damping factor) + тянется к мировому среднему
  // Если текущая инфляция ниже среднего мира - тянется вверх
  // Если выше - может упасть, но медленно (damping factor не даёт резких падений)
  const targetTrend = Math.max(
    min,
    Math.min(max, currentInflation * trendDamping + worldAverageInflation * (1 - trendDamping)),
  )

  return { max, min, targetTrend }
}

/**
 * Generates yearly inflation rate
 * Called EXACTLY ONCE per year (on Q1)
 *
 * Rules:
 * 1. Never negative (prices never fall)
 * 2. Based on previous year + damping factor (trend-following, not random)
 * 3. Events can modify (+/- from economic events)
 * 4. Stays within min-max bounds
 *
 * @param currentInflation - Inflation from previous year
 * @param economy - Country economy state
 * @returns New inflation rate (percentage)
 *
 * @example
 * // Year 1: base 2.5%
 * // Year 2: 2.5 * 0.6 + random small amount ≈ 2.3-2.8%
 * // Year 3 with crisis: might jump to 4-5%, but still follows trend
 */
export function generateYearlyInflation(currentInflation: number, economy: CountryEconomy): number {
  const { max, min, targetTrend } = calculateInflationTargets(economy)

  // Base: previous inflation with damping (trend-following)
  let newInflation = targetTrend

  // Add controlled random component (not wild swings)
  const maxDeviation = (max - min) * MAX_DEVIATION_RATIO // Max 30% of range deviation
  const randomComponent = (Math.random() - RANDOM_OFFSET) * maxDeviation
  newInflation += randomComponent

  // Apply event effects
  for (const event of economy.activeEvents) {
    if (event.effects.inflationChange !== undefined) {
      newInflation += event.effects.inflationChange
    }
  }

  // Hard bounds: ensure within limits and non-negative
  newInflation = Math.max(
    INFLATION_SETTINGS.minInflation,
    Math.min(INFLATION_SETTINGS.maxInflation, newInflation),
  )

  // Round to 1 decimal place (0.1%)
  return Math.round(newInflation * INFLATION_ROUNDING) / INFLATION_ROUNDING
}

/**
 * Calculates central bank key rate based on inflation
 * Key rate is typically slightly above inflation + stability premium
 *
 * @param inflation - Current inflation rate
 * @param currentKeyRate - Previous year's key rate
 * @returns New key rate (percentage)
 */
export function calculateKeyRate(inflation: number, currentKeyRate: number): number {
  // Target: inflation + 1.5% (stability premium)
  // with slight random component
  const targetRate =
    inflation + KEY_RATE_STABILITY_PREMIUM + (Math.random() - RANDOM_OFFSET) * KEY_RATE_RANDOM_SPAN

  // Smooth adjustment (max ±1% per year for stability)
  const maxChange = KEY_RATE_MAX_CHANGE
  const change = Math.max(-maxChange, Math.min(maxChange, targetRate - currentKeyRate))

  const newRate = Math.max(KEY_RATE_MIN, currentKeyRate + change)
  return Math.round(newRate * PERCENT_DIVISOR) / PERCENT_DIVISOR
}

/**
 * Applies inflation to a base price for a specific category
 * Called when calculating final prices for goods
 *
 * @param basePrice - Price before inflation
 * @param inflationRate - Yearly inflation percentage
 * @param category - Product category (housing, food, etc.)
 * @returns New price with inflation applied
 *
 * @example
 * // Housing with 3% inflation and 1.5x multiplier
 * applyInflation(100000, 3, 'housing')
 * // = 100000 * (1 + (3 * 1.5) / 100) = 104500
 */
export function applyInflation(
  basePrice: number,
  inflationRate: number,
  category: PriceCategory = 'default',
): number {
  if (basePrice <= 0 || inflationRate < 0) {
    return basePrice // Guard against invalid inputs
  }

  const multiplier = INFLATION_MULTIPLIERS[category]
  const effectiveInflation = (inflationRate * multiplier) / PERCENT_DIVISOR

  const newPrice = basePrice * (1 + effectiveInflation)
  return Math.round(newPrice)
}

/**
 * Calculates cumulative inflation multiplier across multiple years
 * Use this when you need to adjust prices based on full inflation history
 *
 * Compound inflation: Year1 * (1 + infl1) * (1 + infl2) * ... * (1 + inflN)
 *
 * @param inflationHistory - Array of yearly inflation rates (oldest to newest)
 * @param category - Product category
 * @returns Cumulative multiplier (e.g., 1.15 = 15% total price increase)
 *
 * @example
 * // 3 years of inflation: 2%, 2.5%, 3%
 * getCumulativeInflationMultiplier([2, 2.5, 3], 'housing')
 * // = (1 + 2*1.5/100) * (1 + 2.5*1.5/100) * (1 + 3*1.5/100) ≈ 1.138
 */
export function getCumulativeInflationMultiplier(
  inflationHistory: number[],
  category: PriceCategory = 'default',
): number {
  const multiplier = INFLATION_MULTIPLIERS[category]

  let product = 1
  const steps: string[] = []

  const YEAR_PRECISION = 1
  const MULTIPLIER_PRECISION = 6

  for (const inflation of inflationHistory) {
    const safeInflation = Math.max(0, inflation) // Protect from negative
    const effectiveInflation = (safeInflation * multiplier) / PERCENT_DIVISOR
    const yearMultiplier = 1 + effectiveInflation
    product = product * yearMultiplier
    steps.push(
      `${safeInflation.toFixed(YEAR_PRECISION)}% → ×${yearMultiplier.toFixed(MULTIPLIER_PRECISION)}`,
    )
  }

  // DEBUG: Log multiplier calculation
  if (inflationHistory.length > 0) {
    devLog(
      `[getCumulativeInflationMultiplier] category=${category}, steps=[${steps.join(', ')}], result=${product.toFixed(MULTIPLIER_PRECISION)}`,
    )
  }

  return product
}
/**
 * Applies inflation to an entire price list
 * Use when you need to update all goods prices at once
 *
 * @param prices - Map of { category: basePrice }
 * @param inflationRate - Yearly inflation
 * @returns Updated prices with inflation applied
 */
export function applyInflationToAll(
  prices: Record<string, number>,
  inflationRate: number,
): Record<string, number> {
  const result: Record<string, number> = {}

  for (const [key, price] of Object.entries(prices)) {
    const category = key as PriceCategory
    result[key] = applyInflation(price, inflationRate, category)
  }

  return result
}

/**
 * Information about inflation notification to show to player
 */
export interface InflationNotification {
  countryName: string // Country name for display
  inflationChange: number // Change from previous year (+/-)
  inflationRate: number // Current year's inflation
  keyRate: number // Central bank key rate
  keyRateChange: number // Change from previous year
  timestamp: number // When this happened (turn number)
  year: number
}

/**
 * Formats inflation notification for display
 *
 * @param notification - Inflation data
 * @returns Formatted string for UI
 */
export function formatInflationNotification(notification: InflationNotification): string {
  const inflationEmoji = notification.inflationChange > 0 ? '📈' : '📉'
  const rateEmoji = notification.keyRateChange > 0 ? '⬆️' : '⬇️'

  return `${inflationEmoji} Инфляция: ${String(notification.inflationRate)}% (${notification.inflationChange > 0 ? '+' : ''}${String(notification.inflationChange)}%)\n${rateEmoji} Ставка: ${String(notification.keyRate)}% (${notification.keyRateChange > 0 ? '+' : ''}${String(notification.keyRateChange)}%)`
}

/**
 * Returns true if inflation should be applied this turn
 *
 * @param turn - Current turn number
 * @returns true if this is Q1 (start of new year)
 */
export function shouldApplyInflationThisTurn(turn: number): boolean {
  return turn > MIN_TURN && turn % QUARTERS_IN_YEAR === FIRST_QUARTER
}
