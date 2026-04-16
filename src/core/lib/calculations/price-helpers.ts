// Хелперы для расчета цен с учетом инфляции
import type { CountryEconomy } from '../../types/economy.types'
import { type PriceCategory, INFLATION_MULTIPLIERS } from './inflation-engine'

const PERCENT_DIVISOR = 100
const QUARTERS_IN_YEAR = 4
const MIN_SALARY_INDEXATION = 0.7
const MAX_SALARY_INDEXATION = 0.9
const BASE_SALARY_INDEXATION = 0.8
const SALARY_MODIFIER_BASE = 1.0
const SALARY_MODIFIER_SENSITIVITY = 0.1
const MONTHS_IN_QUARTER = 3
const SALARY_INDEXATION_YEARS_SKIP = 1

/**
 * Универсальная функция для получения цены с учетом инфляции
 */
export function getInflatedPrice(
  basePrice: number,
  economy: CountryEconomy,
  category: PriceCategory = 'default',
): number {
  if (typeof basePrice !== 'number' || Number.isNaN(basePrice)) {
    return 0
  }
  if (basePrice <= 0) {
    return basePrice
  }

  // Берем историю инфляции из экономики (хранится новые->старые)
  const inflationHistory = economy.inflationHistory ?? []

  // Если истории нет - используем базовую цену (еще не было инфляции)
  if (inflationHistory.length === 0) {
    return basePrice
  }

  // Даже если история содержит только текущую инфляцию - применяем её!
  // История: [2.5] означает что текущий год имеет 2.5% инфляцию
  // Мы должны применить эту инфляцию к цене (не пропускать!)

  // Рассчитываем кумулятивный мультипликатор инфляции
  // История хранится обратно: [current, year-1, year-2, ...]
  // Реверсируем чтобы получить хронологический порядок
  const chronologicalHistory = [...inflationHistory].reverse()

  // Get the category multiplier
  const categoryMultiplier = INFLATION_MULTIPLIERS[category]

  // If no inflation history, return base price
  if (chronologicalHistory.length === 0) {
    return basePrice
  }

  // Calculate cumulative multiplier more efficiently
  let cumulativeMultiplier = 1.0
  for (const inflation of chronologicalHistory) {
    // Apply inflation with category multiplier
    const validInflation = typeof inflation === 'number' && !Number.isNaN(inflation) ? inflation : 0
    cumulativeMultiplier *= 1 + (validInflation * categoryMultiplier) / PERCENT_DIVISOR
  }

  // Round to nearest integer for prices
  const inflatedPrice = Math.round(basePrice * cumulativeMultiplier)

  if (Number.isNaN(inflatedPrice)) {
    return basePrice
  }

  return inflatedPrice
}

/**
 * Получает цену жилья с учетом инфляции
 * Жилье растет быстрее инфляции (multiplier 1.5)
 */
export function getInflatedHousingPrice(basePrice: number, economy: CountryEconomy): number {
  return getInflatedPrice(basePrice, economy, 'housing')
}

/**
 * Получает цену курса/образования с учетом инфляции
 * Образование растет быстрее инфляции (multiplier 1.2)
 */
export function getInflatedEducationPrice(basePrice: number, economy: CountryEconomy): number {
  return getInflatedPrice(basePrice, economy, 'education')
}

/**
 * Получает цену товара в магазине с учетом инфляции
 * @param category - Категория товара (food, health, services, transport, default)
 */
export function getInflatedShopPrice(
  basePrice: number,
  economy: CountryEconomy,
  category: PriceCategory = 'default',
): number {
  return getInflatedPrice(basePrice, economy, category)
}

/**
 * Получает базовую зарплату с учетом инфляции
 * Зарплаты растут почти как инфляция (multiplier 0.95)
 */
export function getInflatedBaseSalary(baseSalary: number, economy: CountryEconomy): number {
  return getInflatedPrice(baseSalary, economy, 'salaries')
}

/**
 * Рассчитывает индексированную зарплату с учетом инфляции
 * В реальном мире зарплаты индексируются на 70-90% от инфляции
 * @param baseSalary - Базовая зарплата (при устройстве на работу)
 * @param economy - Экономика страны
 * @param quartersPassed - Количество прошедших кварталов с момента устройства
 * @returns Индексированная зарплата
 */
export function getInflatedSalary(
  baseSalary: number,
  economy: CountryEconomy,
  quartersPassed = 0,
): number {
  if (typeof baseSalary !== 'number' || Number.isNaN(baseSalary)) {
    return 0
  }
  if (quartersPassed <= 0) {
    return baseSalary
  }

  const inflationHistory = economy.inflationHistory ?? [economy.inflation]

  // Индексация происходит раз в год (каждые 4 квартала)
  const yearsPassed = Math.floor(quartersPassed / QUARTERS_IN_YEAR)

  if (yearsPassed <= 0) {
    return baseSalary
  }

  // Берем историю инфляции за прошедшие годы
  const relevantHistory = inflationHistory.slice(-yearsPassed - 1)

  // Коэффициент индексации: 70-90% от инфляции (детерминированно)
  const salaryMod = economy.salaryModifier
  const indexationRate = Math.max(
    MIN_SALARY_INDEXATION,
    Math.min(
      MAX_SALARY_INDEXATION,
      BASE_SALARY_INDEXATION + (salaryMod - SALARY_MODIFIER_BASE) * SALARY_MODIFIER_SENSITIVITY,
    ),
  )

  // Рассчитываем накопленную индексацию
  let indexedSalary = baseSalary
  for (const yearlyInflation of relevantHistory.slice(SALARY_INDEXATION_YEARS_SKIP)) {
    // Пропускаем первый год (базовый)
    const yearlyIndexation = (yearlyInflation * indexationRate) / PERCENT_DIVISOR
    indexedSalary = indexedSalary * (1 + yearlyIndexation)
  }

  return Math.round(indexedSalary)
}

/**
 * Рассчитывает квартальную зарплату с учетом индексации
 * Используется для отображения текущей зарплаты игрока
 */
export function getQuarterlyInflatedSalary(
  baseQuarterlySalary: number,
  economy: CountryEconomy,
  quartersPassed = 0,
): number {
  // Квартальная зарплата = месячная * 3, индексация применяется к месячной
  const baseMonthlySalary = baseQuarterlySalary / MONTHS_IN_QUARTER
  const indexedMonthlySalary = getInflatedSalary(baseMonthlySalary, economy, quartersPassed)

  return Math.round(indexedMonthlySalary * MONTHS_IN_QUARTER)
}
