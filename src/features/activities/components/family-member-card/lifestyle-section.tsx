'use client'

import React from 'react'

import { useInflatedPrice } from '@/core/hooks'
import { getRecurringItemsByCategory } from '@/core/lib/shop-helpers'
import { useGameStore } from '@/core/model/store'
import type { FamilyMember } from '@/core/types'
import type { ShopItem } from '@/core/types/shop.types'
import { ClickFeedback } from '@/shared/components/feedback-animation'

interface MemberDisplayData {
  foodPreference?: string
  transportPreference?: string
}

interface LifestyleSectionProps {
  displayData: MemberDisplayData
  isPlayer: boolean
  member?: FamilyMember
}

interface LifestyleItemProps {
  isActive: boolean
  isPlayer: boolean
  item: ShopItem
  member?: FamilyMember
  onClick: (itemId: string) => void
  type: 'food' | 'transport'
}

function LifestyleItem({
  isActive,
  item,
  onClick,
  type,
}: Omit<LifestyleItemProps, 'isPlayer' | 'member'>) {
  const itemPrice = useInflatedPrice(item)
  const activeClass =
    type === 'food'
      ? 'bg-green-500/20 border-green-500/50'
      : 'bg-purple-500/20 border-purple-500/50'

  return (
    <ClickFeedback
      className={`text-left p-3 rounded-lg border transition-all w-full ${
        isActive ? activeClass : 'bg-white/5 border-white/10 hover:border-white/20'
      }`}
      onClick={() => {
        onClick(item.id)
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="font-medium text-white text-sm">{item.name}</div>
          <div className="text-xs text-white/60">{item.description}</div>
        </div>
        <div className="text-right ml-4">
          <div className="text-sm font-bold text-green-400">${itemPrice.toLocaleString()}</div>
          <div className="text-xs text-white/40">/{type === 'food' ? 'квартал' : 'кв'}</div>
        </div>
      </div>
    </ClickFeedback>
  )
}

export function LifestyleSection({ displayData, isPlayer, member }: LifestyleSectionProps) {
  const { setLifestyle, setMemberFoodPreference, setMemberTransportPreference } = useGameStore()

  const handleFoodClick = React.useCallback(
    (itemId: string) => {
      if (isPlayer) {
        setLifestyle('food', itemId)
      } else if (member) {
        setMemberFoodPreference(member.id, itemId)
      }
    },
    [isPlayer, member, setLifestyle, setMemberFoodPreference],
  )

  const handleTransportClick = React.useCallback(
    (itemId: string) => {
      if (isPlayer) {
        setLifestyle('transport', itemId)
      } else if (member) {
        setMemberTransportPreference(member.id, itemId)
      }
    },
    [isPlayer, member, setLifestyle, setMemberTransportPreference],
  )

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-white/80 uppercase tracking-wider mb-3">
          Образ жизни
        </h4>

        <div className="mb-4">
          <label className="text-xs text-white/60 mb-2 block">Питание</label>
          <div className="grid grid-cols-1 gap-2">
            {getRecurringItemsByCategory('food').map((item) => (
              <LifestyleItem
                isActive={displayData.foodPreference === item.id}
                item={item}
                key={item.id}
                onClick={handleFoodClick}
                type="food"
              />
            ))}
          </div>
        </div>
      </div>

      {(isPlayer || (member && member.age >= 10 && member.type !== 'pet')) && (
        <div className="mt-4">
          <label className="text-xs text-white/60 mb-2 block">Транспорт</label>
          <div className="grid grid-cols-1 gap-2">
            {getRecurringItemsByCategory('transport').map((item) => (
              <LifestyleItem
                isActive={displayData.transportPreference === item.id}
                item={item}
                key={item.id}
                onClick={handleTransportClick}
                type="transport"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
