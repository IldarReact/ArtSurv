import { useMemo } from 'react'

import { getShopItem } from '@/core/lib/shop-helpers'
import { useGameStore } from '@/core/model/store'

export function useHousingCapacity() {
  const { player } = useGameStore()

  return useMemo(() => {
    if (!player?.housingId) {
      return {
        capacity: 0,
        familySize: 0,
        isOvercrowded: false,
        overcrowdingPercent: 0,
        penalty: 0,
        status: 'none' as const,
      }
    }

    const housing = getShopItem(player.housingId, player.countryId)
    const familySize = 1 + player.personal.familyMembers.length
    const capacity = housing?.capacity ?? 2

    const isOvercrowded = familySize > capacity
    const overcrowdingPercent = isOvercrowded ? ((familySize - capacity) / capacity) * 100 : 0
    const penalty = isOvercrowded ? Math.ceil(overcrowdingPercent / 10) : 0

    let status: 'none' | 'warning' | 'critical' = 'none'
    if (overcrowdingPercent >= 50) status = 'critical'
    else if (overcrowdingPercent > 0) status = 'warning'

    return {
      capacity,
      familySize,
      isOvercrowded,
      overcrowdingPercent,
      penalty,
      status,
    }
  }, [player])
}
