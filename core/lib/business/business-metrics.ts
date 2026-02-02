import type { Business } from '../../types/business.types'
import type { Skill } from '../../types/skill.types'
import { BUSINESS_BALANCE } from '../data-loaders/business-balance-loader'
import { calculateTotalBusinessImpact } from './business-impacts'
import { getRoleConfig } from './employee-roles.config'
import { checkMinimumStaffing, getTotalEmployeesCount } from './player-roles'

const MAX_REPUTATION_EVENTS = 4
const PERCENT_DIVISOR = 100
const MAX_STARS = 5
const DEFAULT_STARS = 3

/**
 * Рассчитывает эффективность бизнеса (может быть > 100)
 */
export function calculateEfficiency(business: Business, playerSkills?: Skill[]): number {
  const { metrics } = BUSINESS_BALANCE
  const state = business.state
  if (state !== 'active') return 0

  // 1. Проверка минимального персонала
  const staffingCheck = checkMinimumStaffing(business)
  // Убираем жесткий возврат 0, если персонал не дотягивает.
  // Вместо этого даем штраф к эффективности, но не обнуляем её совсем,
  // так как есть базовая автоматизация (efficiencyBase в impacts).
  const staffingPenalty = staffingCheck.isValid ? 1 : metrics.minStaffingPenalty

  // 2. Получаем консолидированные влияния (включая сотрудников и игрока)
  const impacts = calculateTotalBusinessImpact(business, playerSkills)

  // 3. Базовая эффективность
  let efficiency = impacts.efficiencyBase * staffingPenalty

  // 4. Применяем множитель от менеджеров и HR (в процентах)
  const multiplier = impacts.efficiencyMultiplierPct
  if (multiplier > 0) {
    efficiency *= 1 + multiplier / PERCENT_DIVISOR
  }

  // 5. Влияние событий (последние 4 события)
  const recentEvents = business.eventsHistory.slice(-MAX_REPUTATION_EVENTS)
  let eventImpact = 0
  for (const event of recentEvents) {
    const eff = event.effects.efficiency ?? 0
    eventImpact += eff
  }

  // Итоговая эффективность (без ограничения в 100%)
  const finalEfficiency = Math.max(0, efficiency + eventImpact)

  return Math.round(finalEfficiency)
}

/**
 * Рассчитывает репутацию бизнеса (может быть > 100)
 */
export function calculateReputation(
  business: Business,
  currentEfficiency: number,
  playerSkills?: Skill[],
): number {
  const { metrics } = BUSINESS_BALANCE
  const EFFICIENCY_WEIGHT = metrics.efficiencyWeight // Вес эффективности в репутации
  const TEAM_STARS_WEIGHT = metrics.teamStarsWeight // Вес звезд команды в репутации

  // Репутация меняется медленно, стремясь к текущей эффективности
  // Но также зависит от маркетинга и событий

  // 1. Влияние эффективности (вес 60%)
  const efficiencyImpact = currentEfficiency * EFFICIENCY_WEIGHT

  // 2. Влияние команды (звезды) (вес 20%)
  const totalSlots = getTotalEmployeesCount(business)

  let totalStars = 0
  for (const e of business.employees) {
    totalStars += e.stars
  }

  // Добавляем звезды игрока для каждой его роли
  const activeRoles = [
    ...business.playerRoles.managerialRoles,
    ...(business.playerRoles.operationalRole ? [business.playerRoles.operationalRole] : []),
  ]

  activeRoles.forEach((role) => {
    const config = getRoleConfig(role)
    const skillName = config?.skillGrowth?.name
    const playerSkill =
      playerSkills && skillName ? playerSkills.find((s) => s.name === skillName) : null
    const stars = playerSkill ? Math.max(1, Math.min(MAX_STARS, playerSkill.level)) : DEFAULT_STARS
    totalStars += stars
  })

  const avgStars = totalSlots > 0 ? totalStars / totalSlots : 0
  const teamImpact = (avgStars / MAX_STARS) * PERCENT_DIVISOR * TEAM_STARS_WEIGHT // 5 звезд = 20 ед. репутации к базе

  // 3. Маркетинг и прямые бонусы репутации
  const impacts = calculateTotalBusinessImpact(business, playerSkills)
  const marketingAndPlayerBonus = impacts.reputationBonus

  // 5. События (прямое влияние)
  const recentEventsRep = business.eventsHistory.slice(-MAX_REPUTATION_EVENTS)
  let eventImpactRep = 0
  for (const event of recentEventsRep) {
    const eff = event.effects.reputation ?? 0
    eventImpactRep += eff
  }

  // 6. Итоговая репутация
  const finalReputation = efficiencyImpact + teamImpact + marketingAndPlayerBonus + eventImpactRep

  return Math.round(Math.max(0, finalReputation))
}

/**
 * Обновляет метрики бизнеса (эффективность, репутация)
 */
export function updateBusinessMetrics(business: Business, playerSkills?: Skill[]): Business {
  const efficiency = calculateEfficiency(business, playerSkills)
  const reputation = calculateReputation(business, efficiency, playerSkills)

  return {
    ...business,
    efficiency,
    reputation,
  }
}
