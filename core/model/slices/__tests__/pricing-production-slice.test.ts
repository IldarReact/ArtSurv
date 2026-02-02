import { describe, expect, it } from 'vitest'

import type { Business, Player } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'

import { createPricingProductionSlice } from '../activities/work/business/pricing-production-slice'
import type { GameStore } from '../types'
import type { LocalGameState, LocalPlayer } from '../types'

function createMockState(initial?: Partial<LocalGameState>) {
  let state = {
    offers: [],
    player: {
      businesses: [],
      id: 'p1',
      name: 'Player',
      stats: { money: 0 },
    } as unknown as LocalPlayer,
    turn: 1,
    ...initial,
  } as unknown as GameStore

  const get = () => ({
    ...state,
    performTransaction: (cost: StatEffect) => {
      if (cost.money && state.player!.stats.money + cost.money < 0) return false
      state.player!.stats.money += cost.money ?? 0
      return true
    },
    updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
      const patch = typeof updater === 'function' ? updater(state.player!) : updater
      state.player = { ...state.player, ...patch } as unknown as Player
    },
  })
  const set = (patch: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => {
    const newState = typeof patch === 'function' ? patch(state) : patch
    state = { ...state, ...newState } as GameStore
  }
  return { get, set, state: () => state }
}

describe('pricing-production-slice', () => {
  it('exports a creator function', () => {
    expect(typeof createPricingProductionSlice).toBe('function')
  })

  it('changePrice updates business.price and inventory.pricePerUnit for product business', () => {
    const { get, set, state } = createMockState({
      player: {
        businesses: [
          {
            autoPurchaseAmount: 0,
            createdAt: 0,
            creationCost: { energy: 0, money: 0 },
            currentValue: 10000,
            description: 'Test',
            efficiency: 50,
            employeeRoles: [],
            employees: [],
            eventsHistory: [],
            foundedTurn: 1,
            hasInsurance: false,
            id: 'biz_1',
            initialCost: 10000,
            insuranceCost: 0,
            inventory: {
              autoPurchaseAmount: 0,
              currentStock: 1000,
              maxStock: 1000,
              pricePerUnit: 50,
              purchaseCost: 20,
            },
            isMainBranch: true,
            isServiceBased: false,
            lastQuarterlyUpdate: 0,
            maxEmployees: 5,
            minEmployees: 1,
            monthlyExpenses: 0,
            monthlyIncome: 0,
            name: 'Shop',
            networkId: undefined,
            openingProgress: {
              investedAmount: 0,
              quartersLeft: 0,
              totalCost: 0,
              totalQuarters: 0,
              upfrontCost: 0,
            },
            partners: [],
            playerRoles: { managerialRoles: [], operationalRole: null },
            price: 5,
            proposals: [],
            quantity: 100,
            quarterlyExpenses: 0,
            quarterlyIncome: 0,
            reputation: 50,
            state: 'active',
            taxRate: 15,
            type: 'retail',
          },
        ],
        id: 'p1',
        name: 'Player',
        stats: { money: 0 },
      },
    } as unknown as LocalGameState)

    const slice = createPricingProductionSlice(
      set as unknown as Parameters<typeof createPricingProductionSlice>[0],
      get as unknown as Parameters<typeof createPricingProductionSlice>[1],
      {} as unknown as Parameters<typeof createPricingProductionSlice>[2],
    )
    slice.changePrice('biz_1', 8)

    const b = state().player!.businesses[0] as unknown as Business
    expect(b.price).toBe(8)
    const expectedPricePerUnit = Math.round(20 * (1 + (15 / 100) * (8 - 5)))
    expect(b.inventory.pricePerUnit).toBe(expectedPricePerUnit)
  })
})
