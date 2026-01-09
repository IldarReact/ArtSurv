import type { StatEffect } from './stats.types'

/**
 * Common types for items that progress over time (turns)
 */

export interface Progressable {
  id: string
  title: string
  totalDuration: number
  remainingDuration: number
  costPerTurn?: StatEffect
}

export interface ProgressResult<T extends Progressable> {
  active: T[]
  completed: T[]
}
