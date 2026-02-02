import type { StateCreator } from 'zustand'

import { formatGameDate } from '@/core/lib/quarter'
import type { Notification } from '@/core/types'

import type { GameStore, NotificationSlice } from './types'

export const createNotificationSlice: StateCreator<GameStore, [], [], NotificationSlice> = (
  set,
) => {
  return {
    dismissEventNotification: () => {
      set({ pendingEventNotification: null })
    },

    dismissNotification: (id: string) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    },

    markNotificationAsRead: (id: string) => {
      set((state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      }))
    },

    // State
    notifications: [],

    pendingEventNotification: null,

    // Actions
    pushNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'date'>) => {
      set((state) => ({
        notifications: [
          {
            ...notification,
            date: formatGameDate(state.year, state.turn),
            id: `notif_${String(Date.now())}_${String(Math.random())}`,
            isRead: false,
          },
          ...state.notifications,
        ],
      }))
    },
  }
}
