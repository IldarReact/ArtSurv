import { getMyConnectionId } from '@/core/lib/multiplayer'
import type { GameOffer } from '@/core/types/game-offers.types'

import type { GameStore } from '../../../../types'

export interface OfferSentPayload {
  offer: GameOffer
}

export interface OfferRejectedPayload {
  offerId: string
}

export function handleOnOfferSent(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  payload: OfferSentPayload,
) {
  const myConnectionId = getMyConnectionId()
  const offer = payload.offer

  if (offer.toPlayerId === myConnectionId) {
    if (state.offers.some((o) => o.id === offer.id)) return

    set((state) => ({
      offers: [...state.offers, offer],
    }))

    state.pushNotification({
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

export function handleOnOfferRejected(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  payload: OfferRejectedPayload,
) {
  const { offerId } = payload

  set((state) => ({
    offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'rejected' } : o)),
  }))

  const offer = state.offers.find((o) => o.id === offerId)
  if (offer && offer.fromPlayerId === state.player?.id) {
    state.pushNotification({
      message: `${offer.toPlayerName} отклонил ваше предложение`,
      title: 'Предложение отклонено',
      type: 'info',
    })
  }
}
