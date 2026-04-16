/**
 * Rate calculations and credit rating helpers
 */
import type { Debt } from '@/core/types'

const DEFAULT_CREDIT_RATING = 70
const MIN_CREDIT_RATING = 0
const MAX_CREDIT_RATING = 100
const RATING_MARKUP_DIVISOR = 20
const MONTHS_IN_QUARTER = 3
const HIGH_DEBT_RATIO = 0.5
const MEDIUM_DEBT_RATIO = 0.3
const HIGH_CASH_THRESHOLD = 100_000
const LOW_CASH_THRESHOLD = 10_000
const MIN_TAKE_LOAN_RATING = 30
const DEBT_COUNT_PENALTY = 5
const HIGH_DEBT_RATIO_PENALTY = 20
const MEDIUM_DEBT_RATIO_PENALTY = 10
const HIGH_CASH_BONUS = 10
const LOW_CASH_PENALTY = 5

const BASE_MARKUP_CONSUMER = 5
const BASE_MARKUP_MORTGAGE = 2
const BASE_MARKUP_STUDENT = 1

const MAX_LOAN_MULT_CONSUMER = 24
const MAX_LOAN_MULT_MORTGAGE = 120
const MAX_LOAN_MULT_STUDENT = 60

const BASE_MARKUPS: Record<string, number> = {
  consumer_credit: BASE_MARKUP_CONSUMER,
  mortgage: BASE_MARKUP_MORTGAGE,
  student_loan: BASE_MARKUP_STUDENT,
}

const MAX_LOAN_MULTIPLIERS: Record<string, number> = {
  consumer_credit: MAX_LOAN_MULT_CONSUMER,
  mortgage: MAX_LOAN_MULT_MORTGAGE,
  student_loan: MAX_LOAN_MULT_STUDENT,
}

export function calculateLoanRate(
  keyRate: number,
  debtType: Debt['type'],
  creditRating = DEFAULT_CREDIT_RATING,
): number {
  const ratingMarkup = (MAX_CREDIT_RATING - creditRating) / RATING_MARKUP_DIVISOR

  return Number((keyRate + BASE_MARKUPS[debtType] + ratingMarkup).toFixed(2))
}

export function calculateCreditRating({
  activeDebts,
  cash,
  monthlyIncome,
}: {
  activeDebts: Debt[]
  monthlyIncome: number
  cash: number
}): number {
  let rating = DEFAULT_CREDIT_RATING
  rating -= activeDebts.length * DEBT_COUNT_PENALTY

  let totalQuarterlyPayments = 0
  for (const d of activeDebts) {
    totalQuarterlyPayments += d.quarterlyPayment
  }
  const monthlyPayments = totalQuarterlyPayments / MONTHS_IN_QUARTER
  const debtRatio = monthlyIncome > 0 ? monthlyPayments / monthlyIncome : 1

  if (debtRatio > HIGH_DEBT_RATIO) rating -= HIGH_DEBT_RATIO_PENALTY
  else if (debtRatio > MEDIUM_DEBT_RATIO) rating -= MEDIUM_DEBT_RATIO_PENALTY

  if (cash > HIGH_CASH_THRESHOLD) rating += HIGH_CASH_BONUS
  else if (cash < LOW_CASH_THRESHOLD) rating -= LOW_CASH_PENALTY

  return Math.max(MIN_CREDIT_RATING, Math.min(MAX_CREDIT_RATING, rating))
}

export function calculateMaxLoanAmount(
  monthlyIncome: number,
  activeDebts: Debt[],
  debtType: Debt['type'],
): number {
  let totalQuarterlyPayments = 0
  for (const d of activeDebts) {
    totalQuarterlyPayments += d.quarterlyPayment
  }
  const currentMonthlyDebt = totalQuarterlyPayments / MONTHS_IN_QUARTER
  const maxAllowedPayment = monthlyIncome * HIGH_DEBT_RATIO - currentMonthlyDebt
  if (maxAllowedPayment <= 0) return 0

  return Math.floor(maxAllowedPayment * MAX_LOAN_MULTIPLIERS[debtType])
}

export function canTakeLoan({
  activeDebts,
  amount,
  cash,
  debtType,
  monthlyIncome,
}: {
  amount: number
  debtType: Debt['type']
  cash: number
  monthlyIncome: number
  activeDebts: Debt[]
}): boolean {
  const maxAmount = calculateMaxLoanAmount(monthlyIncome, activeDebts, debtType)
  const rating = calculateCreditRating({ activeDebts, cash, monthlyIncome })
  return amount <= maxAmount && rating >= MIN_TAKE_LOAN_RATING
}
