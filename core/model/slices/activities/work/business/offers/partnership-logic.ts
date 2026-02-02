import { createPartnerBusiness } from '@/core/lib/business/create-partner-business'
import { broadcastEvent } from '@/core/lib/multiplayer'
import { PartnershipOfferSchema } from '@/core/schemas/game.schema'
import type { PartnershipOffer } from '@/core/types'
import type { BusinessType, BusinessRoleTemplate } from '@/core/types/business.types'

import type { GameStore } from '../../../../types'

export interface PartnershipAcceptedPayload {
  businessDescription: string
  businessId: string
  businessId_actual?: string
  businessName: string
  businessType: BusinessType
  employeeRoles: BusinessRoleTemplate[]
  partnerId: string
  partnerInvestment: number
  partnerName: string
  partnerShare: number
  totalCost: number
  yourInvestment: number
  yourShare: number
}

export function handleAcceptPartnership(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  offerData: unknown,
) {
  if (!state.player) return

  const result = PartnershipOfferSchema.safeParse(offerData)
  if (!result.success) {
    state.pushNotification({
      message: 'Получено некорректное предложение о партнерстве',
      title: 'Ошибка данных',
      type: 'error',
    })
    return
  }
  const offer = result.data as PartnershipOffer

  // Проверяем, хватает ли у игрока денег
  if (state.player.stats.money < offer.details.partnerInvestment) {
    return
  }

  // 1. Создаем бизнес для принимающего игрока
  const isInitiator = false
  const acceptingBusiness = createPartnerBusiness(
    {
      details: {
        businessDescription: offer.details.businessDescription,
        businessId: offer.details.businessId,
        businessName: offer.details.businessName,
        businessType: offer.details.businessType as BusinessType,
        employeeRoles: offer.details.employeeRoles,
        totalCost: offer.details.totalCost,
        yourInvestment: offer.details.partnerInvestment,
        yourShare: offer.details.partnerShare,
      },
      fromPlayerId: offer.fromPlayerId,
      fromPlayerName: offer.fromPlayerName,
    },
    state.turn,
    state.player.id,
    isInitiator,
  )

  // 2. Вычитаем деньги у принимающего игрока
  state.performTransaction(
    { money: -offer.details.partnerInvestment },
    { title: 'Партнёрская инвестиция' },
  )

  // 3. Добавляем бизнес принимающему игроку
  set((state) => {
    if (!state.player) return state
    return {
      offers: state.offers.map((o) => (o.id === offer.id ? { ...o, status: 'accepted' } : o)),
      player: {
        ...state.player,
        businesses: [...state.player.businesses, acceptingBusiness],
      },
    }
  })

  // 4. Уведомляем инициатора
  const payload: PartnershipAcceptedPayload = {
    businessDescription: acceptingBusiness.description,
    businessId: acceptingBusiness.id,
    businessId_actual: acceptingBusiness.id,
    businessName: acceptingBusiness.name,
    businessType: acceptingBusiness.type,
    employeeRoles: offer.details.employeeRoles,
    partnerId: state.player.id,
    partnerInvestment: offer.details.partnerInvestment,
    partnerName: state.player.name,
    partnerShare: offer.details.partnerShare,
    totalCost: offer.details.totalCost,
    yourInvestment: offer.details.yourInvestment,
    yourShare: offer.details.yourShare,
  }

  broadcastEvent({
    payload,
    type: 'PARTNERSHIP_ACCEPTED',
  })

  // 5. Уведомляем принимающего игрока
  state.pushNotification({
    message: `Вы стали партнером с ${offer.fromPlayerName} в бизнесе "${offer.details.businessName}"`,
    title: 'Партнёрство создано',
    type: 'success',
  })
}

export function handleOnPartnershipAccepted(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  payload: PartnershipAcceptedPayload,
) {
  if (!state.player) return

  // Basic validation for payload since it comes from network
  if (!payload.businessId || !payload.partnerId) {
    return
  }

  try {
    const isInitiator = true
    const initiatorBusiness = createPartnerBusiness(
      {
        details: {
          businessDescription: payload.businessDescription,
          businessId: payload.businessId,
          businessName: payload.businessName,
          businessType: payload.businessType,
          employeeRoles: payload.employeeRoles,
          totalCost: payload.totalCost,
          yourInvestment: payload.yourInvestment,
          yourShare: payload.yourShare,
        },
        fromPlayerId: payload.partnerId,
        fromPlayerName: payload.partnerName,
      },
      state.turn,
      state.player.id,
      isInitiator,
    )

    initiatorBusiness.partnerBusinessId = payload.businessId

    state.performTransaction(
      { money: -payload.yourInvestment },
      { title: 'Партнёрская инвестиция' },
    )

    set((state) => {
      if (!state.player) return state
      return {
        player: {
          ...state.player,
          businesses: [...state.player.businesses, initiatorBusiness],
        },
      }
    })

    broadcastEvent({
      payload: {
        businessId: payload.businessId,
        partnerBusinessId: initiatorBusiness.id,
      },
      toPlayerId: payload.partnerId,
      type: 'PARTNERSHIP_UPDATED',
    })

    state.pushNotification({
      message: `Вы стали партнером с ${payload.partnerName} в бизнесе "${payload.businessName}"`,
      title: 'Партнёрство создано',
      type: 'success',
    })
  } catch {
    // Error handling
  }
}
