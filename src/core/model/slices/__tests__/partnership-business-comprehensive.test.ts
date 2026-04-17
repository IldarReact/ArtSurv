import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { StoreApi } from 'zustand'

import type { Player } from '@/core/types'
import type { Business } from '@/core/types/business.types'
import type { StatEffect } from '@/core/types/stats.types'

import { createPartnershipBusinessSlice } from '../activities/work/business/partnership-business-slice'
import type { GameStore } from '../types'

// Mock broadcastEvent
vi.mock('@/core/lib/multiplayer', () => ({
  broadcastEvent: vi.fn(),
}))

describe('Partnership Business Slice - Comprehensive Actions', () => {
  let store: GameStore
  let mockBusiness: Business

  beforeEach(() => {
    // Create a mock store with partnership slice
    const mockPlayer = {
      businesses: [],
      id: 'player_1',
      name: 'Player 1',
      personal: { stats: { money: 20000 } },
      stats: { money: 20000 },
    }

    mockBusiness = {
      createdAt: 0,
      description: 'Test business description',
      efficiency: 100,
      employees: [],
      id: 'biz_123',
      isMainBranch: false,
      isServiceBased: false,
      lastQuarterlyUpdate: 0,
      maxEmployees: 10,
      name: 'Test Business',
      networkId: undefined,
      partnerBusinessId: undefined,
      partnerId: 'player_2',
      partnerName: 'Player 2',
      partners: [
        {
          id: 'player_1',
          investedAmount: 50000,
          name: 'Player 1',
          relation: 100,
          share: 50,
          type: 'player',
        },
        {
          id: 'player_2',
          investedAmount: 50000,
          name: 'Player 2',
          relation: 50,
          share: 50,
          type: 'player',
        },
      ],
      playerInvestment: 50000,
      playerShare: 50,
      price: 100,
      proposals: [],
      quantity: 10,
      state: 'active',
      type: 'retail',
    } as Partial<Business> as Business

    // Mock store
    store = {
      approveBusinessChange: vi.fn(),
      businessProposals: [],
      closeBusiness: vi.fn((businessId: string) => {
        store.updatePlayer((prev) => ({
          businesses: prev.businesses.filter((b) => b.id !== businessId),
        }))
      }),
      // We will overwrite these with the actual slice implementation
      freezeBusiness: vi.fn((businessId: string) => {
        store.updatePlayer((prev) => ({
          businesses: prev.businesses.map((b) =>
            b.id === businessId ? { ...b, state: 'frozen' as const } : b,
          ),
        }))
      }),
      openBranch: vi.fn(),
      performTransaction: (cost: StatEffect) => {
        if (cost.money && store.player!.stats.money + cost.money < 0) return false
        if (cost.money) {
          store.player!.stats.money += cost.money
          store.player!.personal.stats.money += cost.money
        }
        if (cost.energy) {
          store.player!.stats.energy += cost.energy
          store.player!.personal.stats.energy += cost.energy
        }
        return true
      },
      player: {
        ...mockPlayer,
        businesses: [mockBusiness],
      },
      proposeBusinessChange: vi.fn(),
      pushNotification: vi.fn(),
      rejectBusinessChange: vi.fn(),
      turn: 1,
      unfreezeBusiness: vi.fn((businessId: string) => {
        store.updatePlayer((prev) => ({
          businesses: prev.businesses.map((b) =>
            b.id === businessId ? { ...b, state: 'opening' as const } : b,
          ),
        }))
      }),
      updateBusinessDirectly: vi.fn(),
      updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
        const patch = typeof updater === 'function' ? updater(store.player!) : updater
        store.player = { ...store.player, ...patch } as Player
      },
    } as unknown as GameStore

    // Create the slice with a working 'set' function
    const slice = createPartnershipBusinessSlice(
      (updater: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => {
        // Handle both function and object updates
        const newState = typeof updater === 'function' ? updater(store) : updater
        // Merge updates into store
        Object.assign(store, newState)
      },
      () => store,
      vi.fn() as unknown as StoreApi<GameStore>,
    )

    // Bind slice methods to store
    store.proposeBusinessChange = slice.proposeBusinessChange
    store.approveBusinessChange = slice.approveBusinessChange
    store.rejectBusinessChange = slice.rejectBusinessChange
    store.updateBusinessDirectly = slice.updateBusinessDirectly
  })

  describe('Price Change Proposals', () => {
    it('should create proposal for price change when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'price', { newPrice: 150 })

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('price')
      expect(store.businessProposals[0].data.newPrice).toBe(150)
    })

    it('should apply price change directly when share > 50%', () => {
      mockBusiness.playerShare = 60
      mockBusiness.partners[0].share = 60
      mockBusiness.partners[1].share = 40

      store.proposeBusinessChange('biz_123', 'price', { newPrice: 150 })

      expect(store.businessProposals).toHaveLength(0)
      expect(store.player!.businesses[0].price).toBe(150)
    })

    it('should use fallback path when canonical setter is missing', () => {
      mockBusiness.playerShare = 60
      mockBusiness.partners[0].share = 60
      mockBusiness.partners[1].share = 40

      store.proposeBusinessChange('biz_123', 'price', { newPrice: 170 })

      expect(store.player!.businesses[0].price).toBe(170)
    })

    it('should prefer canonical setter when it is available', () => {
      mockBusiness.playerShare = 60
      mockBusiness.partners[0].share = 60
      mockBusiness.partners[1].share = 40
      const changePrice = vi.fn((businessId: string, newPrice: number) => {
        store.updatePlayer((prev) => ({
          businesses: prev.businesses.map((b) =>
            b.id === businessId ? { ...b, price: newPrice } : b,
          ),
        }))
      })
      ;(store as unknown as { changePrice: typeof changePrice }).changePrice = changePrice

      store.proposeBusinessChange('biz_123', 'price', { newPrice: 180 })

      expect(changePrice).toHaveBeenCalledWith('biz_123', 180)
      expect(store.player!.businesses[0].price).toBe(180)
    })
  })

  describe('Quantity Change Proposals', () => {
    it('should create proposal for quantity change when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'quantity', { newQuantity: 20 })

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('quantity')
      expect(store.businessProposals[0].data.newQuantity).toBe(20)
    })
  })

  describe('Employee Hire Proposals', () => {
    it('should create proposal for hiring employee when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'hire_employee', {
        employeeName: 'John Doe',
        employeeRole: 'manager',
        employeeSalary: 5000,
        employeeStars: 4,
      })

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('hire_employee')
      expect(store.businessProposals[0].data.employeeName).toBe('John Doe')
    })
  })

  describe('Employee Fire Proposals', () => {
    it('should create proposal for firing employee when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'fire_employee', {
        fireEmployeeId: 'emp_123',
        fireEmployeeName: 'John Doe',
      })

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('fire_employee')
      expect(store.businessProposals[0].data.fireEmployeeId).toBe('emp_123')
    })
  })

  describe('Freeze/Unfreeze Proposals', () => {
    it('should create proposal for freezing business when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'freeze', {})

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('freeze')
    })

    it('should create proposal for unfreezing business when share is 50%', () => {
      mockBusiness.state = 'frozen'

      store.proposeBusinessChange('biz_123', 'unfreeze', {})

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('unfreeze')
    })

    it('should apply freeze directly when share > 50%', () => {
      mockBusiness.playerShare = 60
      mockBusiness.partners[0].share = 60
      mockBusiness.partners[1].share = 40

      store.proposeBusinessChange('biz_123', 'freeze', {})

      expect(store.businessProposals).toHaveLength(0)
      expect(store.player!.businesses[0].state).toBe('frozen')
    })
  })

  describe('Branch Opening Proposals', () => {
    it('should create proposal for opening branch when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'open_branch', {
        branchCost: 100000,
        branchName: 'Branch 2',
      })

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('open_branch')
      expect(store.businessProposals[0].data.branchName).toBe('Branch 2')
    })

    it('should apply branch opening directly when share > 50%', () => {
      mockBusiness.playerShare = 60
      mockBusiness.partners[0].share = 60
      mockBusiness.partners[1].share = 40

      store.proposeBusinessChange('biz_123', 'open_branch', { branchName: 'Branch 2' })

      expect(store.businessProposals).toHaveLength(0)
      expect(store.openBranch).toHaveBeenCalledWith('biz_123')
    })
  })

  describe('Close Business Proposals', () => {
    it('should create proposal for closing business when share is 50%', () => {
      store.proposeBusinessChange('biz_123', 'close_business', {})

      expect(store.businessProposals).toHaveLength(1)
      expect(store.businessProposals[0].changeType).toBe('close_business')
    })

    it('should close business after proposal approval', () => {
      store.proposeBusinessChange('biz_123', 'close_business', {})

      expect(store.businessProposals).toHaveLength(1)
      const proposalId = store.businessProposals[0].id

      store.approveBusinessChange(proposalId)

      expect(store.player!.businesses).toHaveLength(0)
      expect(store.businessProposals[0].status).toBe('approved')
    })
  })

  describe('Approval Flow', () => {
    it('should approve proposal and apply changes', () => {
      // Create a proposal first
      store.businessProposals = [
        {
          businessId: 'biz_123',
          changeType: 'price',
          createdAt: 1,
          data: { newPrice: 150 },
          id: 'proposal_1',
          initiatorId: 'player_2',
          initiatorName: 'Player 2',
          status: 'pending',
        },
      ]

      store.approveBusinessChange('proposal_1')

      expect(store.businessProposals[0].status).toBe('approved')
      expect(store.player!.businesses[0].price).toBe(150)
    })

    it('should reject proposal without applying changes', () => {
      store.businessProposals = [
        {
          businessId: 'biz_123',
          changeType: 'price',
          createdAt: 1,
          data: { newPrice: 150 },
          id: 'proposal_1',
          initiatorId: 'player_2',
          initiatorName: 'Player 2',
          status: 'pending',
        },
      ]

      store.rejectBusinessChange('proposal_1')

      expect(store.businessProposals[0].status).toBe('rejected')
      expect(store.player!.businesses[0].price).toBe(100) // Unchanged
    })
  })

  describe('Fund Collection', () => {
    it('should create proposal and on approval deduct money and increase wallet', () => {
      mockBusiness.walletBalance = 0
      store.player!.businesses = [mockBusiness]

      store.proposeBusinessChange('biz_123', 'fund_collection', { collectionAmount: 10000 })

      expect(store.businessProposals).toHaveLength(1)
      const proposalId = store.businessProposals[0].id
      store.approveBusinessChange(proposalId)

      const updatedBiz = store.player!.businesses[0]
      expect(updatedBiz.walletBalance).toBe(5000)
      expect(store.player!.stats.money).toBe(15000)
      expect(store.player!.personal.stats.money).toBe(15000)
    })

    it('should apply fund collection directly when share > 50%', () => {
      mockBusiness.playerShare = 60
      mockBusiness.partners[0].share = 60
      mockBusiness.partners[1].share = 40
      mockBusiness.walletBalance = 0
      store.player!.stats.money = 20000
      store.player!.personal.stats.money = 20000
      store.player!.businesses = [mockBusiness]

      store.proposeBusinessChange('biz_123', 'fund_collection', { collectionAmount: 10000 })

      const updatedBiz = store.player!.businesses[0]
      expect(store.businessProposals).toHaveLength(0)
      expect(updatedBiz.walletBalance).toBe(6000)
      expect(store.player!.stats.money).toBe(14000)
      expect(store.player!.personal.stats.money).toBe(14000)
    })
  })

  describe('Permission Checks', () => {
    it('should block changes when share < 50%', () => {
      mockBusiness.playerShare = 40
      mockBusiness.partners[0].share = 40
      mockBusiness.partners[1].share = 60

      store.proposeBusinessChange('biz_123', 'price', { newPrice: 150 })

      expect(store.businessProposals).toHaveLength(0)
      expect(store.pushNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Недостаточно прав',
          type: 'error',
        }),
      )
    })

    it('should block direct updates when share is 50%', () => {
      store.updateBusinessDirectly('biz_123', { price: 150 })

      expect(store.player!.businesses[0].price).toBe(100)
      expect(store.pushNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Недостаточно прав',
          type: 'error',
        }),
      )
    })
  })
})
