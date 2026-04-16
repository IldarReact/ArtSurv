'use client'

import {
  Heart,
  Briefcase,
  TrendingUp,
  Landmark,
  Home,
  Palmtree,
  Bell,
  GraduationCap,
  ShoppingCart,
} from 'lucide-react'
import React from 'react'

import { useGameStore } from '@/core/model/store'
import type { ActivityType } from '@/core/types'

interface Activity {
  description: string
  icon: React.ComponentType<{ className?: string }>
  id: ActivityType
  label: string
}

const ACTIVITIES: readonly Activity[] = [
  { description: 'Товары и услуги', icon: ShoppingCart, id: 'shop', label: 'МАГАЗИН' },
  { description: 'Семья и отношения', icon: Heart, id: 'family', label: 'СЕМЬЯ' },
  { description: 'Карьера и доход', icon: Briefcase, id: 'work', label: 'РАБОТА' },
  { description: 'Образование и навыки', icon: GraduationCap, id: 'education', label: 'ОБУЧЕНИЕ' },
  { description: 'Акции и активы', icon: TrendingUp, id: 'investments', label: 'ИНВЕСТИЦИИ' },
  { description: 'Кредиты и депозиты', icon: Landmark, id: 'banking', label: 'БАНКИ' },
  { description: 'Жилище и имущество', icon: Home, id: 'relocation', label: 'ПЕРЕЕЗД' },
  { description: 'Развлечения и здоровье', icon: Palmtree, id: 'leisure', label: 'ОТДЫХ' },
  { description: 'История событий', icon: Bell, id: 'events', label: 'СОБЫТИЯ' },
]

export function ActivityNavigation(): React.JSX.Element | null {
  const activeActivity = useGameStore((state) => state.activeActivity)
  const businessProposals = useGameStore((state) => state.businessProposals)
  const gameStatus = useGameStore((state) => state.gameStatus)
  const offers = useGameStore((state) => state.offers)
  const player = useGameStore((state) => state.player)
  const setActiveActivity = useGameStore((state) => state.setActiveActivity)

  // Подсчёт входящих уведомлений для раздела "Работа"
  const workNotificationsCount = React.useMemo(() => {
    if (!player) return 0

    const pendingProposalsCount = businessProposals.filter(
      (p) => p.status === 'pending' && p.initiatorId !== player.id,
    ).length

    const incomingOffersCount = offers.filter(
      (o) => o.status === 'pending' && o.toPlayerId === player.id,
    ).length

    return pendingProposalsCount + incomingOffersCount
  }, [businessProposals, offers, player])

  if (gameStatus !== 'playing') return null

  const getNotificationCount = (activityId: ActivityType): number => {
    if (activityId === 'work') {
      return workNotificationsCount
    }
    return 0
  }

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 pointer-events-none">
      <div className="bg-white/10 backdrop-blur-md border border-black/30 rounded-r-[40px] shadow-[0_4px_20px_rgba(0,0,0,0.3)] pointer-events-auto">
        <div className="flex flex-col gap-2 py-4">
          {ACTIVITIES.map((activity) => {
            const Icon = activity.icon
            const isActive = activeActivity === activity.id
            const notificationCount = getNotificationCount(activity.id)

            return (
              <button
                className={`w-16 md:w-20 py-4 px-1 flex flex-col items-center gap-1.5 transition-all relative group ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
                key={activity.id}
                onClick={() => {
                  setActiveActivity(activity.id)
                }}
                title={activity.description}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] rounded-r-full" />
                )}

                {/* Notification Badge */}
                {notificationCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-linear-to-br from-orange-500 to-red-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg border border-white/20 animate-pulse">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </div>
                )}

                <Icon
                  className={`w-5 h-5 md:w-6 md:h-6 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                />
                <span className="text-[10px] font-bold tracking-wider text-center leading-tight opacity-80">
                  {activity.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
