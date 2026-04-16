// features/bank/lib/bank-rules.ts
import type { Player } from '@/core/types'
import type { CountryEconomy } from '@/core/types/economy.types'

export const calculateCreditLimit = (player: Player): number => {
  // Базовая логика: 3 годовых чистых дохода (или 12 квартальных)
  // Но так как доход может быть нулевым, даем минимальный лимит на основе статов

  const quarterlyIncome = player.quarterlyReport.income.total
  const quarterlyExpenses = player.quarterlyReport.expenses.total
  const avgNetProfit = Math.max(0, quarterlyIncome - quarterlyExpenses)

  // Лимит = 8 квартальных прибылей + 20% от стоимости активов
  const assetsValue = player.assets.reduce((sum, a) => sum + (a.currentValue || 0), 0)

  const baseLimit = avgNetProfit * 8 + assetsValue * 0.2

  // Корректировка на кредитный рейтинг (0-1000)
  const creditScore = player.creditScore
  const score = typeof creditScore === 'number' ? creditScore : creditScore.value
  const scoreMultiplier = score / 600 // 600 - средний балл

  // Минимальный лимит для всех - $1000 (условно на еду)
  return Math.max(1000, Math.round(baseLimit * scoreMultiplier))
}

export const getLoanInterestRate = (country: CountryEconomy, creditScore: number): number => {
  const baseRate = country.keyRate + 5 // База: Ключ + 5%
  const riskPremium = Math.max(0, (800 - creditScore) / 20) // Чем ниже рейтинг, тем выше ставка
  return baseRate + riskPremium
}

export const getDepositInterestRate = (country: CountryEconomy): number => {
  return country.keyRate * 0.8 // Всегда чуть ниже ключа
}
