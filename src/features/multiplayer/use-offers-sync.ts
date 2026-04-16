import { useEffect } from 'react'

import { subscribeToEvents, getMyConnectionId, broadcastEvent } from '@/core/lib/multiplayer'
import { useGameStore } from '@/core/model/store'
import type { Business } from '@/core/types'
import type { GameOffer } from '@/core/types/game-offers.types'
import { isJobOffer, isPartnershipOffer, isShareSaleOffer } from '@/core/types/game-offers.types'

export function useOffersSync() {
  const {
    addEmployeeToBusiness,
    addPartnerToBusiness,
    addSharedBusiness,
    player,
    pushNotification,
  } = useGameStore()

  useEffect(() => {
    const handleOfferSent = (offer: GameOffer, myConnectionId: string | null) => {
      // Если оффер нам (сравниваем connectionId)
      if (offer.toPlayerId === myConnectionId) {
        // Добавляем в store
        useGameStore.setState((state) => ({
          offers: [...state.offers, offer],
        }))

        // Показываем уведомление
        pushNotification({
          data: {
            offerId: offer.id,
            type: 'offer_received',
          },
          message: `От ${offer.fromPlayerName}`,
          title: 'Новое предложение!',
          type: 'info',
        })
      }
    }

    const handleOfferAccepted = (offerId: string) => {
      const state = useGameStore.getState()

      // Обновляем статус оффера
      useGameStore.setState((state) => ({
        offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'accepted' } : o)),
      }))

      // Если это наш оффер, показываем уведомление и выполняем действия
      const offer = state.offers.find((o) => o.id === offerId)
      if (!offer) {
        return
      }
      if (offer.fromPlayerId === player?.id) {
        pushNotification({
          data: { type: 'success' },
          message: `${offer.toPlayerName} принял ваше предложение`,
          title: 'Предложение принято!',
          type: 'success',
        })

        if (isJobOffer(offer)) {
          addEmployeeToBusiness(
            offer.details.businessId,
            offer.toPlayerName,
            offer.details.role,
            offer.details.salary,
            offer.toPlayerId,
          )
        } else if (isPartnershipOffer(offer)) {
          addPartnerToBusiness(
            offer.details.businessId,
            offer.toPlayerId,
            offer.toPlayerName,
            offer.details.yourShare,
            offer.details.yourInvestment,
          )
          syncBusinessWithPartner(offer.details.businessId, offer.toPlayerId)
        } else if (isShareSaleOffer(offer)) {
          addPartnerToBusiness(
            offer.details.businessId,
            offer.toPlayerId,
            offer.toPlayerName,
            offer.details.sharePercent,
            offer.details.price,
          )
          syncBusinessWithPartner(offer.details.businessId, offer.toPlayerId)
        }
      }
    }

    const syncBusinessWithPartner = (businessId: string, partnerId: string) => {
      const updatedBusiness = useGameStore
        .getState()
        .player?.businesses.find((b) => b.id === businessId)
      if (updatedBusiness) {
        broadcastEvent({
          payload: { business: updatedBusiness, targetPlayerId: partnerId },
          type: 'BUSINESS_SYNC',
        })
      }
    }

    const handleBusinessSync = (business: Business, targetPlayerId: string) => {
      const myId = getMyConnectionId()

      if (targetPlayerId === myId) {
        addSharedBusiness(business)

        pushNotification({
          data: { type: 'success' },
          message: `Вы стали совладельцем ${business.name}`,
          title: 'Бизнес добавлен',
          type: 'success',
        })
      }
    }

    const handleOfferRejected = (offerId: string) => {
      // Обновляем статус оффера
      useGameStore.setState((state) => ({
        offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'rejected' } : o)),
      }))

      // Если это наш оффер, показываем уведомление
      const offer = useGameStore.getState().offers.find((o) => o.id === offerId)
      if (offer && offer.fromPlayerId === player?.id) {
        pushNotification({
          data: { type: 'warning' },
          message: `${offer.toPlayerName} отклонил ваше предложение`,
          title: 'Предложение отклонено',
          type: 'warning',
        })
      }
    }

    const unsubscribe = subscribeToEvents((event) => {
      const myConnectionId = getMyConnectionId()

      switch (event.type) {
        case 'OFFER_SENT':
          handleOfferSent(event.payload.offer, myConnectionId)
          break
        case 'OFFER_ACCEPTED':
          handleOfferAccepted(event.payload.offerId)
          break
        case 'BUSINESS_SYNC':
          handleBusinessSync(event.payload.business, event.payload.targetPlayerId)
          break
        case 'OFFER_REJECTED':
          handleOfferRejected(event.payload.offerId)
          break
        case 'PARTNERSHIP_ACCEPTED':
        case 'PARTNERSHIP_UPDATED':
        case 'BUSINESS_CHANGE_PROPOSED':
        case 'BUSINESS_CHANGE_APPROVED':
        case 'BUSINESS_CHANGE_REJECTED':
        case 'BUSINESS_UPDATED':
        case 'JOB_OFFER_ACCEPTED':
          // These events are handled elsewhere or don't require specific syncing here
          break
      }
    })

    return () => {
      unsubscribe()
    }
  }, [player?.id, pushNotification, addEmployeeToBusiness, addPartnerToBusiness, addSharedBusiness])
}
