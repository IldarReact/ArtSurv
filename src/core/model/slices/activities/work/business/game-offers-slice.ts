import type { StateCreator } from 'zustand'

import { broadcastEvent } from '@/core/lib/multiplayer'
import {
  generateOfferId,
  isPartnershipOffer,
  isJobOffer,
  type GameOffer,
} from '@/core/types/game-offers.types'

import type { GameStore, GameOffersSlice } from '../../../types'
import { handleAcceptJobOffer, handleOnJobOfferAccepted } from './offers/job-logic'
import { handleOnOfferSent, handleOnOfferRejected } from './offers/offer-handlers'
import { handleAcceptPartnership, handleOnPartnershipAccepted } from './offers/partnership-logic'

export const createGameOffersSlice: StateCreator<GameStore, [], [], GameOffersSlice> = (
  set,
  get,
) => ({
  acceptOffer: (offerId) => {
    const state = get()
    const offer = state.offers.find((o) => o.id === offerId)

    if (offer?.status !== 'pending') return

    if (isPartnershipOffer(offer)) {
      handleAcceptPartnership(state, set, offer)
    } else if (isJobOffer(offer)) {
      handleAcceptJobOffer(state, set, offer)
    }
  },

  cancelOffer: (offerId) => {
    set((state) => ({
      offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'cancelled' } : o)),
    }))
  },

  cleanupExpiredOffers: () => {
    const currentTurn = get().turn
    set((state) => ({
      offers: state.offers.map((o) => {
        if (o.status === 'pending' && currentTurn - o.createdTurn >= o.expiresInTurns) {
          return { ...o, status: 'expired' }
        }
        return o
      }),
    }))
  },

  getIncomingOffers: () => {
    const state = get()
    if (!state.player) return []
    const playerId = state.player.id
    return state.offers.filter((o) => o.toPlayerId === playerId)
  },

  getOutgoingOffers: () => {
    const state = get()
    if (!state.player) return []
    const playerId = state.player.id
    return state.offers.filter((o) => o.fromPlayerId === playerId)
  },

  offers: [],

  onJobOfferAccepted: (event) => {
    handleOnJobOfferAccepted(get(), set, event.payload)
  },

  onOfferRejected: (event) => {
    handleOnOfferRejected(get(), set, event.payload)
  },

  onOfferSent: (event) => {
    handleOnOfferSent(get(), set, event.payload)
  },

  onPartnershipAccepted: (event) => {
    handleOnPartnershipAccepted(get(), set, event.payload)
  },

  onPartnershipUpdated: (event) => {
    const state = get()
    if (!state.player) return

    const { businessId, partnerBusinessId } = event.payload

    set((state) => {
      if (!state.player) return state

      return {
        player: {
          ...state.player,
          businesses: state.player.businesses.map((business) =>
            business.id === businessId ? { ...business, partnerBusinessId } : business,
          ),
        },
      }
    })
  },

  rejectOffer: (offerId) => {
    const state = get()
    set((state) => ({
      offers: state.offers.map((o) => (o.id === offerId ? { ...o, status: 'rejected' } : o)),
    }))

    if (state.player) {
      broadcastEvent({
        payload: { offerId, rejectedBy: state.player.id },
        type: 'OFFER_REJECTED',
      })
    }
  },

  sendOffer: (type, toPlayerId, toPlayerName, details, message) => {
    const state = get()
    if (!state.player) return

    const newOffer = {
      createdTurn: state.turn,
      details,
      expiresInTurns: 1,
      fromPlayerId: state.player.id,
      fromPlayerName: state.player.name,
      id: generateOfferId(),
      message,
      status: 'pending' as const,
      toPlayerId,
      toPlayerName,
      type,
    } as GameOffer

    set((state) => ({
      offers: [...state.offers, newOffer],
    }))

    broadcastEvent({
      payload: { offer: newOffer },
      type: 'OFFER_SENT',
    })
  },
})
