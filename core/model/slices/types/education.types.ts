import type { StatEffect } from '@/core/types/stats.types'

export interface EducationSlice {
  applyToUniversity: (
    programName: string,
    cost: number,
    costPerTurn: StatEffect,
    skillBonus: string,
    duration: number,
  ) => void
  // Actions
  studyCourse: (
    courseName: string,
    cost: number,
    costPerTurn: StatEffect,
    skillBonus: string,
    duration: number,
  ) => void
}
