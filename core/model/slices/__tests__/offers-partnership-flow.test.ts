import { describe, it, expect, vi } from 'vitest'

import { createMockPlayer } from '@/core/lib/calculations/loan/utils/mock-player'
import type { GameOffer, PartnershipOfferDetails } from '@/core/types/game-offers.types'

import { createGameOffersSlice } from '../activities/work/business/game-offers-slice'
import type { GameStore, LocalGameState, LocalPlayer } from '../types'

// Mock broadcastEvent
vi.mock('@/core/lib/multiplayer', () => ({
  broadcastEvent: vi.fn(),
}))

interface ExtendedLocalGameState extends LocalGameState {
  applyStatChanges?: (changes: { money?: number }) => void
}

function createMockState(initial: Partial<LocalGameState> = {}) {
  let state: ExtendedLocalGameState = {
    offers: [],
    player: {
      businesses: [],
      id: 'player_1',
      name: 'Player 1',
      stats: { money: 0 },
    } as unknown as LocalPlayer,
    turn: 1,
    ...initial,
  }

  const get = () =>
    ({
      ...state,
      performTransaction,
      pushNotification,
    }) as unknown as GameStore

  const set = (
    patch:
      | Partial<ExtendedLocalGameState>
      | ((s: ExtendedLocalGameState) => Partial<ExtendedLocalGameState>),
  ) => {
    const newState = typeof patch === 'function' ? patch(state) : patch
    state = { ...state, ...newState }
  }

  // Mock applyStatChanges
  state.applyStatChanges = (changes: { money?: number }) => {
    if (changes.money) {
      state.player.stats.money += changes.money
    }
  }

  const pushNotification = vi.fn()

  const performTransaction = (cost: { money?: number }) => {
    const deltaMoney = cost.money ?? 0

    state.player.stats.money += deltaMoney
    if (state.player.personal) {
      state.player.personal.stats.money += deltaMoney
    }
    return true
  }

  return { get, performTransaction, pushNotification, set, state }
}

describe('offers partnership flow', () => {
  it('recipient acceptOffer deducts recipient money and marks offer accepted', () => {
    const recipientPlayer = createMockPlayer() as unknown as LocalPlayer
    recipientPlayer.stats.money = 50000
    recipientPlayer.id = 'player2'

    const offerDetails: PartnershipOfferDetails = {
      businessDescription: 'Продажа товаров',
      businessId: 'biz_1',
      businessName: 'Совместный магазин',
      businessType: 'retail' as const,
      employeeRoles: [
        { description: 'Manager', priority: 'required' as const, role: 'manager' as const },
        { description: 'Accountant', priority: 'required' as const, role: 'accountant' as const },
      ],
      partnerInvestment: 5000,
      partnerShare: 50,
      totalCost: 10000,
      yourInvestment: 5000,
      yourShare: 50,
    }

    const offer: GameOffer = {
      createdTurn: 1,
      details: offerDetails,
      expiresInTurns: 10,
      fromPlayerId: 'player1',
      fromPlayerName: 'Player 1',
      id: 'test-offer-1',
      status: 'pending',
      toPlayerId: 'player2',
      toPlayerName: 'Player 2',
      type: 'business_partnership',
    }

    const { get, set } = createMockState({
      offers: [offer],
      player: recipientPlayer,
      turn: 1,
    })

    const slice = createGameOffersSlice(
      set as unknown as Parameters<typeof createGameOffersSlice>[0],
      get as unknown as Parameters<typeof createGameOffersSlice>[1],
      {} as unknown as Parameters<typeof createGameOffersSlice>[2],
    )

    slice.acceptOffer('test-offer-1')

    const s = get()

    // Check money deduction
    expect(s.player!.stats.money).toBe(45000) // 50000 - 5000

    // Check business creation
    const business = s.player!.businesses[0]
    expect(business).toBeDefined()
    expect(business.id).toBe('biz_1')
    expect(business.name).toBe('Совместный магазин')

    // Check offer status
    const acceptedOffer = s.offers.find((o: GameOffer) => o.id === 'test-offer-1')
    expect(acceptedOffer?.status).toBe('accepted')
  })
})
