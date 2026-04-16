import { initMultiplayer, subscribeToEvents } from '@/core/lib/multiplayer'
import type { GameEvent } from '@/core/types/events.types'

import { useGameStore } from './store'

let multiplayerSynced = false

export function enableMultiplayerSync() {
  if (multiplayerSynced) return
  multiplayerSynced = true

  const urlParams = new URLSearchParams(window.location.search)
  const room = urlParams.get('room')
  if (!room) return

  initMultiplayer(room)

  const state = useGameStore.getState()

  // Liveblocks → Zustand (events)
  subscribeToEvents((event: GameEvent) => {
    // console.log('Событие получено:', event.type, 'для игрока:', state.player?.id)

    // Filter events meant for other players if toPlayerId is specified
    if (event.toPlayerId && state.player && event.toPlayerId !== state.player.id) {
      return
    }

    switch (event.type) {
      // Partnership events
      case 'PARTNERSHIP_ACCEPTED':
        state.onPartnershipAccepted(event)
        break
      case 'PARTNERSHIP_UPDATED':
        state.onPartnershipUpdated(event)
        break

      // Business change events
      case 'BUSINESS_CHANGE_PROPOSED':
        state.onBusinessChangeProposed(event)
        break
      case 'BUSINESS_CHANGE_APPROVED':
        state.onBusinessChangeApproved(event)
        break
      case 'BUSINESS_CHANGE_REJECTED':
        state.onBusinessChangeRejected(event)
        break
      case 'BUSINESS_UPDATED':
        state.onBusinessUpdated(event)
        break

      // Offer events
      case 'JOB_OFFER_ACCEPTED':
        state.onJobOfferAccepted(event)
        break
      case 'OFFER_SENT':
        state.onOfferSent(event)
        break
      case 'OFFER_REJECTED':
        state.onOfferRejected(event)
        break

      case 'OFFER_ACCEPTED':
      case 'BUSINESS_SYNC':
        // Handle or ignore these events
        break

      default:
        // console.warn('Unknown event type:', event.type)
        break
    }
  })
}
