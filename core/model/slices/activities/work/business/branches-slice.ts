import { createBusinessBranch } from '@/core/lib/business'

import type { GameStateCreator } from '../../../types'

export const createBranchesSlice: GameStateCreator<{
  openBranch: (sourceBusinessId: string) => void
}> = (set, get) => ({
  openBranch: (sourceBusinessId: string) => {
    const state = get()
    if (!state.player) return

    const sourceBusiness = state.player.businesses.find((b) => b.id === sourceBusinessId)
    if (!sourceBusiness) return

    // Стоимость открытия филиала (берем initialCost)
    const branchCost = sourceBusiness.initialCost

    let networkId = sourceBusiness.networkId
    let updatedBusinesses = [...state.player.businesses]

    // Если сети еще нет, создаем её
    if (!networkId) {
      networkId = `net_${String(Date.now())}`

      // Обновляем исходный бизнес, делаем его главным
      updatedBusinesses = updatedBusinesses.map((b) =>
        b.id === sourceBusinessId ? { ...b, isMainBranch: true, networkId } : b,
      )
    }

    // Считаем количество филиалов в этой сети для названия
    const branchCount = updatedBusinesses.filter((b) => b.networkId === networkId).length

    // Списываем деньги через транзакцию
    if (!state.performTransaction({ money: -branchCost }, { title: 'Открытие филиала' })) {
      return
    }

    const newBranch = createBusinessBranch(
      sourceBusiness,
      networkId,
      branchCount,
      state.turn,
      branchCost,
    )

    state.updatePlayer((_prev) => ({
      businesses: [...updatedBusinesses, newBranch],
    }))
  },
})
