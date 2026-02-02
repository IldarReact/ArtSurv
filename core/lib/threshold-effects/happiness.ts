import type { ThresholdEffectsResult } from './types'

export function checkHappinessEffects(happiness: number): Partial<ThresholdEffectsResult> {
  const result: Partial<ThresholdEffectsResult> = {
    events: [],
    workEfficiency: 1.0,
  }

  const THRESHOLD_CRITICAL_LOW = 10
  const THRESHOLD_CRITICAL = 20
  const THRESHOLD_WARNING = 30

  const EFFICIENCY_CRITICAL_LOW = 0.4
  const EFFICIENCY_CRITICAL = 0.6
  const EFFICIENCY_WARNING = 0.8

  if (happiness < THRESHOLD_CRITICAL_LOW) {
    result.events?.push({
      message: 'Глубокая депрессия. Вы не видите смысла в жизни. Все кажется бессмысленным.',
      severity: 'critical',
      type: 'happiness',
    })
    result.workEfficiency = EFFICIENCY_CRITICAL_LOW
  } else if (happiness < THRESHOLD_CRITICAL) {
    result.events?.push({
      message: 'Эмоциональное истощение. Жизнь теряет краски. Необходим отдых!',
      severity: 'critical',
      type: 'happiness',
    })
    result.workEfficiency = EFFICIENCY_CRITICAL
  } else if (happiness < THRESHOLD_WARNING) {
    result.events?.push({
      message: 'Вы чувствуете себя несчастным. Найдите время для хобби и близких.',
      severity: 'warning',
      type: 'happiness',
    })
    result.workEfficiency = EFFICIENCY_WARNING
  }

  return result
}
