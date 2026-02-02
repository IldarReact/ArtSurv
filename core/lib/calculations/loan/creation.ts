import type { Debt } from '@/core/types'

import { calculateQuarterlyPayment } from './amortization'

const PERCENT_DIVISOR = 100
const QUARTERS_IN_YEAR = 4

export function createDebt(
  principal: number,
  annualRate: number,
  quarters: number,
  type: Debt['type'],
  name: string,
  currentTurn: number,
): Debt {
  const quarterlyPayment = calculateQuarterlyPayment(principal, annualRate, quarters)
  const quarterlyRate = annualRate / PERCENT_DIVISOR / QUARTERS_IN_YEAR
  const interest = Math.round(principal * quarterlyRate)
  const principalPart = Math.max(0, quarterlyPayment - interest)

  return {
    id: `debt_${String(Date.now())}_${crypto.randomUUID()}`,
    interestRate: annualRate,
    name,

    principalAmount: principal,
    quarterlyInterest: interest,

    quarterlyPayment,

    quarterlyPrincipal: principalPart,
    remainingAmount: principal,
    remainingQuarters: quarters,

    startTurn: currentTurn,
    termQuarters: quarters,

    type,
  }
}

export function calculateEarlyRepayment(debt: Debt): number {
  return Math.round(debt.remainingAmount)
}

export function processEarlyRepayment(debt: Debt, amount: number): Debt {
  const newRemaining = Math.max(0, debt.remainingAmount - amount)

  if (newRemaining === 0) {
    return {
      ...debt,
      remainingAmount: 0,
      remainingQuarters: 0,
    }
  }

  const newQuarterlyPayment = calculateQuarterlyPayment(
    newRemaining,
    debt.interestRate,
    debt.remainingQuarters,
  )

  return {
    ...debt,
    quarterlyPayment: newQuarterlyPayment,
    remainingAmount: newRemaining,
  }
}
