import { validateBusinessUnfreeze } from '@/core/lib/business'
import { canMakeDirectChanges } from '@/core/lib/business/partnership-permissions'
import { normalizeDurationFromTurns } from '@/core/lib/stats/stat-change-format'
import type { Business } from '@/core/types'

import type { GameStore } from '../../../../types'

const REPUTATION_LOSS_ON_FREEZE = 20
const CLOSE_BUSINESS_RETURN_RATE = 0.5

export const handleCloseBusiness = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  businessId: string,
) => {
  const state = get()
  if (!state.player) return

  const business = state.player.businesses.find((b: Business) => b.id === businessId)
  if (!business) return

  const partnerCount = business.partners.length
  if (partnerCount > 0 && !canMakeDirectChanges(business, state.player.id)) {
    state.pushNotification({
      message:
        'Закрытие бизнеса напрямую доступно только владельцу с долей больше 50%. Для равных долей требуется одобрение партнёра.',
      title: 'Недостаточно прав',
      type: 'error',
    })
    return
  }

  const returnValue = Math.round(business.currentValue * CLOSE_BUSINESS_RETURN_RATE)

  // Используем транзакцию для возврата денег
  state.performTransaction({ money: returnValue }, { title: `Закрытие бизнеса: ${business.name}` })

  state.updatePlayer((prev) => ({
    businesses: prev.businesses.filter((b: Business) => b.id !== businessId),
  }))
}

export const handleFreezeBusiness = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  businessId: string,
) => {
  const state = get()
  if (!state.player) return

  const business = state.player.businesses.find((b: Business) => b.id === businessId)
  if (!business) return

  let compensation = 0
  for (const emp of business.employees) {
    compensation += emp.salary
  }

  if (!state.performTransaction({ money: -compensation }, { title: 'Заморозка бизнеса' })) {
    return
  }

  state.updatePlayer((prev) => ({
    businesses: prev.businesses.map((b: Business) =>
      b.id === businessId
        ? {
            ...b,
            employees: [],
            inventory: { ...b.inventory, currentStock: 0 },
            reputation: Math.max(0, b.reputation - REPUTATION_LOSS_ON_FREEZE),
            state: 'frozen' as const,
          }
        : b,
    ),
  }))
}

export const handleUnfreezeBusiness = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  businessId: string,
) => {
  const state = get()
  if (!state.player) return

  const business = state.player.businesses.find((b: Business) => b.id === businessId)
  if (!business) return

  const validation = validateBusinessUnfreeze(state.player.stats.money, business.initialCost)
  if (!validation.isValid) {
    const errorMessage = validation.error ?? 'Недостаточно средств для разморозки'
    state.pushNotification({
      message: errorMessage,
      title: 'Ошибка разморозки',
      type: 'error',
    })
    return
  }

  if (
    !state.performTransaction({ money: -validation.unfreezeCost }, { title: 'Разморозка бизнеса' })
  ) {
    return
  }

  state.updatePlayer((prev) => ({
    businesses: prev.businesses.map((b: Business) =>
      b.id === businessId
        ? (() => {
            const reopenDuration = normalizeDurationFromTurns(1)
            return {
              ...b,
              openingProgress: {
                id: b.openingProgress?.id ?? `opening_${b.id}`,
                investedAmount: b.openingProgress?.investedAmount ?? b.initialCost,
                quartersLeft: reopenDuration,
                remainingDuration: reopenDuration,
                title: `Разморозка: ${b.name}`,
                totalCost: b.openingProgress?.totalCost ?? b.initialCost,
                totalDuration: reopenDuration,
                totalQuarters: reopenDuration,
                upfrontCost: b.openingProgress?.upfrontCost ?? 0,
              },
              state: 'opening' as const,
            }
          })()
        : b,
    ),
  }))
}

export const handleDepositToBusinessWallet = (
  get: () => GameStore,
  set: (patch: Partial<GameStore>) => void,
  businessId: string,
  amount: number,
) => {
  const state = get()
  if (!state.player) return
  if (amount <= 0) return

  const i = state.player.businesses.findIndex((b: Business) => b.id === businessId)
  if (i === -1) return

  if (!state.performTransaction({ money: -amount }, { title: 'Пополнение кошелька бизнеса' })) {
    return
  }

  state.updatePlayer((prev) => {
    const updatedBusinesses = [...prev.businesses]
    const business = updatedBusinesses[i]
    updatedBusinesses[i] = {
      ...business,
      walletBalance: (business.walletBalance ?? 0) + amount,
    }
    return { businesses: updatedBusinesses }
  })
}
