import { validateBusinessOpening, createBusinessObject } from '@/core/lib/business'
import {
  shouldCreateNetwork,
  createNetworkForBusinesses,
  addBranchToNetwork,
  updateNetworkBonuses,
} from '@/core/lib/business/business-network'
import type { Business } from '@/core/types'

import type { GameStore } from '../../../../types'

export const handleOpenBusiness = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  business: Business,
  upfrontCost: number,
) => {
  const state = get()
  if (!state.player) return

  const validation = validateBusinessOpening(
    state.player.stats.money,
    upfrontCost,
    state.player.stats.energy,
    business.creationCost,
  )

  if (!validation.isValid) {
    const errorMessage = validation.error ?? 'Неизвестная ошибка при открытии бизнеса'
    state.pushNotification({
      message: errorMessage,
      title: 'Не удалось открыть бизнес',
      type: 'error',
    })
    return
  }

  // Списываем деньги и энергию
  if (
    !state.performTransaction(
      { money: -upfrontCost, ...business.creationCost },
      { title: 'Открытие бизнеса' },
    )
  ) {
    return
  }

  let finalBusinesses = [...state.player.businesses]
  let finalNewBusiness = business

  if (shouldCreateNetwork(state.player.businesses, business.type)) {
    const existingBusiness = state.player.businesses.find(
      (b: Business) => b.type === business.type && b.state !== 'frozen',
    )

    if (existingBusiness) {
      const { branch, main } = createNetworkForBusinesses(existingBusiness, business)
      finalBusinesses = finalBusinesses.map((b) => (b.id === existingBusiness.id ? main : b))
      finalNewBusiness = branch
    }
  } else {
    const existingNetwork = state.player.businesses.find(
      (b: Business) => b.type === business.type && b.networkId && b.state !== 'frozen',
    )

    if (existingNetwork?.networkId) {
      const mainBranch = state.player.businesses.find(
        (b: Business) => b.networkId === existingNetwork.networkId && b.isMainBranch,
      )

      if (mainBranch) {
        finalNewBusiness = addBranchToNetwork(business, existingNetwork.networkId, mainBranch.price)
      }
    }
  }

  finalBusinesses.push(finalNewBusiness)

  if (finalNewBusiness.networkId) {
    finalBusinesses = updateNetworkBonuses(finalBusinesses, finalNewBusiness.networkId)
  }

  state.updatePlayer(() => ({
    businesses: finalBusinesses,
  }))

  state.pushNotification({
    message: `Вы успешно открыли "${business.name}"`,
    title: 'Бизнес открыт',
    type: 'success',
  })
}

const SELL_PRICE_MULTIPLIER = 0.8

export const handleSellBusiness = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  businessId: string,
) => {
  const state = get()
  if (!state.player) return

  const business = state.player.businesses.find((b) => b.id === businessId)
  if (!business) return

  const sellPrice = Math.round((business.currentValue || 0) * SELL_PRICE_MULTIPLIER) // 80% valuation

  state.performTransaction({ money: sellPrice }, { title: `Продажа бизнеса: ${business.name}` })

  state.updatePlayer((prev) => ({
    businesses: prev.businesses.filter((b) => b.id !== businessId),
  }))

  state.pushNotification({
    message: `Вы продали "${business.name}" за $${sellPrice.toLocaleString()}`,
    title: 'Бизнес продан',
    type: 'success',
  })
}

export const handleOpenBranch = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  sourceBusinessId: string,
) => {
  const state = get()
  if (!state.player) return

  const sourceBusiness = state.player.businesses.find((b: Business) => b.id === sourceBusinessId)
  if (!sourceBusiness) return

  const branchCost = sourceBusiness.initialCost

  // Валидация денег перед созданием объекта
  if (state.player.stats.money < branchCost) {
    state.pushNotification({
      message: `Требуется $${branchCost.toLocaleString()}`,
      title: 'Недостаточно средств',
      type: 'error',
    })
    return
  }

  const openingQuarters = sourceBusiness.openingProgress?.totalDuration ?? 0
  const totalCost = sourceBusiness.openingProgress?.totalCost ?? sourceBusiness.initialCost
  const upfrontCost = sourceBusiness.openingProgress?.upfrontCost ?? sourceBusiness.initialCost

  const branch = createBusinessObject({
    creationCost: sourceBusiness.creationCost,
    currentTurn: state.turn,
    description: sourceBusiness.description,
    employeeRoles: sourceBusiness.employeeRoles,
    maxEmployees: sourceBusiness.maxEmployees,
    name: `${sourceBusiness.name} (Branch)`,
    openingQuarters,
    totalCost,
    type: sourceBusiness.type,
    upfrontCost,
  })

  handleOpenBusiness(get, set, branch, branchCost)
}
