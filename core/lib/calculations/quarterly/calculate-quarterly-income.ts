import type { Player } from '@/core/types/game.types'

import { sanitizeNumber } from '../financial-helpers'

const MONTHS_IN_QUARTER = 3

export function calculateQuarterlyIncome(player: Player): number {
  // 1. Salary (adjusted by country economy if needed, but usually fixed in contract until changed)
  // Let's say salary grows slightly with GDP
  const salary = sanitizeNumber(player.quarterlySalary)

  // 2. Assets income (dividends, rent)
  let assetsIncome = 0
  for (const asset of player.assets) {
    assetsIncome += sanitizeNumber(asset.income) * MONTHS_IN_QUARTER
  }

  // 3. Family members income
  let familyIncome = 0
  for (const member of player.personal.familyMembers) {
    familyIncome += sanitizeNumber(member.income)
  }

  return salary + assetsIncome + familyIncome
}
