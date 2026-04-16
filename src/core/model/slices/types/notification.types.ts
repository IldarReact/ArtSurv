import type { Notification, GameState } from '@/core/types'

export interface NotificationSlice {
  dismissEventNotification: () => void
  dismissNotification: (id: string) => void

  markNotificationAsRead: (id: string) => void
  notifications: Notification[]
  pendingEventNotification: GameState['pendingEventNotification']
  // Actions
  pushNotification: (notification: Omit<Notification, 'id' | 'isRead' | 'date'>) => void
}
