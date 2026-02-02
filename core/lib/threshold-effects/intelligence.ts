import type { ThresholdEffectsResult } from './types'

export function checkIntelligenceEffects(intelligence: number): Partial<ThresholdEffectsResult> {
  const result: Partial<ThresholdEffectsResult> = {
    canStudy: true,
    events: [],
    learningEfficiency: 1.0,
  }

  const THRESHOLD_CRITICAL_LOW = 10
  const THRESHOLD_CRITICAL = 20
  const THRESHOLD_WARNING = 30

  const EFFICIENCY_CRITICAL_LOW = 0
  const EFFICIENCY_CRITICAL = 0.4
  const EFFICIENCY_WARNING = 0.7

  if (intelligence < THRESHOLD_CRITICAL_LOW) {
    result.canStudy = false
    result.events?.push({
      message: 'Критическая деградация! Вы почти не способны думать. Обучение невозможно.',
      severity: 'critical',
      type: 'intelligence',
    })
    result.learningEfficiency = EFFICIENCY_CRITICAL_LOW
  } else if (intelligence < THRESHOLD_CRITICAL) {
    result.events?.push({
      message: 'Сложно принимать решения. Высокий риск ошибок в бизнесе.',
      severity: 'critical',
      type: 'intelligence',
    })
    result.learningEfficiency = EFFICIENCY_CRITICAL
  } else if (intelligence < THRESHOLD_WARNING) {
    result.events?.push({
      message: 'Вы теряете навыки. Необходимо обучение и развитие.',
      severity: 'warning',
      type: 'intelligence',
    })
    result.learningEfficiency = EFFICIENCY_WARNING
  }

  return result
}
