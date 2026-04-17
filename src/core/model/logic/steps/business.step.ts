import { processBusinessTurn } from '../turns/business-turn-processor'
import type { TurnStep } from './step.types'

export const businessStep: TurnStep = (ctx, state) => {
  const res = processBusinessTurn(
    state.player.businesses,
    state.player.personal.skills,
    ctx.turn,
    ctx.year,
    state.globalMarketValue,
    state.country,
  )

  state.player.businesses = res.updatedBusinesses
  state.player.personal.skills = res.updatedSkills

  state.business.totalIncome = res.totalIncome
  state.business.totalExpenses = res.totalExpenses
  state.business.totalTax = res.totalTax

  // Применяем затраты статов от ролей игрока
  const energyCost = res.playerRoleEnergyCost
  const sanityCost = res.playerRoleSanityCost
  if (
    (typeof energyCost === 'number' && Number.isFinite(energyCost) && energyCost !== 0) ||
    (typeof sanityCost === 'number' && Number.isFinite(sanityCost) && sanityCost !== 0)
  ) {
    state.pendingStatEffects.push({
      effects: {
        energy: typeof energyCost === 'number' && Number.isFinite(energyCost) ? -energyCost : 0,
        sanity: typeof sanityCost === 'number' && Number.isFinite(sanityCost) ? -sanityCost : 0,
      },
      kind: 'one_time',
    })
  }

  res.protectedSkills.forEach((s) => state.protectedSkills.add(s))
  state.notifications.push(...res.notifications)
}
