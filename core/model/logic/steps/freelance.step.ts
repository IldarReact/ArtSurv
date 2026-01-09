import type { TurnStep } from '../turn/turn-step'
import { processFreelance } from '../turns/freelance-processor'

import { applyStatEffects } from '@/core/lib/stats/apply-effects'

export const freelanceStep: TurnStep = (ctx, state) => {
  const res = processFreelance(
    state.pendingFreelanceApplications,
    state.player.activeFreelanceGigs,
    state.player.personal.skills,
    ctx.turn,
    ctx.year,
  )

  state.pendingFreelanceApplications = res.remainingApplications
  state.player.activeFreelanceGigs = res.updatedGigs
  state.notifications.push(...res.notifications)

  // 1. Apply costs for active gigs
  state.player.activeFreelanceGigs.forEach((gig) => {
    if (gig.cost) {
      applyStatEffects(state.statModifiers, gig.cost, 'add')
    }
  })

  // 2. Apply payments for finished gigs
  res.finishedGigs.forEach((gig) => {
    state.statModifiers.money = (state.statModifiers.money || 0) + gig.payment
  })
}
