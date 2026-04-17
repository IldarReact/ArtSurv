import { processPersonal } from '../turns/personal-processor'
import type { TurnStep } from './step.types'

const PREGNANCY_HAPPINESS_BONUS = 5
const PREGNANCY_ENERGY_PENALTY = 10

export const personalStep: TurnStep = (ctx, state) => {
  const res = processPersonal(state.player.personal, state.player.age, ctx.turn, ctx.year)

  state.player.personal.potentialPartner = res.potentialPartner
  state.player.personal.isDating = res.isDating
  state.player.personal.pregnancy = res.pregnancy
  state.player.personal.familyMembers = res.familyMembers

  // Apply pregnancy modifiers
  if (state.player.personal.pregnancy) {
    state.pendingStatEffects.push({
      effects: {
        energy: -PREGNANCY_ENERGY_PENALTY,
        happiness: PREGNANCY_HAPPINESS_BONUS,
      },
      kind: 'one_time',
    })
  }

  // Apply family passive effects
  state.player.personal.familyMembers.forEach((member) => {
    state.pendingStatEffects.push({
      effects: member.passiveEffects,
      kind: 'one_time',
    })
  })

  state.notifications.push(...res.notifications)
}
