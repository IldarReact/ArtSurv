import type { ThresholdEffectsResult } from './types'

export function checkSanityEffects(sanity: number): Partial<ThresholdEffectsResult> {
  const result: Partial<ThresholdEffectsResult> = {
    businessEfficiency: 1.0,
    canManageBusiness: true,
    events: [],
    therapyCosts: 0,
  }

  const THRESHOLD_CRITICAL_LOW = 10
  const THRESHOLD_CRITICAL = 20
  const THRESHOLD_WARNING = 30

  const THERAPY_COSTS_CRITICAL_LOW = 1000
  const THERAPY_COSTS_CRITICAL = 500

  const EFFICIENCY_CRITICAL_LOW = 0.3
  const EFFICIENCY_CRITICAL = 0.6
  const EFFICIENCY_WARNING = 0.8

  if (sanity < THRESHOLD_CRITICAL_LOW) {
    result.canManageBusiness = false
    result.therapyCosts = THERAPY_COSTS_CRITICAL_LOW
    result.events?.push({
      message: 'ПАНИКА! Вы теряете контроль. Управление бизнесом невозможно.',
      severity: 'critical',
      type: 'sanity',
    })
    result.businessEfficiency = EFFICIENCY_CRITICAL_LOW
  } else if (sanity < THRESHOLD_CRITICAL) {
    result.therapyCosts = THERAPY_COSTS_CRITICAL
    result.events?.push({
      message: 'Вы на грани срыва. Высокий риск ошибок и конфликтов!',
      severity: 'critical',
      type: 'sanity',
    })
    result.businessEfficiency = EFFICIENCY_CRITICAL
  } else if (sanity < THRESHOLD_WARNING) {
    result.events?.push({
      message: 'Повышенная тревожность. Рекомендуется отдых или помощь психолога.',
      severity: 'warning',
      type: 'sanity',
    })
    result.businessEfficiency = EFFICIENCY_WARNING
  }

  return result
}
