import {
  updateAutoAssignedRoles,
  calculatePlayerRoleEffects,
  getPlayerRoleSkillGrowth,
  generateBusinessEvents,
  updateBusinessMetrics,
  calculateBusinessFinancials,
} from '@/core/lib/business'
import { processProgress } from '@/core/lib/progress/progress-processor'
import { formatGameDate } from '@/core/lib/quarter'
import type { Skill, SkillLevel, Notification } from '@/core/types'
import type { Business } from '@/core/types/business.types'
import type { CountryEconomy } from '@/core/types/economy.types'

/**
 * Результат обработки бизнесов за квартал
 */
export interface BusinessTurnResult {
  notifications: Notification[]
  playerRoleEnergyCost: number
  playerRoleSanityCost: number
  protectedSkills: Set<string>
  totalExpenses: number
  totalIncome: number
  totalTax: number
  updatedBusinesses: Business[]
  updatedSkills: Skill[]
}

/**
 * Обрабатывает бизнес в стадии открытия
 */
function handleOpeningBusiness(
  biz: Business,
  currentTurn: number,
  currentYear: number,
  notifications: Notification[],
): Business {
  const updatedBiz = { ...biz }
  if (updatedBiz.state !== 'opening' || !updatedBiz.openingProgress) {
    return updatedBiz
  }
  // Синхронизируем поля для процессора
  const progressable = {
    ...updatedBiz.openingProgress,
    id: updatedBiz.openingProgress.id,
    remainingDuration: updatedBiz.openingProgress.remainingDuration,
    title: updatedBiz.openingProgress.title,
    totalDuration: updatedBiz.openingProgress.totalDuration,
  }

  const res = processProgress([progressable])

  const newProgress = res.active[0] ?? res.completed[0]

  updatedBiz.openingProgress = {
    ...updatedBiz.openingProgress,
    ...newProgress,
    remainingDuration: newProgress.remainingDuration,
  }

  if (res.completed.length > 0) {
    updatedBiz.state = 'active'
    notifications.push({
      date: formatGameDate(currentYear, currentTurn),
      id: `biz_open_${updatedBiz.id}_${String(currentTurn)}`,
      isRead: false,
      message: `Ваш бизнес "${updatedBiz.name}" начал работу!`,
      title: 'Бизнес открыт! 🎉',
      type: 'success',
    })
  }
  return updatedBiz
}

const MAX_SKILL_LEVEL = 5
const SKILL_XP_THRESHOLD = 100
const EXPERIENCE_MONTHS_PER_QUARTER = 3

/**
 * Обрабатывает роли игрока и рост навыков
 */
function handlePlayerRolesAndSkills(
  biz: Business,
  updatedSkills: Skill[],
  currentTurn: number,
  currentYear: number,
  notifications: Notification[],
  protectedSkills: Set<string>,
): { biz: Business; energyCost: number; sanityCost: number } {
  const updatedBiz = updateAutoAssignedRoles(biz)

  // Рассчитать эффекты ролей игрока на его статы
  const roleEffects = calculatePlayerRoleEffects(updatedBiz)
  const energyCost = Math.abs(roleEffects.energy ?? 0)
  const sanityCost = Math.abs(roleEffects.sanity ?? 0)

  // Получить информацию о росте навыков
  const skillGrowthInfo = getPlayerRoleSkillGrowth(updatedBiz)

  // Применить рост навыков к игроку
  skillGrowthInfo.forEach(({ progress, skillName }) => {
    const skillIdx = updatedSkills.findIndex((s) => s.name === skillName)

    if (skillIdx === -1) {
      // Создать новый навык
      const newLevel = Math.min(
        MAX_SKILL_LEVEL,
        Math.floor(progress / SKILL_XP_THRESHOLD),
      ) as SkillLevel
      if (newLevel > 0) {
        updatedSkills.push({
          id: `skill_${String(Date.now())}_${String(Math.random())}`,
          isBeingStudied: false,
          lastPracticedTurn: currentTurn,
          level: newLevel,
          name: skillName,
          progress: progress % SKILL_XP_THRESHOLD,
        })
      }
    } else {
      // Обновить существующий навык
      const skill = { ...updatedSkills[skillIdx] }
      skill.progress += progress
      skill.lastPracticedTurn = currentTurn

      // Повышение уровня
      while (skill.progress >= SKILL_XP_THRESHOLD && skill.level < MAX_SKILL_LEVEL) {
        skill.level = (skill.level + 1) as SkillLevel
        skill.progress -= SKILL_XP_THRESHOLD

        notifications.push({
          date: formatGameDate(currentYear, currentTurn),
          id: `biz_skill_${updatedBiz.id}_${skill.name}_${String(currentTurn)}`,
          isRead: false,
          message: `Благодаря работе в бизнесе "${updatedBiz.name}" ваш навык ${skill.name} повысился до уровня ${String(
            skill.level,
          )}!`,
          title: 'Профессиональный рост',
          type: 'success',
        })
      }

      updatedSkills[skillIdx] = skill
    }

    // Защитить навык от деградации
    protectedSkills.add(skillName)
  })

  return { biz: updatedBiz, energyCost, sanityCost }
}

/**
 * Обновляет опыт сотрудников и игрока
 */
function updateExperience(biz: Business): Business {
  const updatedBiz = { ...biz }
  // Update employee experience (+3 months per quarter, scaled by effort)
  updatedBiz.employees = updatedBiz.employees.map((emp) => {
    const effortFactor = (emp.effortPercent ?? 100) / 100
    return {
      ...emp,
      experience: emp.experience + EXPERIENCE_MONTHS_PER_QUARTER * effortFactor,
    }
  })

  // Update player experience if employed
  if (updatedBiz.playerEmployment) {
    const effortFactor = (updatedBiz.playerEmployment.effortPercent ?? 100) / 100
    updatedBiz.playerEmployment = {
      ...updatedBiz.playerEmployment,
      experience:
        updatedBiz.playerEmployment.experience + EXPERIENCE_MONTHS_PER_QUARTER * effortFactor,
    }
  }
  return updatedBiz
}

/**
 * Формирует сводку за последний квартал
 */
function createQuarterSummary(
  biz: Business,
  updatedBiz: Business,
  financials: ReturnType<typeof calculateBusinessFinancials>,
) {
  if (!financials.debug) return updatedBiz.lastQuarterSummary

  return {
    efficiencyChange: updatedBiz.efficiency - biz.efficiency,
    expenses:
      typeof financials.expenses === 'number' && !Number.isNaN(financials.expenses)
        ? financials.expenses
        : 0,
    expensesBreakdown: financials.debug.expensesBreakdown,
    netProfit:
      typeof financials.netProfit === 'number' && !Number.isNaN(financials.netProfit)
        ? financials.netProfit
        : 0,
    priceUsed:
      typeof financials.debug.priceUsed === 'number' && !Number.isNaN(financials.debug.priceUsed)
        ? financials.debug.priceUsed
        : 0,
    profitDistribution: updatedBiz.partners.map((p) => ({
      amount: Math.round(
        (typeof financials.netProfit === 'number' && !Number.isNaN(financials.netProfit)
          ? financials.netProfit
          : 0) *
          (Math.max(0, Math.min(100, p.share)) / 100),
      ),
      partnerId: p.id,
      share: p.share,
    })),
    reputationChange: updatedBiz.reputation - biz.reputation,
    salesIncome:
      typeof financials.income === 'number' && !Number.isNaN(financials.income)
        ? financials.income
        : 0,
    sold:
      typeof financials.debug.salesVolume === 'number' &&
      !Number.isNaN(financials.debug.salesVolume)
        ? financials.debug.salesVolume
        : 0,
    taxes:
      typeof financials.debug.taxAmount === 'number' && !Number.isNaN(financials.debug.taxAmount)
        ? financials.debug.taxAmount
        : 0,
  }
}

/**
 * Обработать все бизнесы игрока за квартал
 */
export function processBusinessTurn(
  businesses: Business[],
  playerSkills: Skill[],
  currentTurn: number,
  currentYear: number,
  globalMarketValue = 1.0, // ✅ НОВОЕ: глобальное состояние рынка
  economy?: CountryEconomy, // ✅ НОВОЕ: экономика для инфляции
): BusinessTurnResult {
  const updatedBusinesses: Business[] = []
  const updatedSkills = [...playerSkills]
  let totalIncome = 0
  let totalExpenses = 0
  let totalTax = 0
  let playerRoleEnergyCost = 0
  let playerRoleSanityCost = 0
  const notifications: Notification[] = []
  const protectedSkills = new Set<string>()

  businesses.forEach((biz) => {
    // 1. Opening Phase
    if (biz.state === 'opening') {
      updatedBusinesses.push(handleOpeningBusiness(biz, currentTurn, currentYear, notifications))
      return
    }

    // 2. Frozen State
    if (biz.state === 'frozen') {
      totalExpenses += biz.quarterlyExpenses
      updatedBusinesses.push({ ...biz })
      return
    }

    // 3. Active State
    const {
      biz: updatedBizAfterRoles,
      energyCost,
      sanityCost,
    } = handlePlayerRolesAndSkills(
      biz,
      updatedSkills,
      currentTurn,
      currentYear,
      notifications,
      protectedSkills,
    )
    playerRoleEnergyCost += energyCost
    playerRoleSanityCost += sanityCost

    let updatedBiz = updatedBizAfterRoles

    // 4. Events
    const events = generateBusinessEvents(updatedBiz, currentTurn)
    if (events.length > 0) {
      updatedBiz.eventsHistory = [...updatedBiz.eventsHistory, ...events]
      events.forEach((evt) => {
        notifications.push({
          date: formatGameDate(currentYear, currentTurn),
          id: evt.id,
          isRead: false,
          message: `${updatedBiz.name}: ${evt.description}`,
          title: `Бизнес: ${evt.title}`,
          type: evt.type === 'positive' ? 'success' : 'info',
        })
      })
    }

    // 5. Update Metrics
    updatedBiz = updateBusinessMetrics(updatedBiz, playerSkills)

    // 6. Financials
    const financials = calculateBusinessFinancials(
      updatedBiz,
      false,
      playerSkills,
      globalMarketValue,
      economy,
    )

    // 7. Update Goals
    if (updatedBiz.businessGoals) {
      updatedBiz.businessGoals = updatedBiz.businessGoals.map((goal) => {
        if (goal.isCompleted) return goal

        let current = goal.current
        let isCompleted = false

        if (goal.type === 'price') {
          current = updatedBiz.price
          isCompleted = current >= goal.target
        } else if (goal.type === 'quantity') {
          current = updatedBiz.quantity
          isCompleted = current >= goal.target
        } else {
          current = financials.income
          isCompleted = current >= goal.target
        }

        if (isCompleted) {
          notifications.push({
            date: formatGameDate(currentYear, currentTurn),
            id: `goal_comp_${updatedBiz.id}_${goal.id}_${String(currentTurn)}`,
            isRead: false,
            message: `Бизнес-цель "${goal.title}" в компании ${updatedBiz.name} достигнута!`,
            title: 'Цель достигнута! 🎯',
            type: 'success',
          })
        }

        return { ...goal, current, isCompleted }
      })
    }

    let eventMoney = 0
    events.forEach((e) => {
      eventMoney += e.effects.money ?? 0
    })

    if (eventMoney > 0) financials.income += eventMoney
    else financials.expenses += Math.abs(eventMoney)

    const playerSharePct = typeof updatedBiz.playerShare === 'number' ? updatedBiz.playerShare : 100
    const shareFactor = Math.max(0, Math.min(100, playerSharePct)) / 100
    totalIncome += Math.round(financials.income * shareFactor)
    totalExpenses += Math.round(financials.expenses * shareFactor)
    totalTax += Math.round(financials.taxAmount * shareFactor)

    // 7. Experience
    updatedBiz = updateExperience(updatedBiz)

    // Final Update
    updatedBusinesses.push({
      ...updatedBiz,
      inventory: financials.newInventory,
      lastQuarterSummary: createQuarterSummary(biz, updatedBiz, financials),
      lastRoleEnergyCost: energyCost,
      lastRoleSanityCost: sanityCost,
      quarterlyExpenses: financials.expenses,
      quarterlyIncome: financials.income,
      quarterlyTax: financials.taxAmount,
    })
  })

  return {
    notifications,
    playerRoleEnergyCost,
    playerRoleSanityCost,
    protectedSkills,
    totalExpenses,
    totalIncome,
    totalTax,
    updatedBusinesses,
    updatedSkills,
  }
}
