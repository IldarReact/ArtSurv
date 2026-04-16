import type { Debt } from '@/core/types'

const PERCENT_DIVISOR = 100
const QUARTERS_IN_YEAR = 4

/**
 * Amortization and payment calculations for loans
 */
export function calculateQuarterlyPayment(
  principal: number,
  annualRate: number,
  quarters: number,
): number {
  if (principal <= 0 || quarters <= 0) return 0

  const quarterlyRate = annualRate / PERCENT_DIVISOR / QUARTERS_IN_YEAR

  if (quarterlyRate === 0) {
    return Math.round(principal / quarters)
  }

  const payment =
    (principal * quarterlyRate * Math.pow(1 + quarterlyRate, quarters)) /
    (Math.pow(1 + quarterlyRate, quarters) - 1)
  return Math.round(payment)
}

export function calculateTotalPayment(quarterlyPayment: number, quarters: number): number {
  return Math.round(quarterlyPayment * quarters)
}

export function calculateOverpayment(totalPayment: number, principal: number): number {
  return Math.round(totalPayment - principal)
}

export function processDebtPayment(debt: Debt): Debt {
  if (debt.remainingQuarters <= 0 || debt.remainingAmount <= 0) return debt

  const quarterlyRate = debt.interestRate / PERCENT_DIVISOR / QUARTERS_IN_YEAR
  const interestPayment = Math.round(debt.remainingAmount * quarterlyRate)
  const principalPayment = Math.max(0, debt.quarterlyPayment - interestPayment)

  return {
    ...debt,
    remainingAmount: Math.max(0, debt.remainingAmount - principalPayment),
    remainingQuarters: debt.remainingQuarters - 1,
  }
}
