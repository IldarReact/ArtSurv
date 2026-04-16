import type { StateCreator } from 'zustand'

import {
  normalizeDurationFromTurns,
  normalizeDurationMonths,
} from '@/core/lib/stats/stat-change-format'
import type { FreelanceApplication, ActiveFreelanceGig } from '@/core/types'
import type { SkillRequirement } from '@/core/types/skill.types'
import type { StatEffect } from '@/core/types/stats.types'

import type { GameStore } from '../../types'
import type { FreelanceSlice } from '../../types/freelance.types'

interface FreelanceApplicationNotificationData {
  category?: string
  cost: StatEffect
  description?: string
  duration?: number
  freelanceApplicationId: string
  gigId?: string
  imageUrl?: string
  isApproved?: boolean
  payment: number
  requirements: SkillRequirement[]
  title: string
}

export const createFreelanceSlice: StateCreator<GameStore, [], [], FreelanceSlice> = (
  set,
  get,
) => ({
  acceptFreelanceGig: (applicationId: string) => {
    const state = get()
    const notification = state.notifications.find(
      (n) =>
        typeof n.data === 'object' &&
        n.data !== null &&
        'freelanceApplicationId' in n.data &&
        (n.data as FreelanceApplicationNotificationData).freelanceApplicationId === applicationId,
    )

    if (!notification || !state.player) return

    const appData = notification.data as FreelanceApplicationNotificationData
    const normalizedDuration = normalizeDurationMonths(appData.duration ?? 1)

    const newGig: ActiveFreelanceGig = {
      cost: appData.cost,
      costPerTurn: appData.cost,
      gigId: appData.gigId ?? `gig_${String(Date.now())}`,
      id: `gig_${String(Date.now())}`,
      payment: appData.payment,
      remainingDuration: normalizedDuration,
      requirements: appData.requirements,
      startedTurn: state.turn,
      title: appData.title,
      totalDuration: normalizedDuration,
    }

    state.updatePlayer((prev) => ({
      activeFreelanceGigs: [...prev.activeFreelanceGigs, newGig],
    }))

    state.dismissNotification(notification.id)
  },

  // Actions
  applyForFreelance: (gigId, title, payment, cost, requirements, duration) => {
    const state = get()
    if (!state.player) return

    const APPLY_ENERGY_COST = 2

    // 1. Списываем небольшую энергию за само действие (подача заявки) через транзакцию
    if (
      !state.performTransaction(
        { energy: -APPLY_ENERGY_COST },
        { title: 'Подача заявки на фриланс' },
      )
    ) {
      return
    }

    const normalizedDuration = normalizeDurationFromTurns(duration)

    const newApplication: FreelanceApplication = {
      cost,
      daysPending: 0,
      duration: normalizedDuration,
      gigId,
      id: `freelance_app_${String(Date.now())}`,
      payment,
      requirements,
      title,
    }

    // 2. Добавляем заявку в список ожидания
    set({
      pendingFreelanceApplications: [...state.pendingFreelanceApplications, newApplication],
    })

    state.pushNotification({
      message: `Вы подали заявку на заказ "${title}". Ожидайте ответа в следующем квартале.`,
      title: 'Заявка на заказ отправлена',
      type: 'info',
    })
  },

  completeFreelanceGig: (gigId: string) => {
    const state = get()
    if (!state.player) return
    const gig = state.player.activeFreelanceGigs.find((g) => g.id === gigId)
    if (!gig) return

    // Используем транзакцию для начисления оплаты
    state.performTransaction({ money: gig.payment }, { title: `Оплата за фриланс: ${gig.title}` })

    state.updatePlayer((prev) => ({
      activeFreelanceGigs: prev.activeFreelanceGigs.filter((g) => g.id !== gigId),
    }))

    state.pushNotification({
      message: `Вы завершили заказ "${gig.title}" и получили $${String(gig.payment)}!`,
      title: 'Заказ выполнен',
      type: 'success',
    })
  },

  // State
  pendingFreelanceApplications: [],
})
