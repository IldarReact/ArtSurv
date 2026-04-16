import type { Notification } from '@/core/types/notification.types'
import type { StatEffect } from '@/core/types/stats.types'

import { getQuarter } from './quarter'
import { checkHappinessEffects } from './threshold-effects/happiness'
import { checkHealthEffects } from './threshold-effects/health'
import { checkIntelligenceEffects } from './threshold-effects/intelligence'
import { checkSanityEffects } from './threshold-effects/sanity'

export type { ThresholdEffectsResult } from './threshold-effects/types'

export function checkAllThresholdEffects(stats: StatEffect) {
  const healthEffects = checkHealthEffects(stats.health ?? 0)
  const sanityEffects = checkSanityEffects(stats.sanity ?? 0)
  const intelligenceEffects = checkIntelligenceEffects(stats.intelligence ?? 0)
  const happinessEffects = checkHappinessEffects(stats.happiness ?? 0)

  return {
    businessEfficiency: sanityEffects.businessEfficiency ?? 1.0,
    canManageBusiness: sanityEffects.canManageBusiness ?? true,
    canStudy: intelligenceEffects.canStudy ?? true,

    canWork: healthEffects.canWork ?? true,
    events: [
      ...(healthEffects.events ?? []),
      ...(sanityEffects.events ?? []),
      ...(intelligenceEffects.events ?? []),
      ...(happinessEffects.events ?? []),
    ],

    learningEfficiency: intelligenceEffects.learningEfficiency ?? 1.0,

    medicalCosts: healthEffects.medicalCosts ?? 0,
    therapyCosts: sanityEffects.therapyCosts ?? 0,
    workEfficiency: Math.min(
      healthEffects.workEfficiency ?? 1.0,
      happinessEffects.workEfficiency ?? 1.0,
    ),
  }
}

export function generateLowStatEvents(
  stats: StatEffect,
  turn: number,
  year: number,
): Notification[] {
  const notifications: Notification[] = []
  const quarter = getQuarter(turn)

  const LOW_STAT_THRESHOLD = 20
  const WORK_CONFLICT_CHANCE = 0.15
  const BUSINESS_ERROR_CHANCE = 0.1
  const REPUTATION_LOSS = 5
  const FAMILY_CONFLICT_CHANCE = 0.15
  const RELATIONSHIP_LOSS = 10

  if ((stats.sanity ?? 0) < LOW_STAT_THRESHOLD && Math.random() < WORK_CONFLICT_CHANCE) {
    notifications.push({
      date: `${String(year)} Q${String(quarter)}`,
      id: `conflict_work_${String(Date.now())}`,
      isRead: false,
      message: 'Из-за стресса вы поссорились с коллегой. Постарайтесь отдохнуть.',
      title: '⚠️ Конфликт на работе',
      type: 'warning',
    })
  }

  if ((stats.sanity ?? 0) < LOW_STAT_THRESHOLD && Math.random() < BUSINESS_ERROR_CHANCE) {
    notifications.push({
      data: { reputationLoss: REPUTATION_LOSS },
      date: `${String(year)} Q${String(quarter)}`,
      id: `business_error_${String(Date.now())}`,
      isRead: false,
      message: 'Из-за усталости вы допустили небольшую ошибку в расчетах.',
      title: '📉 Ошибка в бизнесе',
      type: 'warning',
    })
  }

  if (
    ((stats.sanity ?? 0) < LOW_STAT_THRESHOLD || (stats.happiness ?? 0) < LOW_STAT_THRESHOLD) &&
    Math.random() < FAMILY_CONFLICT_CHANCE
  ) {
    notifications.push({
      data: { relationshipLoss: RELATIONSHIP_LOSS },
      date: `${String(year)} Q${String(quarter)}`,
      id: `family_conflict_${String(Date.now())}`,
      isRead: false,
      message: 'Ваше состояние привело к ссоре с близкими. Отношения ухудшились.',
      title: '💔 Семейный конфликт',
      type: 'warning',
    })
  }

  return notifications
}
