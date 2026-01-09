import type { TurnStep } from '../turn/turn-step'
import { processJobs } from '../turns/jobs-processor'

import { applyStatEffects } from '@/core/lib/stats/apply-effects'

export const jobsStep: TurnStep = (ctx, state) => {
  const res = processJobs(
    state.player.jobs,
    state.pendingApplications,
    state.player.personal.skills,
    ctx.turn,
    ctx.year,
    state.country.cycle,
  )

  state.player.jobs = res.updatedJobs
  state.pendingApplications = res.remainingApplications
  state.player.personal.skills = res.updatedSkills

  // Apply job costs
  state.player.jobs.forEach((job) => {
    if (job.cost) {
      // Jobs use 'subtract' for costs, but positive modifiers for gains
      // The applyStatEffects will handle the sign based on the third argument
      applyStatEffects(state.statModifiers, job.cost, 'add')
    }
  })

  res.protectedSkills.forEach((s) => state.protectedSkills.add(s))
  state.notifications.push(...res.notifications)
}
