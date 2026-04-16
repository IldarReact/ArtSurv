import { applyStatEffects } from '@/core/lib/stats/apply-effects'

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
      applyStatEffects(state.statModifiers, course.costPerTurn, 'subtract')
    }
    state.statModifiers.intelligence = (state.statModifiers.intelligence ?? 0) + 1
  })

  state.player.personal.activeUniversity.forEach((uni) => {
    if (uni.costPerTurn) {
      applyStatEffects(state.statModifiers, uni.costPerTurn, 'subtract')
    }
    state.statModifiers.intelligence = (state.statModifiers.intelligence ?? 0) + 2
    if (!uni.costPerTurn?.sanity) {
      state.statModifiers.sanity = (state.statModifiers.sanity ?? 0) - 1
    }
  })

  res.protectedSkills.forEach((s) => state.protectedSkills.add(s))
  state.notifications.push(...res.notifications)
}
