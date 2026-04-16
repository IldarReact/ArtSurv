import { TrendingUp, AlertCircle, Activity, User } from 'lucide-react'

import type { HumanTrait } from '@/core/types/human-traits.types'
import humanTraitsData from '@/shared/data/world/commons/human-traits.json'

export const TRAITS_MAP: Record<string, HumanTrait | undefined> = Object.fromEntries(
  (humanTraitsData as HumanTrait[]).map((trait) => [trait.id, trait]),
)

export function getTraitColor(type: HumanTrait['type']): string {
  switch (type) {
    case 'positive':
      return 'text-green-400'
    case 'negative':
      return 'text-rose-400'
    case 'medical':
      return 'text-amber-400'
    case 'neutral':
      return 'text-white/80'
    default:
      return 'text-white/80'
  }
}

export function getTraitIcon(type: HumanTrait['type']) {
  switch (type) {
    case 'positive':
      return TrendingUp
    case 'negative':
      return AlertCircle
    case 'medical':
      return Activity
    case 'neutral':
      return User
    default:
      return User
  }
}
