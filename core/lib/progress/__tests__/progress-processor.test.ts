import { describe, it, expect } from 'vitest'

import type { Progressable } from '@/core/types/progress.types'

import { processProgress } from '../progress-processor'

describe('progress-processor', () => {
  it('should decrement remainingDuration for active items', () => {
    const items: Progressable[] = [
      { id: '1', remainingDuration: 3, title: 'Test 1', totalDuration: 5 },
      { id: '2', remainingDuration: 10, title: 'Test 2', totalDuration: 10 },
    ]

    const result = processProgress(items)

    expect(result.active).toHaveLength(2)
    expect(result.completed).toHaveLength(0)
    expect(result.active[0].remainingDuration).toBe(2)
    expect(result.active[1].remainingDuration).toBe(9)
  })

  it('should move items to completed when remainingDuration reaches 0', () => {
    const items: Progressable[] = [
      { id: '1', remainingDuration: 1, title: 'Test 1', totalDuration: 5 },
      { id: '2', remainingDuration: 5, title: 'Test 2', totalDuration: 10 },
    ]

    const result = processProgress(items)

    expect(result.active).toHaveLength(1)
    expect(result.completed).toHaveLength(1)
    expect(result.completed[0].id).toBe('1')
    expect(result.completed[0].remainingDuration).toBe(0)
    expect(result.active[0].id).toBe('2')
    expect(result.active[0].remainingDuration).toBe(4)
  })

  it('should handle items that are already completed', () => {
    const items: Progressable[] = [
      { id: '1', remainingDuration: 0, title: 'Test 1', totalDuration: 5 },
    ]

    const result = processProgress(items)

    expect(result.active).toHaveLength(0)
    expect(result.completed).toHaveLength(1)
    expect(result.completed[0].remainingDuration).toBe(0)
  })

  it('should work with extended interfaces', () => {
    interface ExtendedProgress extends Progressable {
      extra: string
    }

    const items: ExtendedProgress[] = [
      { extra: 'foo', id: '1', remainingDuration: 3, title: 'Test 1', totalDuration: 5 },
    ]

    const result = processProgress(items)

    expect(result.active[0].extra).toBe('foo')
    expect(result.active[0].remainingDuration).toBe(2)
  })
})
