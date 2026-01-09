import type { StateCreator } from 'zustand'

import type { GameStore } from '../../types'
import type { FreelanceSlice } from '../../types/freelance.types'

import { formatGameDate } from '@/core/lib/quarter'
import type { FreelanceApplication, ActiveFreelanceGig } from '@/core/types'
import type { SkillRequirement } from '@/core/types/skill.types'
import type { StatEffect } from '@/core/types/stats.types'

type FreelanceApplicationNotificationData = {
  freelanceApplicationId: string
  title: string
  category?: string
  description?: string
  payment: number
  cost: StatEffect
  requirements: SkillRequirement[]
  imageUrl?: string
}

export const createFreelanceSlice: StateCreator<GameStore, [], [], FreelanceSlice> = (
  set,
  get,
) => ({
  // State
  pendingFreelanceApplications: [],

  // Actions
  applyForFreelance: (gigId, title, payment, cost, requirements, duration) => {
    const state = get()
    if (!state.player) return

    if (cost.energy && state.player.stats.energy < Math.abs(cost.energy)) {
      set((state) => ({
        notifications: [
          {
            id: `err_${Date.now()}`,
            type: 'info',
            title: 'Недостаточно энергии',
            message: 'У вас недостаточно энергии для выполнения этого заказа.',
            date: formatGameDate(state.year, state.turn),
            isRead: false,
          },
          ...state.notifications,
        ],
      }))
      return
    }

    const newApplication: FreelanceApplication = {
      id: `freelance_app_${Date.now()}`,
      gigId,
      title,
      payment,
      cost,
      requirements,
      duration,
      daysPending: 0,
    }

    set((state) => ({
      player: state.player
        ? {
            ...state.player,
            stats: {
              ...state.player.stats,
              energy: state.player.stats.energy + (cost.energy || 0),
            },
            personal: {
              ...state.player.personal,
              stats: {
                ...state.player.personal.stats,
                energy: state.player.personal.stats.energy + (cost.energy || 0),
              },
            },
          }
        : null,
      pendingFreelanceApplications: [...state.pendingFreelanceApplications, newApplication],
      notifications: [
        {
          id: `notif_${Date.now()}`,
          type: 'info',
          title: 'Заявка на заказ отправлена',
          message: `Вы подали заявку на заказ "${title}". Ожидайте ответа в следующем квартале.`,
          date: formatGameDate(state.year, state.turn),
          isRead: false,
        },
        ...state.notifications,
      ],
    }))
  },

  acceptFreelanceGig: (applicationId: string) => {
    const state = get()
    const notification = state.notifications.find(
      (n) =>
        typeof n.data === 'object' &&
        n.data !== null &&
        'freelanceApplicationId' in n.data &&
        n.data.freelanceApplicationId === applicationId,
    )

    if (!notification || !state.player) return

    const appData = notification.data as any // Use any for now or define proper type

    const newGig: ActiveFreelanceGig = {
      id: `gig_${Date.now()}`,
      gigId: appData.gigId || `gig_${Date.now()}`,
      title: appData.title,
      payment: appData.payment,
      cost: appData.cost,
      costPerTurn: appData.cost,
      requirements: appData.requirements || [],
      totalDuration: appData.duration || 1,
      remainingDuration: appData.duration || 1,
      startedTurn: state.turn,
    }

    set((state) => ({
      player: state.player
        ? {
            ...state.player,
            activeFreelanceGigs: [...state.player.activeFreelanceGigs, newGig],
          }
        : null,
      notifications: state.notifications.filter((n) => n.id !== notification.id),
    }))
  },

  completeFreelanceGig: (gigId: string) => {
    set((state) => {
      if (!state.player) return {}
      const gig = state.player.activeFreelanceGigs.find((g) => g.id === gigId)
      if (!gig) return {}

      return {
        player: {
          ...state.player,
          activeFreelanceGigs: state.player.activeFreelanceGigs.filter((g) => g.id !== gigId),
          stats: {
            ...state.player.stats,
            money: state.player.stats.money + gig.payment,
          },
        },
        notifications: [
          {
            id: `gig_complete_${Date.now()}`,
            type: 'success',
            title: 'Заказ выполнен',
            message: `Вы завершили заказ "${gig.title}" и получили $${gig.payment}!`,
            date: formatGameDate(state.year, state.turn),
            isRead: false,
          },
          ...state.notifications,
        ],
      }
    })
  },
})
