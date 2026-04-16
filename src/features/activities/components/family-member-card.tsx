'use client'

import { ChevronRight, User } from 'lucide-react'
import React from 'react'

import { useInflatedPrice } from '@/core/hooks'
import { getShopItem } from '@/core/lib/shop-helpers'
import { useGameStore } from '@/core/model/store'
import type { FamilyMember, LifeGoal } from '@/core/types'
import { Button } from '@/shared/components/button'
import { Dialog, DialogTrigger } from '@/shared/components/dialog'

import { MemberCardContent } from './family-member-card/member-card-content'
import { MemberDetailsDialog } from './family-member-card/member-details-dialog'

interface FamilyMemberCardProps {
  isPlayer?: boolean
  member?: FamilyMember
}

interface DisplayData {
  age: number
  expenses: number
  foodPreference?: string
  goals: LifeGoal[]
  id: string
  income: number
  name: string
  passiveEffects: Record<string, unknown>
  relationLevel: number
  transportPreference?: string
  type: FamilyMember['type'] | 'player'
}

export function FamilyMemberCard({ isPlayer = false, member }: FamilyMemberCardProps) {
  const { player } = useGameStore()

  const displayData: DisplayData | undefined = React.useMemo(() => {
    if (!player) return undefined
    return isPlayer
      ? {
          age: Math.floor(player.age),
          expenses: 0,
          foodPreference: player.activeLifestyle.food,
          goals: player.personal.lifeGoals,
          id: player.id,
          income: player.quarterlySalary,
          name: player.name,
          passiveEffects: {},
          relationLevel: 100,
          transportPreference: player.activeLifestyle.transport,
          type: 'player' as const,
        }
      : member
        ? {
            ...member,
            goals: member.goals ?? [],
          }
        : undefined
  }, [isPlayer, member, player])

  const foodItem = React.useMemo(
    () =>
      displayData?.foodPreference && player
        ? getShopItem(displayData.foodPreference, player.countryId)
        : null,
    [displayData, player],
  )
  const transportItem = React.useMemo(
    () =>
      displayData?.transportPreference && player
        ? getShopItem(displayData.transportPreference, player.countryId)
        : null,
    [displayData, player],
  )

  // Применить инфляцию к ценам
  const foodPrice = useInflatedPrice(foodItem ?? { category: 'food', price: 0 })
  const transportPrice = useInflatedPrice(transportItem ?? { category: 'transport', price: 0 })

  const getTypeLabel = React.useCallback(() => {
    if (isPlayer) return 'Вы'
    if (!member) return ''
    switch (member.type) {
      case 'wife':
        return 'Жена'
      case 'husband':
        return 'Муж'
      case 'child':
        return 'Ребенок'
      case 'pet':
        return 'Питомец'
      case 'parent':
        return 'Родитель'
      case 'friend':
        return 'Друг'
      case 'colleague':
        return 'Коллега'
    }
  }, [isPlayer, member])

  const getIcon = React.useCallback(() => {
    if (isPlayer) return <User className="w-6 h-6" />
    if (!member) return <User className="w-6 h-6" />
    switch (member.type) {
      case 'pet':
        return '🐾'
      case 'child':
        return '👶'
      case 'wife':
      case 'husband':
      case 'parent':
      case 'friend':
      case 'colleague':
        return '👤'
    }
  }, [isPlayer, member])

  if (!player || !displayData) return null

  return (
    <div
      className={`bg-white/5 border rounded-2xl p-6 hover:border-white/20 transition-colors flex flex-col h-full ${
        isPlayer ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/10'
      }`}
    >
      <MemberCardContent
        displayData={displayData}
        foodItem={foodItem ?? null}
        foodPrice={foodPrice}
        getIcon={getIcon}
        getTypeLabel={getTypeLabel}
        isPlayer={isPlayer}
        member={member}
        transportItem={transportItem ?? null}
        transportPrice={transportPrice}
      />

      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="w-full border-white/10 hover:bg-white/10 text-white text-xs h-8"
            variant="outline"
          >
            Подробнее
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </DialogTrigger>
        <MemberDetailsDialog
          displayData={displayData}
          getIcon={getIcon}
          getTypeLabel={getTypeLabel}
          isPlayer={isPlayer}
          member={member}
          player={player}
        />
      </Dialog>
    </div>
  )
}
