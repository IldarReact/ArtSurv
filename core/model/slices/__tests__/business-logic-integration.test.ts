import { describe, expect, it } from 'vitest'

import type { Player } from '@/core/types'
import type { EmployeeStars } from '@/core/types/business.types'
import type { StatEffect } from '@/core/types/stats.types'

import { createCoreBusinessSlice } from '../activities/work/business/core-business-slice'
import { createEmployeesSlice } from '../activities/work/business/employees-slice'
import type { GameStore } from '../types'
import type { BusinessSlice } from '../types/business.types'

describe('Business Logic Integration (Layer 4)', () => {
  const createMockStore = () => {
    let state = {
      applyStatChanges: (changes: { energy?: number }) => {
        set((s: GameStore) => {
          if (!s.player) return {}
          return {
            player: {
              ...s.player,
              personal: {
                ...s.player.personal,
                stats: {
                  ...s.player.personal.stats,
                  energy: Math.max(0, s.player.personal.stats.energy + (changes.energy ?? 0)),
                },
              },
              stats: {
                ...s.player.stats,
                energy: Math.max(0, s.player.stats.energy + (changes.energy ?? 0)),
              },
            },
          }
        })
      },
      performTransaction: (cost: StatEffect) => {
        if (cost.money && state.player!.stats.money + cost.money < 0) return false
        if (cost.money) {
          state.player!.stats.money += cost.money
          state.player!.personal.stats.money += cost.money
        }
        if (cost.energy) {
          state.player!.stats.energy += cost.energy
          state.player!.personal.stats.energy += cost.energy
        }
        return true
      },
      player: {
        businesses: [
          {
            efficiency: 50,
            employeeRoles: [],
            employees: [],
            eventsHistory: [],
            id: 'biz_1',
            inventory: {
              autoPurchaseAmount: 0,
              currentStock: 100,
              maxStock: 500,
              pricePerUnit: 50,
              purchaseCost: 20,
            },
            maxEmployees: 1, // Will test 5x expansion
            name: 'Test Biz',
            partners: [],
            playerRoles: { managerialRoles: [], operationalRole: null },
            price: 5,
            quantity: 100,
            reputation: 50,
            state: 'active',
            type: 'retail',
            walletBalance: 10000,
          },
        ],
        id: 'p1',
        personal: { stats: { energy: 100, money: 0 } },
        stats: { energy: 100, money: 0 },
      },
      pushNotification: () => {
        // Mock implementation
      },
      turn: 1,
      updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
        const patch = typeof updater === 'function' ? updater(state.player!) : updater
        state.player = { ...state.player, ...patch } as Player
      },
    } as unknown as GameStore

    const get = () => state
    const set = (patch: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => {
      const next = typeof patch === 'function' ? patch(state) : patch
      state = { ...state, ...next } as GameStore
    }

    const core = createCoreBusinessSlice(
      set as unknown as Parameters<typeof createCoreBusinessSlice>[0],
      get as unknown as Parameters<typeof createCoreBusinessSlice>[1],
      {} as unknown as Parameters<typeof createCoreBusinessSlice>[2],
    ) as BusinessSlice
    const emp = createEmployeesSlice(
      set as unknown as Parameters<typeof createEmployeesSlice>[0],
      get as unknown as Parameters<typeof createEmployeesSlice>[1],
      {} as unknown as Parameters<typeof createEmployeesSlice>[2],
    ) as BusinessSlice

    return {
      core,
      emp,
      get,
      set,
    }
  }

  it('should allow hiring more than maxEmployees due to 5x logic', () => {
    const { emp, get } = createMockStore()

    // maxEmployees is 1, but we should be able to hire up to 5
    const candidate = {
      experience: 2,
      humanTraits: [],
      id: 'cand_1',
      name: 'Alice',
      requestedSalary: 1000,
      role: 'worker' as const,
      skills: { efficiency: 50 },
      stars: 3 as EmployeeStars,
    }

    // Hire 1
    emp.hireEmployee('biz_1', candidate)
    // Hire 2
    emp.hireEmployee('biz_1', { ...candidate, id: 'cand_2' })

    const biz = get().player?.businesses[0]
    expect(biz?.employees.length).toBe(2)
  })

  it('should prevent hiring more than 5x maxEmployees', () => {
    const { emp, get } = createMockStore()

    // Hire 5
    for (let i = 1; i <= 5; i++) {
      emp.hireEmployee('biz_1', {
        experience: 2,
        humanTraits: [],
        id: `cand_${String(i)}`,
        name: `Alice ${String(i)}`,
        requestedSalary: 1000,
        role: 'worker' as const,
        skills: { efficiency: 50 },
        stars: 3,
      })
    }
    const biz5 = get().player?.businesses[0]
    expect(biz5?.employees.length).toBe(5)

    // Attempt 6th
    emp.hireEmployee('biz_1', {
      experience: 2,
      humanTraits: [],
      id: 'cand_6',
      name: 'Alice 6',
      requestedSalary: 1000,
      role: 'worker' as const,
      skills: { efficiency: 50 },
      stars: 3,
    })
    const biz6 = get().player?.businesses[0]
    expect(biz6?.employees.length).toBe(5) // Still 5
  })
})
