import type { CountryEconomy } from '@/core/types/economy.types'
import type { Asset, TaxesBreakdown } from '@/core/types/finance.types'

import { sanitizeNumber } from '../financial-helpers'

const PERCENT_DIVISOR = 100
const QUARTERS_IN_YEAR = 4
const YEARLY_PROPERTY_TAX_RATE = 0.5 // 0.5%
const PROPERTY_TAX_QUARTERLY_RATE = YEARLY_PROPERTY_TAX_RATE / PERCENT_DIVISOR / QUARTERS_IN_YEAR

interface Params {
  assets: Asset[]
  country: CountryEconomy
  income: number
}

export function calculateQuarterlyTaxes({ assets, country, income }: Params): TaxesBreakdown {
  // 1. Personal Income Tax (Salary, dividends, family income, etc.)
  const incomeTaxRate = sanitizeNumber(country.taxRate)
  const incomeTax = income * (incomeTaxRate / PERCENT_DIVISOR)

  // 2. Property Tax (e.g. 0.5% yearly -> 0.125% quarterly)
  let propertyTax = 0
  for (const a of assets) {
    if (a.type === 'housing') {
      propertyTax += sanitizeNumber(a.currentValue) * PROPERTY_TAX_QUARTERLY_RATE
    }
  }

  // 3. Capital Gains Tax (not implemented yet, but keeping for structure)
  const capitalGainsTax = 0

  return {
    business: 0, // Business tax is usually corporate tax, calculated separately per business
    capital: Math.round(sanitizeNumber(capitalGainsTax)),
    income: Math.round(sanitizeNumber(incomeTax)),
    property: Math.round(sanitizeNumber(propertyTax)),
    total: Math.round(
      sanitizeNumber(incomeTax) + sanitizeNumber(propertyTax) + sanitizeNumber(capitalGainsTax),
    ),
  }
}
