const MONTHS_IN_QUARTER = 3
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const LOAN_TERMS = [3, 6, 9, 12, 18, 24, 30, 36, 48, 60, 84, 120, 180, 240, 300, 360] as const

export function validateLoanTerm(months: number): number | null {
  if (months < MONTHS_IN_QUARTER || months % MONTHS_IN_QUARTER !== 0) return null
  return months / MONTHS_IN_QUARTER
}

export function getAvailableLoanTerms(): number[] {
  return [...LOAN_TERMS]
}
