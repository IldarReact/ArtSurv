import { describe, it, expect, vi } from 'vitest'

import type { Player } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'

import { createCoreBusinessSlice } from '../activities/work/business/core-business-slice'
import { createEmployeesSlice } from '../activities/work/business/employees-slice'
import type { LocalGameState } from '../types'
import type { BusinessSlice } from '../types/business.types'

describe('employees-slice', () => {
  it('exports a creator function', () => {
    expect(typeof createEmployeesSlice).toBe('function')
  })

  it('hireEmployee spends from business wallet, not player money', () => {
    let state: LocalGameState = {
      applyStatChanges: () => {
        /* mock */
      },
      performTransaction: (cost: StatEffect) => {
        if (cost.money !== undefined && state.player.stats.money + cost.money < 0) return false
        if (cost.money !== undefined) {
          state.player.stats.money += cost.money
          if (state.player.personal?.stats) {
            state.player.personal.stats.money += cost.money
          }
        }
        if (cost.energy !== undefined) {
          if (state.player.stats.energy !== undefined) {
            state.player.stats.energy += cost.energy
          }
          if (state.player.personal?.stats) {
            state.player.personal.stats.energy += cost.energy
          }
        }
        return true
      },
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
            walletBalance: 2000,
          },
        ],
        id: 'p1',
        name: 'Player',
        personal: { stats: { energy: 100, money: 5000 } },
        stats: { energy: 100, money: 5000 },
      },
      pushNotification: () => {
        /* mock */
      },
      updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
        const patch = typeof updater === 'function' ? updater(state.player as Player) : updater
        state.player = { ...state.player, ...patch } as Player
      },
    } as unknown as LocalGameState

    const get = () => state
    const set = (
      patch: Partial<LocalGameState> | ((s: LocalGameState) => Partial<LocalGameState>),
    ) => {
      const next = typeof patch === 'function' ? patch(state) : patch
      state = { ...state, ...next } as LocalGameState
    }

    const coreSlice = createCoreBusinessSlice(
      set as unknown as Parameters<typeof createCoreBusinessSlice>[0],
      get as unknown as Parameters<typeof createCoreBusinessSlice>[1],
      {} as unknown as Parameters<typeof createCoreBusinessSlice>[2],
    ) as BusinessSlice
    const empSlice = createEmployeesSlice(
      set as unknown as Parameters<typeof createEmployeesSlice>[0],
      get as unknown as Parameters<typeof createEmployeesSlice>[1],
      {} as unknown as Parameters<typeof createEmployeesSlice>[2],
    ) as BusinessSlice

    // Deposit to wallet
    coreSlice.depositToBusinessWallet('biz_1', 1000)
    const beforeHireBiz = get().player.businesses[0]
    expect(beforeHireBiz.walletBalance).toBe(3000)

    // Hire with salary 1500
    empSlice.hireEmployee('biz_1', {
      experience: 2,
      humanTraits: [],
      id: 'cand_1',
      name: 'Alice',
      requestedSalary: 1500,
      role: 'worker' as const,
      skills: { efficiency: 50 },
      stars: 3,
    })

    const afterHireBiz = get().player.businesses[0]
    expect(afterHireBiz.employees?.length).toBe(1)
    expect(afterHireBiz.walletBalance).toBe(3000)
    // Player money unchanged by hire
    expect(get().player.stats.money).toBe(4000)
    expect(get().player.personal?.stats.money).toBe(4000)
  })

  it('addEmployeeToBusiness blocks new hire when employee limit is reached', () => {
    const pushNotification = vi.fn()
    let state: LocalGameState = {
      applyStatChanges: () => {
        /* mock */
      },
      performTransaction: () => true,
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
            employees: [
              {
                experience: 2,
                id: 'emp_1',
                name: 'Existing 1',
                productivity: 100,
                role: 'worker',
                salary: 1000,
                stars: 2,
              },
              {
                experience: 2,
                id: 'emp_2',
                name: 'Existing 2',
                productivity: 100,
                role: 'worker',
                salary: 1000,
                stars: 2,
              },
              {
                experience: 2,
                id: 'emp_3',
                name: 'Existing 3',
                productivity: 100,
                role: 'worker',
                salary: 1000,
                stars: 2,
              },
              {
                experience: 2,
                id: 'emp_4',
                name: 'Existing 4',
                productivity: 100,
                role: 'worker',
                salary: 1000,
                stars: 2,
              },
              {
                experience: 2,
                id: 'emp_5',
                name: 'Existing 5',
                productivity: 100,
                role: 'worker',
                salary: 1000,
                stars: 2,
              },
            ],
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
            maxEmployees: 1,
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
            walletBalance: 5000,
          },
        ],
        id: 'p1',
        name: 'Player',
        personal: { stats: { energy: 100, money: 5000 } },
        stats: { energy: 100, money: 5000 },
      },
      pushNotification,
      updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
        const patch = typeof updater === 'function' ? updater(state.player as Player) : updater
        state.player = { ...state.player, ...patch } as Player
      },
    } as unknown as LocalGameState

    const get = () => state
    const set = (
      patch: Partial<LocalGameState> | ((s: LocalGameState) => Partial<LocalGameState>),
    ) => {
      const next = typeof patch === 'function' ? patch(state) : patch
      state = { ...state, ...next } as LocalGameState
    }

    const empSlice = createEmployeesSlice(
      set as unknown as Parameters<typeof createEmployeesSlice>[0],
      get as unknown as Parameters<typeof createEmployeesSlice>[1],
      {} as unknown as Parameters<typeof createEmployeesSlice>[2],
    ) as BusinessSlice

    empSlice.addEmployeeToBusiness('biz_1', 'Second Employee', 'worker', 1200)

    const business = get().player.businesses[0]
    expect(business.employees).toHaveLength(5)
    expect(pushNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ошибка найма',
        type: 'error',
      }),
    )
  })

  it('fireEmployee reports error when target employee does not exist', () => {
    const pushNotification = vi.fn()
    let state: LocalGameState = {
      applyStatChanges: () => {
        /* mock */
      },
      performTransaction: () => true,
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
            walletBalance: 5000,
          },
        ],
        id: 'p1',
        name: 'Player',
        personal: { stats: { energy: 100, money: 5000 } },
        stats: { energy: 100, money: 5000 },
      },
      pushNotification,
      updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
        const patch = typeof updater === 'function' ? updater(state.player as Player) : updater
        state.player = { ...state.player, ...patch } as Player
      },
    } as unknown as LocalGameState

    const get = () => state
    const set = (
      patch: Partial<LocalGameState> | ((s: LocalGameState) => Partial<LocalGameState>),
    ) => {
      const next = typeof patch === 'function' ? patch(state) : patch
      state = { ...state, ...next } as LocalGameState
    }

    const empSlice = createEmployeesSlice(
      set as unknown as Parameters<typeof createEmployeesSlice>[0],
      get as unknown as Parameters<typeof createEmployeesSlice>[1],
      {} as unknown as Parameters<typeof createEmployeesSlice>[2],
    ) as BusinessSlice

    empSlice.fireEmployee('biz_1', 'missing-id')

    expect(pushNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Ошибка увольнения',
        type: 'error',
      }),
    )
  })
})
