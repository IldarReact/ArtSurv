import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { Notification } from '@/core/types'

import { createBankSlice } from '../activities/bank/bank-slice'
import { createEducationSlice } from '../activities/education/education-slice'
import { createShopSlice } from '../activities/shop/shop-slice'
import { createPlayerSlice } from '../player-slice'
import type { GameStore, LocalGameState } from '../types'

// Mock dependencies
vi.mock('@/core/lib/data-loaders/shop-loader', () => ({
  getShopItemById: (id: string) => {
    if (id === 'item_1') return { category: 'default', id: 'item_1', name: 'Test Item', price: 100 }
    if (id === 'housing_1')
      return { category: 'housing', id: 'housing_1', name: 'Test House', price: 5000 }
    return null
  },
}))

vi.mock('@/core/types/shop.types', () => ({
  getItemCost: (item: { price: number }) => item.price,
  isRecurringItem: () => false,
}))

vi.mock('@/core/lib/calculations/price-helpers', () => ({
  getInflatedHousingPrice: (price: number) => price,
  getInflatedShopPrice: (price: number) => price,
}))

type TestState = LocalGameState & {
  notifications: Notification[]
  pushNotification?: (n: Notification) => void
}

describe('Centralized Stats Logic', () => {
  let store: GameStore
  let state: TestState

  const set = (updater: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => {
    const nextState =
      typeof updater === 'function' ? updater(state as unknown as GameStore) : updater
    state = { ...state, ...nextState } as TestState
  }

  const get = () => ({ ...store, ...state }) as unknown as GameStore

  beforeEach(() => {
    state = {
      countries: { c1: { inflation: 0 } },
      notifications: [],
      player: {
        activeLifestyle: {},
        assets: [],
        countryId: 'c1',
        debts: [],
        id: 'p1',
        jobs: [], // Added jobs
        personal: {
          activeCourses: [],
          activeUniversity: [],
          stats: { energy: 100, money: 1000 },
        },
        stats: { energy: 100, money: 1000 },
      },
      pushNotification: vi.fn((n) => {
        state.notifications = [n, ...state.notifications]
      }),
    } as unknown as TestState

    const playerSlice = createPlayerSlice(
      set as unknown as Parameters<typeof createPlayerSlice>[0],
      get as unknown as Parameters<typeof createPlayerSlice>[1],
      {} as unknown as Parameters<typeof createPlayerSlice>[2],
    )
    const bankSlice = createBankSlice(
      set as unknown as Parameters<typeof createBankSlice>[0],
      get as unknown as Parameters<typeof createBankSlice>[1],
      {} as unknown as Parameters<typeof createBankSlice>[2],
    )
    const shopSlice = createShopSlice(
      set as unknown as Parameters<typeof createShopSlice>[0],
      get as unknown as Parameters<typeof createShopSlice>[1],
      {} as unknown as Parameters<typeof createShopSlice>[2],
    )
    const educationSlice = createEducationSlice(
      set as unknown as Parameters<typeof createEducationSlice>[0],
      get as unknown as Parameters<typeof createEducationSlice>[1],
      {} as unknown as Parameters<typeof createEducationSlice>[2],
    )

    const { player: _player, ...playerActions } = playerSlice as any
    void _player

    store = {
      ...playerActions,
      ...bankSlice,
      ...shopSlice,
      ...educationSlice,
      applyStatChanges: playerSlice.applyStatChanges,
      performTransaction: playerSlice.performTransaction,
      pushNotification: state.pushNotification,
    } as unknown as GameStore
  })

  it('performTransaction deducts money from both stats and personal.stats', () => {
    const success = store.performTransaction({ money: -100 })
    expect(success).toBe(true)
    expect(state.player.stats.money).toBe(900)
    expect(state.player.personal?.stats.money).toBe(900)
  })

  it('performTransaction prevents spending if insufficient funds', () => {
    const success = store.performTransaction({ money: -2000 })
    expect(success).toBe(false)
    expect(state.player.stats.money).toBe(1000) // Unchanged
    expect(state.pushNotification).toHaveBeenCalled()
  })

  it('buyItem (shop-slice) uses centralized performTransaction', () => {
    store.buyItem('item_1')
    expect(state.player.stats.money).toBe(900)
    expect(state.player.personal?.stats.money).toBe(900)
  })

  it('buyItem (housing) uses centralized performTransaction', () => {
    state.player.stats.money = 10000
    if (state.player.personal) state.player.personal.stats.money = 10000
    store.buyItem('housing_1')
    expect(state.player.stats.money).toBe(5000)
    expect(state.player.personal?.stats.money).toBe(5000)
  })

  it('bank.openDeposit uses performTransaction correctly', () => {
    store.openDeposit(100)

    // Check Money
    expect(state.player.stats.money).toBe(900)
    expect(state.player.personal?.stats.money).toBe(900)

    // Check Asset
    expect(state.player.assets!).toHaveLength(1)
    expect(state.player.assets![0].value).toBe(100)
  })

  it('bank.openDeposit fails if no money', () => {
    store.openDeposit(2000)
    expect(state.player.stats.money).toBe(1000)
    expect(state.player.assets!).toHaveLength(0)
  })

  it('education.studyCourse uses performTransaction for money but manual check for energy', () => {
    // 1. Success case
    store.studyCourse('JS Course', 100, { energy: -10 }, 'Programming', 5)

    expect(state.player.stats.money).toBe(900)
    expect(state.player.personal?.activeCourses?.length).toBe(1)

    // 2. Insufficient Energy Capacity case
    // Reduce energy capacity to 5
    state.player.stats.energy = 5
    store.studyCourse('Advanced JS', 100, { energy: -10 }, 'Programming', 5)

    expect(state.player.stats.money).toBe(900) // No new deduction
    expect(state.player.personal?.activeCourses?.length).toBe(1) // No new course
    expect(state.notifications[0]).toEqual(
      expect.objectContaining({ title: 'Недостаточно энергии' }),
    )
  })
})
