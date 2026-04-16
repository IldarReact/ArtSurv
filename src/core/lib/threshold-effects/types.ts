import type { StatEffect } from '@/core/types/stats.types'

export interface ThresholdEffectsResult {
  businessEfficiency: number
  canManageBusiness: boolean
  canStudy: boolean

  canWork: boolean
  events: {
    type: 'health' | 'sanity' | 'intelligence' | 'happiness'
    severity: 'warning' | 'critical'
    message: string
  }[]

  learningEfficiency: number

  medicalCosts: number
  therapyCosts: number
  workEfficiency: number
}

export type ThresholdCheckInput = StatEffect
