import { describe, expect, it } from 'vitest'

import {
  normalizeDurationFromTurns,
  normalizeDurationMonths,
} from '@/core/lib/stats/stat-change-format'

describe('stat-change-format', () => {
  it('normalizes month durations to multiples of 3', () => {
    expect(normalizeDurationMonths(1)).toBe(3)
    expect(normalizeDurationMonths(2)).toBe(3)
    expect(normalizeDurationMonths(4)).toBe(6)
    expect(normalizeDurationMonths(5)).toBe(6)
  })

  it('converts turn durations to month durations', () => {
    expect(normalizeDurationFromTurns(1)).toBe(3)
    expect(normalizeDurationFromTurns(2)).toBe(6)
    expect(normalizeDurationFromTurns(3)).toBe(9)
  })
})
