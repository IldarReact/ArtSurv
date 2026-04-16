import type { Business } from '@/core/types'

import type { GameStore } from '../../../../types'

/**
 * Вспомогательная функция для обновления конкретного бизнеса в стейте игрока.
 * Уменьшает дублирование кода в слайсах.
 */
export function updateBusinessInState(
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  updateFn: (business: Business) => Business,
) {
  set((state) => {
    if (!state.player) return state

    const businesses = state.player.businesses.map((b) => (b.id === businessId ? updateFn(b) : b))

    return {
      player: {
        ...state.player,
        businesses,
      },
    }
  })
}
