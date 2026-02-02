import type { Player, QuarterlyReport } from '@/core/types'

// Calculate quarterly financial report based on player type
import { calculateBusinessOwnerQuarterlyReport } from '../report/business-owner'
import { calculateEmployeeQuarterlyReport } from '../report/employee'
import { calculateMixedQuarterlyReport } from '../report/mixed'
import type { QuarterlyReportParams } from '../report/report.types'

/**
 * Determines the player's primary activity type
 */
export function determinePlayerType(player: Player): 'employee' | 'business_owner' | 'mixed' {
  const hasJob = player.quarterlySalary > 0 || player.jobs.length > 0
  const hasBusiness = player.businesses.length > 0

  if (hasJob && hasBusiness) return 'mixed'
  if (hasBusiness) return 'business_owner'
  return 'employee'
}

export type { QuarterlyReportParams }

// Delegated implementations moved to smaller modules under report/

/**
 * Main function to calculate quarterly report based on player type
 */
export function calculateQuarterlyReport(params: QuarterlyReportParams): QuarterlyReport {
  const playerType = determinePlayerType(params.player)

  switch (playerType) {
    case 'employee':
      return calculateEmployeeQuarterlyReport(params)
    case 'business_owner':
      return calculateBusinessOwnerQuarterlyReport(params)
    case 'mixed':
      return calculateMixedQuarterlyReport(params)
  }
}
