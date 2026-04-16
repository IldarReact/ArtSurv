import {
  getRandomNegativeEvent,
  getRandomPositiveEvent,
} from '@/core/lib/data-loaders/static-data-loader'
import type { Skill } from '@/core/types'
import type { Business, BusinessEvent } from '@/core/types/business.types'

import { getRoleConfig } from './employee-roles.config'
import { getPlayerRoleBusinessImpact } from './player-roles'

const MIN_BUSINESS_AGE_FOR_EVENTS = 4
const EVENT_CHANCE_THRESHOLD = 0.4
const BASE_NEGATIVE_CHANCE = 0.15
const EFFICIENCY_REPUTATION_WEIGHT = 400

/**
 * Генерирует случайные события для бизнеса
 */
export function generateBusinessEvents(
  business: Business,
  currentTurn: number,
  playerSkills?: Skill[],
): BusinessEvent[] {
  const state = business.state
  if (state !== 'active') return []

  // Считаем бонус защиты от юристов
  let legalProtectionPct = 0

  // Бонус от игрока
  if (playerSkills && playerSkills.length > 0) {
    const playerImpact = getPlayerRoleBusinessImpact(business, playerSkills)
    legalProtectionPct += playerImpact.legalProtection
  }

  // Бонус от сотрудников
  business.employees.forEach((emp) => {
    const cfg = getRoleConfig(emp.role)
    const impact = cfg?.staffImpact ? cfg.staffImpact(emp.stars) : undefined
    if (impact?.legalProtection) {
      const effortFactor = (emp.effortPercent ?? 100) / 100
      legalProtectionPct += impact.legalProtection * effortFactor
    }
  })

  const events: BusinessEvent[] = []

  // New businesses (less than 4 quarters) have 0 events for stability
  const businessAge = currentTurn - business.foundedTurn
  if (businessAge < MIN_BUSINESS_AGE_FOR_EVENTS) return []

  // 0-1 event per quarter (reduced from 0-3)
  const eventCount = Math.random() < EVENT_CHANCE_THRESHOLD ? 1 : 0

  // Lowered base negative chance from 0.3 to 0.15
  let negativeChance =
    BASE_NEGATIVE_CHANCE +
    (100 - business.efficiency) / EFFICIENCY_REPUTATION_WEIGHT +
    (100 - business.reputation) / EFFICIENCY_REPUTATION_WEIGHT

  // Применяем юридическую защиту (снижаем шанс в % от текущего шанса)
  if (legalProtectionPct > 0) {
    const protectionFactor = Math.max(0, 1 - legalProtectionPct / 100)
    negativeChance *= protectionFactor
  }

  for (let i = 0; i < eventCount; i++) {
    const isNegative = Math.random() < negativeChance

    if (isNegative) {
      const evt = getRandomNegativeEvent()

      // Рассчитываем динамические эффекты
      const moneyEffect = evt.effects.moneyPercentage
        ? Math.round(
            business.inventory.currentStock *
              business.inventory.purchaseCost *
              evt.effects.moneyPercentage,
          )
        : (evt.effects.money ?? 0)

      events.push({
        description: evt.description,
        effects: {
          efficiency: evt.effects.efficiency ?? 0,
          money: moneyEffect,
          reputation: evt.effects.reputation ?? 0,
        },
        id: `evt_${String(Date.now())}_${String(Math.random())}`,
        title: evt.title,
        turn: currentTurn,
        type: 'negative',
      })
    } else {
      const evt = getRandomPositiveEvent()

      events.push({
        description: evt.description,
        effects: {
          efficiency: evt.effects.efficiency ?? 0,
          money: evt.effects.money ?? 0,
          reputation: evt.effects.reputation ?? 0,
        },
        id: `evt_${String(Date.now())}_${String(Math.random())}`,
        title: evt.title,
        turn: currentTurn,
        type: 'positive',
      })
    }
  }

  return events
}
