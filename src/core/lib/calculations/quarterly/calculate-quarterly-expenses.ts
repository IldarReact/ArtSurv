import type { CountryEconomy } from '@/core/types/economy.types'
import type { Asset } from '@/core/types/finance.types'
import type { PersonalLife } from '@/core/types/personal.types'

import { sanitizeNumber } from '../financial-helpers'

const MONTHS_IN_QUARTER = 3
const BASE_MONTHLY_LIVING_COST = 1000

interface Params {
  assets: Asset[]
  country: CountryEconomy
  personal: PersonalLife
}

export function calculateQuarterlyExpenses({ assets, country, personal }: Params): number {
  // Base cost of living adjusted by country
  const baseLivingCost = BASE_MONTHLY_LIVING_COST * MONTHS_IN_QUARTER * country.costOfLivingModifier

  // Asset maintenance
  let assetMaintenance = 0
  for (const a of assets) {
    assetMaintenance += sanitizeNumber(a.expenses) * MONTHS_IN_QUARTER
  }

  // Family expenses
  let familyExpenses = 0
  for (const member of personal.familyMembers) {
    familyExpenses += sanitizeNumber(member.expenses)
  }

  return Math.round(baseLivingCost + assetMaintenance + familyExpenses)
}
