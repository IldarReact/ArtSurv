export interface TaxResult {
  netProfit: number
  taxAmount: number
  taxRatePercent: number
}

const DEFAULT_TAX_RATE = 15
const PERCENT_DIVISOR = 100
const DECIMAL_RATE_THRESHOLD = 1

export function calculateTaxes(
  ebitda: number,
  corporateTaxRatePercent: number | undefined,
  businessDefaultTaxRate = DEFAULT_TAX_RATE,
  taxReductionPct = 0,
): TaxResult {
  const baseRate = corporateTaxRatePercent ?? businessDefaultTaxRate
  const normalizedRate =
    Number.isFinite(baseRate) && baseRate <= DECIMAL_RATE_THRESHOLD
      ? baseRate * PERCENT_DIVISOR
      : baseRate
  const rawTaxRatePercent = Number.isFinite(normalizedRate) ? normalizedRate : DEFAULT_TAX_RATE
  const taxRatePercent = Math.max(
    0,
    rawTaxRatePercent * (1 - Math.max(0, taxReductionPct) / PERCENT_DIVISOR),
  )

  const taxAmount = ebitda > 0 ? ebitda * (taxRatePercent / PERCENT_DIVISOR) : 0
  const netProfit = ebitda - taxAmount

  return {
    netProfit,
    taxAmount,
    taxRatePercent,
  }
}

/**
 * Рассчитывает примерную месячную прибыль для отображения в UI
 */
export function calculateEstimatedMonthlyProfit(
  monthlyIncome: number,
  monthlyExpenses: number,
  corporateTaxRatePercent = DEFAULT_TAX_RATE,
): number {
  const ebitda = monthlyIncome - monthlyExpenses
  const rate =
    typeof corporateTaxRatePercent === 'number' ? corporateTaxRatePercent : DEFAULT_TAX_RATE
  const normalizedPct = rate <= DECIMAL_RATE_THRESHOLD ? rate * PERCENT_DIVISOR : rate
  const tax = ebitda > 0 ? ebitda * (normalizedPct / PERCENT_DIVISOR) : 0
  return Math.round(ebitda - tax)
}
