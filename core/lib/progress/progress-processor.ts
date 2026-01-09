import type { Progressable, ProgressResult } from '@/core/types/progress.types'

/**
 * Generic processor for items that progress over turns.
 * Decrements remainingDuration and separates completed items from active ones.
 *
 * @param items Array of items to process
 * @returns Object with updated active items and list of completed items
 */
export function processProgress<T extends Progressable>(items: T[]): ProgressResult<T> {
  const active: T[] = []
  const completed: T[] = []

  for (const item of items) {
    const updated = {
      ...item,
      remainingDuration: Math.max(0, item.remainingDuration - 1),
    }

    if (updated.remainingDuration <= 0) {
      completed.push(updated)
    } else {
      active.push(updated)
    }
  }

  return { active, completed }
}
