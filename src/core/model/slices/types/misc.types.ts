import type { BusinessInventory, Employee } from '@/core/types/business.types'
import type { GameEvent, GameEventType } from '@/core/types/events.types'
import type { Asset, Debt } from '@/core/types/finance.types'
import type { GameOffer } from '@/core/types/game-offers.types'
import type { ActiveCourse, ActiveUniversity } from '@/core/types/skill.types'

// Add these interfaces at the top of the file
export interface LocalPlayer {
  assets?: Asset[]
  businesses: LocalBusiness[]
  debts?: Debt[]
  id: string
  name: string
  personal?: {
    stats: {
      energy: number
      money: number
    }
    activeCourses?: ActiveCourse[]
    activeUniversity?: ActiveUniversity[]
  }
  stats: {
    money: number
    energy?: number
  }
}

export interface LocalBusiness {
  employees?: Employee[]
  id: string
  inventory?: BusinessInventory
  name?: string
  partnerBusinessId?: string
  price?: number
  walletBalance?: number
}

export interface LocalGameOffer {
  createdTurn: number
  details: {
    businessName: string
    businessType: string
    businessDescription: string
    totalCost: number
    partnerInvestment: number
    partnerShare: number
    yourShare: number
    yourInvestment: number
    businessId: string
  }
  expiresInTurns: number
  fromPlayerId: string
  fromPlayerName: string
  id: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  toPlayerId: string
  toPlayerName: string
  type: string
}

export interface LocalGameState {
  offers: GameOffer[]
  player: LocalPlayer
  turn: number
}

/**
 * Represents a business entity that can have multiple partners
 */
export interface BusinessWithPartners {
  address?: {
    street: string
    city: string
    country: string
    postalCode: string
  }
  contact?: {
    email: string
    phone?: string
    website?: string
  }
  description: string
  establishedDate: Date
  financials?: {
    revenue: number
    expenses: number
    profit: number
    lastUpdated: Date
  }
  id: string
  name: string
  partners: {
    id: string
    name?: string
    ownershipPercentage?: number
    joinedDate?: Date
  }[]
  status: 'active' | 'inactive' | 'suspended' | 'closed'
  totalInvestment: number
  type: string
  valuation: number
}

export interface MockState {
  applyStatChanges?: (changes: Partial<{ money: number; energy: number }>) => void
  performTransaction: (cost: { money?: number }, options?: { requireFunds?: boolean }) => boolean
  pushNotification: (n: { title: string; message?: string; type?: string }) => void
  get: () => LocalGameState
  getState: () => LocalGameState
  on: (eventType: GameEventType, handler: (event: GameEvent) => void) => void
  set: (patch: Partial<LocalGameState>) => void
  state: () => LocalGameState
}
