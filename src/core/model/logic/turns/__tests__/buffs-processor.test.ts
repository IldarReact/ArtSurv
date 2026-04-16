import { describe, expect, it } from 'vitest'

import type { TimedBuff } from '@/core/types'

import { processBuffs } from '../buffs-processor'

describe('Buffs Processor', () => {
  const mockBuff: TimedBuff = {
    description: 'Test Buff',
    duration: 6,
    effects: { energy: 10 },
    id: 'buff-1',
    remainingDuration: 6,
    source: 'item',
    title: 'Test',
    totalDuration: 6,
  }

  const mockCtx = {
    turn: 1,
    year: 1,
  }

  it('should decrease buff duration and remove expired buffs', () => {
    const buffs: TimedBuff[] = [{ ...mockBuff, remainingDuration: 3 }]

    const result = processBuffs(buffs, mockCtx)

    expect(result.activeBuffs).toHaveLength(0)
    expect(result.notifications).toHaveLength(1)
    expect(result.notifications[0].title).toBe('Эффект закончился')
  })

  it('should keep buffs with remaining duration', () => {
    const buffs: TimedBuff[] = [{ ...mockBuff, remainingDuration: 6 }]

    const result = processBuffs(buffs, mockCtx)

    expect(result.activeBuffs).toHaveLength(1)
    expect(result.activeBuffs[0].remainingDuration).toBe(3)
    expect(result.notifications).toHaveLength(0)
  })

  it('should apply buff effects to stat modifiers', () => {
    const buffs: TimedBuff[] = [mockBuff]

    const result = processBuffs(buffs, mockCtx)

    expect(result.statModifiers.energy).toBe(10)
  })

  it('should collect money delta from buffs', () => {
    const buffs: TimedBuff[] = [
      {
        ...mockBuff,
        effects: { money: 100 },
        id: 'money-buff',
      },
    ]

    const result = processBuffs(buffs, mockCtx)

    expect(result.moneyDelta).toBe(100)
    expect(result.statModifiers.money).toBeUndefined()
  })
})
