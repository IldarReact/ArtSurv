import { processJobs } from '../turns/jobs-processor'
import type { TurnStep } from './step.types'

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
    state.pendingStatEffects.push({
      effects: job.cost,
      kind: 'one_time',
    })
  })

  res.protectedSkills.forEach((s) => state.protectedSkills.add(s))
  state.notifications.push(...res.notifications)
}
