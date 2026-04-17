import { processFreelance } from '../turns/freelance-processor'
import type { TurnStep } from './step.types'

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
    state.pendingStatEffects.push({
      effects: gig.cost,
      kind: 'one_time',
    })
  })

  // 2. Apply payments for finished gigs
  res.finishedGigs.forEach((gig) => {
    state.pendingStatEffects.push({
      effects: { money: gig.payment },
      kind: 'one_time',
    })
  })
}
