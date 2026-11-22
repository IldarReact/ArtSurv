import { processJobs } from '../turns/jobs-processor'
import type { TurnStep } from './step.types'

export const jobsStep: TurnStep = (ctx, state) => {
  const previousJobs = state.player.jobs.map((job) => ({
    id: job.id,
    salary: job.salary,
    title: job.title,
  }))
  const res = processJobs(
    state.player.jobs,
    state.pendingApplications,
    state.player.personal.skills,
    ctx.turn,
    ctx.year,
    state.country.cycle,
  )

  state.player.jobs = res.updatedJobs
  state.player.quarterlySalary = res.updatedJobs.reduce((total, job) => total + job.salary, 0)
  state.pendingApplications = res.remainingApplications
  state.player.personal.skills = res.updatedSkills

  for (const previousJob of previousJobs) {
    const updatedJob = res.updatedJobs.find((job) => job.id === previousJob.id)
    if (!updatedJob) {
      state.lifeEvents.push({
        category: 'work',
        entityName: previousJob.title,
        id: `job_lost_${previousJob.id}_${String(ctx.turn)}`,
        kind: 'job_lost',
        turn: ctx.turn,
        year: ctx.year,
      })
      continue
    }

    state.lifeEvents.push({
      amount: updatedJob.salary,
      category: 'work',
      entityName: updatedJob.title,
      id: `work_quarter_${updatedJob.id}_${String(ctx.turn)}`,
      kind: 'work_quarter',
      turn: ctx.turn,
      year: ctx.year,
    })

    const salaryIncrease = updatedJob.salary - previousJob.salary
    if (salaryIncrease > 0) {
      state.lifeEvents.push({
        amount: salaryIncrease,
        category: 'work',
        entityName: updatedJob.title,
        id: `job_salary_increased_${updatedJob.id}_${String(ctx.turn)}`,
        kind: 'job_salary_increased',
        turn: ctx.turn,
        year: ctx.year,
      })
    }
  }

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
