import type {
  Business,
  BusinessChangeType,
  BusinessProposal,
  BusinessRoleTemplate,
  BusinessType,
  Employee,
  EmployeeRole,
} from './business.types'
import type { GameOffer } from './game-offers.types'

export type GameEventType =
  | 'PARTNERSHIP_ACCEPTED'
  | 'PARTNERSHIP_UPDATED'
  | 'OFFER_SENT'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'JOB_OFFER_ACCEPTED'
  | 'BUSINESS_SYNC'
  | 'BUSINESS_CHANGE_PROPOSED'
  | 'BUSINESS_CHANGE_APPROVED'
  | 'BUSINESS_CHANGE_REJECTED'
  | 'BUSINESS_UPDATED'

export interface BaseGameEvent {
  fromPlayerId?: string
  timestamp?: number
  toPlayerId?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// Partnership Events
export interface PartnershipAcceptedEvent extends BaseGameEvent {
  payload: {
    businessId: string
    partnerId: string
    partnerName: string
    businessName: string
    businessType: BusinessType
    businessDescription: string
    totalCost: number
    partnerShare: number
    partnerInvestment: number
    yourShare: number
    yourInvestment: number
    employeeRoles: BusinessRoleTemplate[]
  }
  type: 'PARTNERSHIP_ACCEPTED'
}

export interface PartnershipUpdatedEvent extends BaseGameEvent {
  payload: {
    businessId: string
    partnerBusinessId: string
  }
  type: 'PARTNERSHIP_UPDATED'
}

// Offer Events
export interface OfferSentEvent extends BaseGameEvent {
  payload: {
    offer: GameOffer
  }
  type: 'OFFER_SENT'
}

export interface OfferRejectedEvent extends BaseGameEvent {
  payload: {
    offerId: string
    rejectedBy: string
  }
  type: 'OFFER_REJECTED'
}

export interface OfferAcceptedEvent extends BaseGameEvent {
  payload: {
    offerId: string
    acceptedBy: string
  }
  type: 'OFFER_ACCEPTED'
}

export interface JobOfferAcceptedEvent extends BaseGameEvent {
  payload: {
    offerId: string
    employeeId: string
    employeeName: string
    businessId: string
    role: EmployeeRole
    salary: number
  }
  type: 'JOB_OFFER_ACCEPTED'
}

// Business Sync Events
export interface BusinessSyncEvent extends BaseGameEvent {
  payload: {
    business: Business
    targetPlayerId: string
  }
  type: 'BUSINESS_SYNC'
}

// Business Change Events
export interface BusinessChangeProposedEvent extends BaseGameEvent {
  payload: {
    businessId: string
    proposalId: string
    changeType: BusinessChangeType
    initiatorId: string
    initiatorName: string
    data: BusinessProposal['data']
  }
  type: 'BUSINESS_CHANGE_PROPOSED'
}

export interface BusinessChangeApprovedEvent extends BaseGameEvent {
  payload: {
    businessId: string
    proposalId: string
    approverId: string
  }
  type: 'BUSINESS_CHANGE_APPROVED'
}

export interface BusinessChangeRejectedEvent extends BaseGameEvent {
  payload: {
    businessId: string
    proposalId: string
    rejecterId: string
  }
  type: 'BUSINESS_CHANGE_REJECTED'
}

export interface BusinessUpdatedEvent extends BaseGameEvent {
  payload: {
    businessId: string
    changes: {
      price?: number
      quantity?: number
      employees?: Employee[]
      state?: 'active' | 'frozen' | 'opening'
      playerEmployment?: Business['playerEmployment']
      walletBalance?: number
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any
    }
  }
  type: 'BUSINESS_UPDATED'
}

export type GameEvent =
  | PartnershipAcceptedEvent
  | PartnershipUpdatedEvent
  | OfferSentEvent
  | OfferAcceptedEvent
  | OfferRejectedEvent
  | BusinessSyncEvent
  | BusinessChangeProposedEvent
  | BusinessChangeApprovedEvent
  | BusinessChangeRejectedEvent
  | BusinessUpdatedEvent
  | JobOfferAcceptedEvent
