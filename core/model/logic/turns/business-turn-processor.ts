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
  updatedBusinesses: Business[]
  updatedSkills: Skill[]
  totalIncome: number
  totalExpenses: number
  totalTax: number
  playerRoleEnergyCost: number
  playerRoleSanityCost: number
  notifications: Notification[]
  protectedSkills: Set<string>
}

/**
 * Обработать все бизнесы игрока за квартал
 */
export function processBusinessTurn(
  businesses: Business[],
  playerSkills: Skill[],
  currentTurn: number,
  currentYear: number,
  globalMarketValue: number = 1.0, // ✅ НОВОЕ: глобальное состояние рынка
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
    let updatedBiz = { ...biz }

    // 1. Opening Phase
    if (updatedBiz.state === 'opening') {
      // Синхронизируем поля для процессора
      const progressable = {
        ...updatedBiz.openingProgress,
        id: updatedBiz.openingProgress.id || `opening_${updatedBiz.id}`,
        title: updatedBiz.openingProgress.title || `Открытие: ${updatedBiz.name}`,
        totalDuration: updatedBiz.openingProgress.totalQuarters,
        remainingDuration: updatedBiz.openingProgress.quartersLeft,
      }

      const res = processProgress([progressable])

      updatedBiz.openingProgress = {
        ...updatedBiz.openingProgress,
        ...(res.active[0] || res.completed[0]),
        quartersLeft: (res.active[0] || res.completed[0]).remainingDuration,
      }

      if (res.completed.length > 0) {
        updatedBiz.state = 'active'
        notifications.push({
          id: `biz_open_${updatedBiz.id}_${currentTurn}`,
          type: 'success',
          title: 'Бизнес открыт! 🎉',
          message: `Ваш бизнес "${updatedBiz.name}" начал работу!`,
          date: formatGameDate(currentYear, currentTurn),
          isRead: false,
        })
      }
      updatedBusinesses.push(updatedBiz)
      return
    }

    // 2. Frozen State
    if (updatedBiz.state === 'frozen') {
      // Only fixed expenses
      const fixedExpenses = updatedBiz.quarterlyExpenses
      totalExpenses += fixedExpenses
      updatedBusinesses.push(updatedBiz)
      return
    }

    // 3. Player Roles - автоматическое обновление и расчет эффектов
    updatedBiz = updateAutoAssignedRoles(updatedBiz)

    // Рассчитать эффекты ролей игрока на его статы
    const roleEffects = calculatePlayerRoleEffects(updatedBiz)
    playerRoleEnergyCost += Math.abs(roleEffects.energy || 0)
    playerRoleSanityCost += Math.abs(roleEffects.sanity || 0)

    // Получить информацию о росте навыков
    const skillGrowthInfo = getPlayerRoleSkillGrowth(updatedBiz)

    // Применить рост навыков к игроку
    skillGrowthInfo.forEach(({ skillName, progress }) => {
      const skillIdx = updatedSkills.findIndex((s) => s.name === skillName)

      if (skillIdx === -1) {
        // Создать новый навык
        const newLevel = Math.min(5, Math.floor(progress / 100)) as SkillLevel
        if (newLevel > 0) {
          updatedSkills.push({
            id: `skill_${Date.now()}_${Math.random()}`,
            name: skillName,
            level: newLevel,
            progress: progress % 100,
            lastPracticedTurn: currentTurn,
            isBeingStudied: false,
          })
        }
      } else {
        // Обновить существующий навык
        const skill = { ...updatedSkills[skillIdx] }
        skill.progress += progress
        skill.lastPracticedTurn = currentTurn

        // Повышение уровня
        while (skill.progress >= 100 && skill.level < 5) {
          skill.level = (skill.level + 1) as SkillLevel
          skill.progress -= 100

          notifications.push({
            id: `biz_skill_${updatedBiz.id}_${skill.name}_${currentTurn}`,
            type: 'success',
            title: 'Профессиональный рост',
            message: `Благодаря работе в бизнесе "${updatedBiz.name}" ваш навык ${skill.name} повысился до уровня ${skill.level}!`,
            date: formatGameDate(currentYear, currentTurn),
            isRead: false,
          })
        }

        updatedSkills[skillIdx] = skill
      }

      // Защитить навык от деградации
      protectedSkills.add(skillName)
    })

    // 4. Events
    const events = generateBusinessEvents(updatedBiz, currentTurn)
    if (events.length > 0) {
      updatedBiz.eventsHistory = [...updatedBiz.eventsHistory, ...events]

      // Notify about events
      events.forEach((evt) => {
        notifications.push({
          id: evt.id,
          type: evt.type === 'positive' ? 'success' : 'info',
          title: `Бизнес: ${evt.title}`,
          message: `${updatedBiz.name}: ${evt.description}`,
          date: formatGameDate(currentYear, currentTurn),
          isRead: false,
        })
      })
    }

    // 5. Update Metrics (Efficiency, Reputation) - includes event impact
    updatedBiz = updateBusinessMetrics(updatedBiz, playerSkills)

    // 6. Financials & Inventory
    const financials = calculateBusinessFinancials(
      updatedBiz,
      false,
      playerSkills,
      globalMarketValue,
      economy,
    )

    // Add event money effects
    const eventMoney = events.reduce((sum, e) => sum + (e.effects.money || 0), 0)

    // Adjust financials with event money
    if (eventMoney > 0) financials.income += eventMoney
    else financials.expenses += Math.abs(eventMoney)

    const playerSharePct = typeof updatedBiz.playerShare === 'number' ? updatedBiz.playerShare : 100
    const shareFactor = Math.max(0, Math.min(100, playerSharePct)) / 100
    totalIncome += Math.round(financials.income * shareFactor)
    totalExpenses += Math.round(financials.expenses * shareFactor)
    totalTax += Math.round(financials.taxAmount * shareFactor)

    // 7. Update employee experience (+3 months per quarter, scaled by effort)
    updatedBiz.employees = updatedBiz.employees.map((emp) => {
      const effortFactor = (emp.effortPercent ?? 100) / 100
      return {
        ...emp,
        experience: emp.experience + 3 * effortFactor,
      }
    })

    // Update player experience if employed
    if (updatedBiz.playerEmployment) {
      const effortFactor = (updatedBiz.playerEmployment.effortPercent ?? 100) / 100
      updatedBiz.playerEmployment = {
        ...updatedBiz.playerEmployment,
        experience: (updatedBiz.playerEmployment.experience || 0) + 3 * effortFactor,
      }
    }

    // Update Business with new state
    updatedBusinesses.push({
      ...updatedBiz,
      inventory: financials.newInventory,
      quarterlyIncome: financials.income,
      quarterlyExpenses: financials.expenses,
      quarterlyTax: financials.taxAmount,
      lastRoleEnergyCost: Math.abs(calculatePlayerRoleEffects(updatedBiz).energy || 0),
      lastRoleSanityCost: Math.abs(calculatePlayerRoleEffects(updatedBiz).sanity || 0),
      lastQuarterSummary: financials.debug
        ? {
            sold:
              typeof financials.debug.salesVolume === 'number' &&
              !isNaN(financials.debug.salesVolume)
                ? financials.debug.salesVolume
                : 0,
            priceUsed:
              typeof financials.debug.priceUsed === 'number' && !isNaN(financials.debug.priceUsed)
                ? financials.debug.priceUsed
                : 0,
            salesIncome:
              typeof financials.income === 'number' && !isNaN(financials.income)
                ? financials.income
                : 0,
            taxes:
              typeof financials.debug.taxAmount === 'number' && !isNaN(financials.debug.taxAmount)
                ? financials.debug.taxAmount
                : 0,
            expenses:
              typeof financials.expenses === 'number' && !isNaN(financials.expenses)
                ? financials.expenses
                : 0,
            expensesBreakdown: financials.debug.expensesBreakdown,
            reputationChange: updatedBiz.reputation - biz.reputation,
            efficiencyChange: updatedBiz.efficiency - biz.efficiency,
            netProfit:
              typeof financials.netProfit === 'number' && !isNaN(financials.netProfit)
                ? financials.netProfit
                : 0,
            profitDistribution: updatedBiz.partners.map((p) => ({
              partnerId: p.id,
              share: p.share,
              amount: Math.round(
                (typeof financials.netProfit === 'number' && !isNaN(financials.netProfit)
                  ? financials.netProfit
                  : 0) *
                  (Math.max(0, Math.min(100, p.share)) / 100),
              ),
            })),
          }
        : updatedBiz.lastQuarterSummary,
    })
  })

  return {
    updatedBusinesses,
    updatedSkills,
    totalIncome,
    totalExpenses,
    totalTax,
    playerRoleEnergyCost,
    playerRoleSanityCost,
    notifications,
    protectedSkills,
  }
}
