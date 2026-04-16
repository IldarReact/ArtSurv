import type { StatEffect } from './stats.types'

/**
 * Common types for items that progress over time (turns)
 */

export interface Progressable {
  costPerTurn?: StatEffect
  id: string
  remainingDuration: number
  title: string
  totalDuration: number
}

export interface ProgressResult<T extends Progressable> {
  active: T[]
  completed: T[]
}
