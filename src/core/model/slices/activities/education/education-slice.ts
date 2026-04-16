import type { StateCreator } from 'zustand'

import { normalizeDurationFromTurns } from '@/core/lib/stats/stat-change-format'
import type { ActiveCourse, ActiveUniversity, Player } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'

import type { GameStore, EducationSlice } from '../../types'

function calculateCurrentEnergyCost(player: Player): number {
  let total = 0
  for (const c of player.personal.activeCourses) {
    total += Math.abs(c.costPerTurn?.energy ?? 0)
  }
  for (const c of player.personal.activeUniversity) {
    total += Math.abs(c.costPerTurn?.energy ?? 0)
  }
  for (const j of player.jobs) {
    total += Math.abs(j.cost.energy ?? 0)
  }
  return total
}

interface EducationBaseParams {
  cost: number
  costPerTurn: StatEffect
  duration: number
  name: string
  skillBonus: string
}

function validateAndPrepareEducation(
  get: () => GameStore,
  params: EducationBaseParams,
  transactionTitle: string,
) {
  const state = get()
  const player = state.player
  if (!player) return null

  const currentEnergyCost = calculateCurrentEnergyCost(player)
  const requiredEnergyPerTurn = Math.abs(params.costPerTurn.energy ?? 0)
  const ENROLL_ENERGY_COST = 3

  // Проверка доступности энергии на будущее (рекуррентные затраты)
  if (player.stats.energy - currentEnergyCost < requiredEnergyPerTurn) {
    state.pushNotification({
      message: 'У вас недостаточно свободной энергии для обучения. Завершите другие дела.',
      title: 'Недостаточно энергии',
      type: 'info',
    })
    return null
  }

  // Списываем деньги и энергию за само действие (запись/поступление) через одну транзакцию
  if (
    !state.performTransaction(
      { energy: -ENROLL_ENERGY_COST, money: -params.cost },
      { title: transactionTitle },
    )
  ) {
    return null
  }

  const normalizedSkillName = params.skillBonus.split('(')[0].trim()
  return {
    normalizedSkillName,
    player,
    state,
  }
}

export const createEducationSlice: StateCreator<GameStore, [], [], EducationSlice> = (
  set,
  get,
) => ({
  applyToUniversity: (programName, cost, costPerTurn, skillBonus, duration) => {
    const prepared = validateAndPrepareEducation(
      get,
      { cost, costPerTurn, duration, name: programName, skillBonus },
      'Поступление в университет',
    )
    if (!prepared) return

    const { normalizedSkillName, state } = prepared

    const normalizedDuration = normalizeDurationFromTurns(duration)

    const newUni: ActiveUniversity = {
      costPerTurn,
      id: `uni_${String(Date.now())}`,
      programName,
      remainingDuration: normalizedDuration,
      skillBonus: 0,
      skillName: normalizedSkillName,
      startedTurn: state.turn,
      title: programName,
      totalDuration: normalizedDuration,
    }

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        activeUniversity: [...prev.personal.activeUniversity, newUni],
      },
    }))

    get().pushNotification({
      message: `Вы поступили на программу "${programName}". Учеба займет ${String(normalizedDuration)} мес.`,
      title: 'Поступление',
      type: 'success',
    })
  },

  studyCourse: (courseName, cost, costPerTurn, skillBonus, duration) => {
    const prepared = validateAndPrepareEducation(
      get,
      { cost, costPerTurn, duration, name: courseName, skillBonus },
      'Запись на курсы',
    )
    if (!prepared) return

    const { normalizedSkillName, state } = prepared

    const normalizedDuration = normalizeDurationFromTurns(duration)

    const newCourse: ActiveCourse = {
      costPerTurn,
      courseName,
      id: `course_${String(Date.now())}`,
      remainingDuration: normalizedDuration,
      skillBonus: 0,
      skillName: normalizedSkillName,
      startedTurn: state.turn,
      title: courseName,
      totalDuration: normalizedDuration,
    }

    get().updatePlayer((prev) => ({
      personal: {
        ...prev.personal,
        activeCourses: [...prev.personal.activeCourses, newCourse],
      },
    }))

    get().pushNotification({
      message: `Вы записались на курс "${courseName}".`,
      title: 'Запись на курс',
      type: 'success',
    })
  },
})
