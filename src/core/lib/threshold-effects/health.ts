import type { ThresholdEffectsResult } from './types'

export function checkHealthEffects(health: number): Partial<ThresholdEffectsResult> {
  const result: Partial<ThresholdEffectsResult> = {
    canWork: true,
    events: [],
    medicalCosts: 0,
    workEfficiency: 1.0,
  }

  const THRESHOLD_CRITICAL_LOW = 10
  const THRESHOLD_CRITICAL = 20
  const THRESHOLD_WARNING = 30

  const COSTS_CRITICAL_LOW = 2000
  const COSTS_CRITICAL = 500

  const EFFICIENCY_CRITICAL_LOW = 0
  const EFFICIENCY_CRITICAL = 0.5
  const EFFICIENCY_WARNING = 0.8

  if (health < THRESHOLD_CRITICAL_LOW) {
    result.canWork = false
    result.medicalCosts = COSTS_CRITICAL_LOW
    result.events?.push({
      message: 'Тяжелая болезнь! Вы госпитализированы. Работа и бизнес приостановлены.',
      severity: 'critical',
      type: 'health',
    })
    result.workEfficiency = EFFICIENCY_CRITICAL_LOW
  } else if (health < THRESHOLD_CRITICAL) {
    result.medicalCosts = COSTS_CRITICAL
    result.events?.push({
      message: 'Плохое самочувствие. Необходимо лечение. Эффективность снижена.',
      severity: 'warning',
      type: 'health',
    })
    result.workEfficiency = EFFICIENCY_CRITICAL
  } else if (health < THRESHOLD_WARNING) {
    result.events?.push({
      message: 'Здоровье ухудшается. Обратите внимание на отдых и питание.',
      severity: 'warning',
      type: 'health',
    })
    result.workEfficiency = EFFICIENCY_WARNING
  }

  return result
}
