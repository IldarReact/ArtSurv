import { describe, expect, it, vi } from 'vitest'

import type { GameStore } from '@/core/model/slices/types'
import type { Business, Player } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'

import {
  handleCloseBusiness,
  handleFreezeBusiness,
  handleUnfreezeBusiness,
} from '../lifecycle-logic'

describe('lifecycle-logic', () => {
  const createMockPlayer = (money: number, businesses: Business[] = []): Player =>
    ({
      businesses,
      countryId: 'us',
      id: 'p1',
      name: 'Player',
      personal: {
        stats: { energy: 100, health: 100, money, sanity: 100 },
      },
      stats: { energy: 100, health: 100, money, sanity: 100 },
    }) as unknown as Player

  const createMockBusiness = (id: string, state: 'active' | 'frozen' = 'active'): Business =>
    ({
      currentValue: 10000,
      employees: [{ salary: 1000 }],
      id,
      initialCost: 5000,
      inventory: { currentStock: 100 },
      name: 'Test Biz',
      openingProgress: { totalCost: 5000, totalDuration: 1, upfrontCost: 1000 },
      reputation: 50,
      state,
    }) as unknown as Business

  describe('handleCloseBusiness', () => {
    it('should remove business and give back 50% of valuation', () => {
      const biz = createMockBusiness('b1')
      const player = createMockPlayer(1000, [biz])
      const get = () =>
        ({
          performTransaction: (cost: StatEffect) => {
            if (cost.money !== undefined && player.stats.money + cost.money < 0) return false
            if (cost.money !== undefined) {
              player.stats.money += cost.money
            }
            return true
          },
          player,
          updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
            const patch = typeof updater === 'function' ? updater(player) : updater
            Object.assign(player, patch)
            set({ player: { ...player } })
          },
        }) as unknown as GameStore
      const set = vi.fn()

      handleCloseBusiness(get, set, 'b1')

      const calls = set.mock.calls
      expect(calls).toHaveLength(1)
      const patch = calls[0][0] as { player: Player }
      expect(patch.player.businesses).toHaveLength(0)
      // 1000 + (10000 * 0.5) = 6000
      expect(patch.player.stats.money).toBe(6000)
    })

    it('should block direct close when player has only 50% share', () => {
      const biz = {
        ...createMockBusiness('b1'),
        partners: [
          { id: 'p1', name: 'Player', share: 50, type: 'player' },
          { id: 'p2', name: 'Partner', share: 50, type: 'player' },
        ],
      } as unknown as Business

      const player = createMockPlayer(1000, [biz])
      const pushNotification = vi.fn()
      const get = () =>
        ({
          performTransaction: (cost: StatEffect) => {
            if (cost.money !== undefined && player.stats.money + cost.money < 0) return false
            if (cost.money !== undefined) {
              player.stats.money += cost.money
            }
            return true
          },
          player,
          pushNotification,
          updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
            const patch = typeof updater === 'function' ? updater(player) : updater
            Object.assign(player, patch)
            set({ player: { ...player } })
          },
        }) as unknown as GameStore
      const set = vi.fn()

      handleCloseBusiness(get, set, 'b1')

      expect(set).not.toHaveBeenCalled()
      expect(pushNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
    })
  })

  describe('handleFreezeBusiness', () => {
    it('should freeze business, fire employees and pay compensation', () => {
      const biz = createMockBusiness('b1')
      const player = createMockPlayer(2000, [biz])
      const get = () =>
        ({
          performTransaction: (cost: StatEffect) => {
            if (cost.money !== undefined && player.stats.money + cost.money < 0) return false
            if (cost.money !== undefined) {
              player.stats.money += cost.money
            }
            return true
          },
          player,
          updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
            const patch = typeof updater === 'function' ? updater(player) : updater
            Object.assign(player, patch)
            set({ player: { ...player } })
          },
        }) as unknown as GameStore
      const set = vi.fn()

      handleFreezeBusiness(get, set, 'b1')

      const patch = set.mock.calls[0][0] as { player: Player }
      const updatedBiz = patch.player.businesses[0]
      expect(updatedBiz.state).toBe('frozen')
      expect(updatedBiz.employees).toHaveLength(0)
      // 2000 - 1000 (compensation) = 1000
      expect(patch.player.stats.money).toBe(1000)
      expect(updatedBiz.reputation).toBeLessThan(50)
    })
  })

  describe('handleUnfreezeBusiness', () => {
    it('should start opening process if player has enough money', () => {
      const biz = createMockBusiness('b1', 'frozen')
      const player = createMockPlayer(10000, [biz])
      const get = () =>
        ({
          performTransaction: (cost: StatEffect) => {
            if (cost.money !== undefined && player.stats.money + cost.money < 0) return false
            if (cost.money !== undefined) {
              player.stats.money += cost.money
            }
            return true
          },
          player,
          updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
            const patch = typeof updater === 'function' ? updater(player) : updater
            Object.assign(player, patch)
            set({ player: { ...player } })
          },
        }) as unknown as GameStore
      const set = vi.fn()

      handleUnfreezeBusiness(get, set, 'b1')

      const patch = set.mock.calls[0][0] as { player: Player }
      const updatedBiz = patch.player.businesses[0]
      expect(updatedBiz.state).toBe('opening')
      expect(updatedBiz.openingProgress?.remainingDuration).toBe(1)
    })

    it('should fail if player has not enough money', () => {
      const biz = createMockBusiness('b1', 'frozen')
      const player = createMockPlayer(100, [biz])
      const pushNotification = vi.fn()
      const get = () =>
        ({
          performTransaction: (cost: StatEffect) => {
            if (cost.money !== undefined && player.stats.money + cost.money < 0) return false
            if (cost.money !== undefined) {
              player.stats.money += cost.money
            }
            return true
          },
          player,
          pushNotification,
          updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
            const patch = typeof updater === 'function' ? updater(player) : updater
            Object.assign(player, patch)
            set({ player: { ...player } })
          },
        }) as unknown as GameStore
      const set = vi.fn()

      handleUnfreezeBusiness(get, set, 'b1')

      expect(set).not.toHaveBeenCalled()
      expect(pushNotification).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
    })
  })
})
