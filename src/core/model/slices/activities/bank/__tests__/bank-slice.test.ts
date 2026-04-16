import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { StoreApi } from 'zustand'

import type { GameStore } from '@/core/model/slices/types'
import type { Player } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'

import { createBankSlice, type BankSlice } from '../bank-slice'

describe('Bank Slice', () => {
  let state: GameStore
  let store: BankSlice & GameStore

  const set = (updater: any) => {
    const patch =
      typeof (updater as unknown) === 'function'
        ? (updater as (s: GameStore) => Partial<GameStore>)(state)
        : updater
    state = { ...state, ...patch }
    store = { ...store, ...patch }
  }

  const get = () => state

  beforeEach(() => {
    state = {
      countries: {
        us: { keyRate: 5 },
      },
      performTransaction: vi.fn((cost: StatEffect) => {
        if (
          cost.money !== undefined &&
          cost.money < 0 &&
          state.player!.stats.money < Math.abs(cost.money)
        )
          return false
        if (cost.money !== undefined) {
          state.player!.stats.money += cost.money
        }
        return true
      }),
      player: {
        assets: [],
        countryId: 'us',
        debts: [],
        personal: { stats: { energy: 100, money: 1000 } },
        stats: { energy: 100, money: 1000 },
      } as unknown as Player,
      pushNotification: vi.fn(),
      turn: 1,
      updatePlayer: vi.fn((updater: any) => {
        const patch =
          typeof (updater as unknown) === 'function'
            ? (updater as (p: Player) => Partial<Player>)(state.player!)
            : updater
        state.player = { ...state.player!, ...patch }
      }),
    } as unknown as GameStore

    const bankSlice = createBankSlice(set, get, {} as StoreApi<GameStore>)
    store = { ...state, ...bankSlice } as BankSlice & GameStore
  })

  describe('openDeposit', () => {
    it('should open a deposit and subtract money', () => {
      store.openDeposit(500)

      expect(state.performTransaction).toHaveBeenCalledWith({ money: -500 }, expect.any(Object))
      expect(state.player!.assets).toHaveLength(1)
      expect(state.player!.assets[0].type).toBe('deposit')
      expect(state.player!.assets[0].currentValue).toBe(500)
      expect(state.player!.stats.money).toBe(500)
    })

    it('should not open deposit if insufficient funds', () => {
      store.openDeposit(2000)
      expect(state.player!.assets).toHaveLength(0)
    })
  })

  describe('borrow', () => {
    it('should add a new debt and add money', () => {
      store.borrow(1000)

      expect(state.performTransaction).toHaveBeenCalledWith({ money: 1000 }, expect.any(Object))
      expect(state.player!.debts).toHaveLength(1)
      expect(state.player!.debts[0].remainingAmount).toBe(1000)
      expect(state.player!.stats.money).toBe(2000)
    })

    it('should increase existing consumer credit', () => {
      store.borrow(1000)
      store.borrow(500)

      expect(state.player!.debts).toHaveLength(1)
      expect(state.player!.debts[0].remainingAmount).toBe(1500)
    })
  })

  describe('repay', () => {
    it('should reduce debt and subtract money', () => {
      store.borrow(1000)
      store.repay(400)

      expect(state.player!.debts[0].remainingAmount).toBe(600)
      expect(state.player!.stats.money).toBe(1600) // 1000 start + 1000 borrow - 400 repay
    })

    it('should remove debt when fully repaid', () => {
      store.borrow(1000)
      store.repay(1000)

      expect(state.player!.debts).toHaveLength(0)
    })
  })
})
