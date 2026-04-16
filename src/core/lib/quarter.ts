export const Q1 = 1
export const Q2 = 2
export const Q3 = 3
export const Q4 = 4
export type Quarter = typeof Q1 | typeof Q2 | typeof Q3 | typeof Q4

const QUARTERS_PER_YEAR = 4

// turn: 0 -> Q1, 1 -> Q2, 2 -> Q3, 3 -> Q4, 4 -> Q1 ...
export function getQuarter(turn: number): Quarter {
  return ((((turn % QUARTERS_PER_YEAR) + QUARTERS_PER_YEAR) % QUARTERS_PER_YEAR) + Q1) as Quarter
}

export function isQuarterEnd(turn: number): boolean {
  return getQuarter(turn) === Q4
}

export function isNewYearTurn(turn: number): boolean {
  return turn > 0 && getQuarter(turn) === Q1
}

export function formatGameDate(year: number, turn: number): string {
  return `${String(year)} Q${String(getQuarter(turn))}`
}
