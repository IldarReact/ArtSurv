import type {
  PartnershipAcceptedEvent,
  PartnershipUpdatedEvent,
  JobOfferAcceptedEvent,
  OfferSentEvent,
  OfferRejectedEvent,
} from '@/core/types/events.types'
import type { GameOffer, OfferType, OfferDetails } from '@/core/types/game-offers.types'

export interface GameOffersSlice {
  acceptOffer: (offerId: string) => void

  cancelOffer: (offerId: string) => void

  cleanupExpiredOffers: () => void
  // Helpers
  getIncomingOffers: () => GameOffer[]
  getOutgoingOffers: () => GameOffer[]
  offers: GameOffer[]

  onJobOfferAccepted: (event: JobOfferAcceptedEvent) => void
  onOfferRejected: (event: OfferRejectedEvent) => void

  onOfferSent: (event: OfferSentEvent) => void
  // Event Handlers
  onPartnershipAccepted: (event: PartnershipAcceptedEvent) => void
  onPartnershipUpdated: (event: PartnershipUpdatedEvent) => void
  rejectOffer: (offerId: string) => void
  // Actions
  sendOffer: (
    type: OfferType,
    toPlayerId: string,
    toPlayerName: string,
    details: OfferDetails,
    message?: string,
  ) => void
}
