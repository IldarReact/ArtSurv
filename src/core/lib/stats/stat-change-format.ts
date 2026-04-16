import { MONTHS_PER_QUARTER } from '@/core/lib/time/constants'
import type { StatChangeEffect, StatEffect } from '@/core/types/stats.types'

export function normalizeDurationMonths(rawDurationMonths: number): number {
  if (!Number.isFinite(rawDurationMonths) || rawDurationMonths <= 0) {
    return MONTHS_PER_QUARTER
  }

  return Math.max(
    MONTHS_PER_QUARTER,
    Math.ceil(rawDurationMonths / MONTHS_PER_QUARTER) * MONTHS_PER_QUARTER,
  )
}

export function createTemporaryStatChange(
  effects: StatEffect,
  rawDurationMonths: number,
): StatChangeEffect {
  return {
    durationMonths: normalizeDurationMonths(rawDurationMonths),
    effects,
    kind: 'temporary',
  }
}

export function normalizeDurationFromTurns(rawDurationTurns: number): number {
  return normalizeDurationMonths(rawDurationTurns * MONTHS_PER_QUARTER)
}
