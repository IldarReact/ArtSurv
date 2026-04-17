import { processEducation } from '../turns/education-processor'
import type { TurnStep } from './step.types'

export const educationStep: TurnStep = (ctx, state) => {
  const res = processEducation(
    state.player.personal.activeCourses,
    state.player.personal.activeUniversity,
    state.player.personal.skills,
    ctx.turn,
    ctx.year,
  )

  state.player.personal.activeCourses = res.activeCourses
  state.player.personal.activeUniversity = res.activeUniversity
  state.player.personal.skills = res.updatedSkills

  // Apply education costs
  state.player.personal.activeCourses.forEach((course) => {
    if (course.costPerTurn) {
      state.pendingStatEffects.push({
        effects: {
          energy: -(course.costPerTurn.energy ?? 0),
          happiness: -(course.costPerTurn.happiness ?? 0),
          health: -(course.costPerTurn.health ?? 0),
          intelligence: -(course.costPerTurn.intelligence ?? 0),
          money: -(course.costPerTurn.money ?? 0),
          sanity: -(course.costPerTurn.sanity ?? 0),
        },
        kind: 'one_time',
      })
    }
    state.pendingStatEffects.push({
      effects: { intelligence: 1 },
      kind: 'one_time',
    })
  })

  state.player.personal.activeUniversity.forEach((uni) => {
    if (uni.costPerTurn) {
      state.pendingStatEffects.push({
        effects: {
          energy: -(uni.costPerTurn.energy ?? 0),
          happiness: -(uni.costPerTurn.happiness ?? 0),
          health: -(uni.costPerTurn.health ?? 0),
          intelligence: -(uni.costPerTurn.intelligence ?? 0),
          money: -(uni.costPerTurn.money ?? 0),
          sanity: -(uni.costPerTurn.sanity ?? 0),
        },
        kind: 'one_time',
      })
    }
    state.pendingStatEffects.push({
      effects: { intelligence: 2 },
      kind: 'one_time',
    })
    if (!uni.costPerTurn?.sanity) {
      state.pendingStatEffects.push({
        effects: { sanity: -1 },
        kind: 'one_time',
      })
    }
  })

  res.protectedSkills.forEach((s) => state.protectedSkills.add(s))
  state.notifications.push(...res.notifications)
}
