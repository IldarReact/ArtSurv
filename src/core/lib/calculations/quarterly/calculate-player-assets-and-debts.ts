import type { CountryEconomy, GlobalEvent } from '@/core/types/economy.types'
import type { Asset, Debt } from '@/core/types/finance.types'

interface CalculationResult {
  cashDelta: number // Changes in cash (e.g. debt payments are negative here if automated, but usually expenses handled separately)
  newAssets: Asset[]
  newDebts: Debt[]
}

interface Params {
  assets: Asset[]
  countryEconomy: CountryEconomy
  debts: Debt[]
  globalEvents: GlobalEvent[]
}

const QUARTERS_IN_YEAR = 4
const PERCENT_DIVISOR = 100
const BASE_HOUSING_QUARTERLY_GROWTH = 0.0025
const RANDOM_OFFSET = 0.5
const RANDOM_SCALE = 2
const STOCK_VOLATILITY = 0.1

export function calculatePlayerAssetsAndDebts({
  assets,
  countryEconomy,
  debts,
}: Params): CalculationResult {
  // 1. Assets value update
  const newAssets = assets.map((asset) => {
    let valueChange = 0

    if (asset.type === 'stock') {
      // Stocks use country-specific stock market inflation + volatility
      const marketMove = (Math.random() - RANDOM_OFFSET) * RANDOM_SCALE * STOCK_VOLATILITY
      // Quarterly growth based on annual stockMarketInflation
      const quarterlyStockGrowth =
        countryEconomy.stockMarketInflation / QUARTERS_IN_YEAR / PERCENT_DIVISOR
      valueChange = asset.value * (marketMove + quarterlyStockGrowth)
    } else if (asset.type === 'housing') {
      // Real estate follows inflation + small growth
      // Quarterly growth based on annual inflation
      const quarterlyGrowth =
        countryEconomy.inflation / QUARTERS_IN_YEAR / PERCENT_DIVISOR +
        BASE_HOUSING_QUARTERLY_GROWTH
      valueChange = asset.value * quarterlyGrowth
    }

    return {
      ...asset,
      value: Math.round(asset.value + valueChange),
    }
  })

  // 2. Debts update (interest accumulation if not paid, but usually we pay monthly)
  // Here we assume debts are just static unless paid off, or maybe variable rate changes
  const newDebts = debts.map(
    (debt) =>
      // If variable rate, update based on country interest rate
      // For now, keep simple
      debt,
  )

  return {
    cashDelta: 0, // No cash change here, income/expenses handled elsewhere
    newAssets,
    newDebts,
  }
}
