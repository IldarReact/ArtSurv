// Helper functions for creating financial report structures
import type {
  QuarterlyReport,
  IncomeBreakdown,
  ExpensesBreakdown,
  TaxesBreakdown,
} from '@/core/types'

export function createEmptyIncomeBreakdown(): IncomeBreakdown {
  return {
    assetIncome: 0,
    businessRevenue: 0,
    capitalGains: 0,
    familyIncome: 0,
    salary: 0,
    total: 0,
  }
}

export function createEmptyExpensesBreakdown(): ExpensesBreakdown {
  return {
    assetMaintenance: 0,
    business: 0,
    credits: 0,
    debtInterest: 0,
    family: 0, // Deprecated
    food: 0,
    housing: 0,
    living: 0,
    mortgage: 0,
    other: 0,
    total: 0,
    transport: 0,
  }
}

export function createEmptyTaxesBreakdown(): TaxesBreakdown {
  return {
    business: 0,
    capital: 0,
    income: 0,
    property: 0,
    total: 0,
  }
}

/**
 * Safely converts a potentially null, undefined, or NaN value to a number.
 */
export function sanitizeNumber(val: number | null | undefined, defaultValue = 0): number {
  if (val === null || val === undefined || Number.isNaN(val)) {
    return defaultValue
  }
  return val
}

export function createEmptyQuarterlyReport(): QuarterlyReport {
  return {
    expenses: createEmptyExpensesBreakdown(),
    income: createEmptyIncomeBreakdown(),
    netProfit: 0,
    taxes: createEmptyTaxesBreakdown(),
    warning: null,
  }
}
