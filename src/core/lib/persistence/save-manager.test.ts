/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

import { GameStateSchema } from '@/core/schemas/game.schema'
import type { GameState } from '@/core/schemas/game.schema'

import { saveManager } from './save-manager'

// Mock the schema validation to focus on persistence logic
vi.mock('@/core/schemas/game.schema', () => ({
  GameStateSchema: {
    safeParse: vi.fn(),
  },
}))

const mockedSchema = vi.mocked(GameStateSchema)

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    clear: () => {
      store = {}
    },
    getItem: (key: string) => store[key] || null,
    removeItem: (key: string) => {
      Reflect.deleteProperty(store, key)
    },
    setItem: (key: string, value: string) => {
      store[key] = value
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('saveManager', () => {
  const mockState = {
    activeActivity: null,
    countries: {},
    endReason: null,
    gameStatus: 'playing',
    globalEvents: [],
    history: [],
    isProcessingTurn: false,
    notifications: [],
    pendingApplications: [],
    pendingFreelanceApplications: [],
    player: {
      activeFreelanceGigs: [],
      activeLifestyle: {},
      age: 25,
      assets: [],
      businesses: [],
      businessIdeas: [],
      countryId: 'US',
      currentJob: null,
      debts: [],
      freelanceGigs: [],
      gender: 'male',
      happinessMultiplier: 1,
      housingId: 'default',
      id: 'player-1',
      jobs: [],
      name: 'Test Player',
      personal: {
        activeCourses: [],
        activeUniversity: [],
        buffs: [],
        familyMembers: [],
        isDating: false,
        lifeGoals: [],
        potentialPartner: null,
        pregnancy: null,
        relations: {
          colleagues: 50,
          family: 50,
          friends: 50,
        },
        skills: [],
        stats: {
          energy: 100,
          happiness: 80,
          health: 100,
          intelligence: 100,
          money: 1000,
          sanity: 100,
        },
      },
      quarterlyReport: {
        expenses: {
          breakdown: { business: 0, debts: 0, lifestyle: 0, other: 0, taxes: 0 },
          total: 0,
        },
        income: { breakdown: { business: 0, investments: 0, other: 0, salary: 0 }, total: 0 },
        netProfit: 0,
        taxTotal: 0,
      },
      quarterlySalary: 0,
      stats: {
        energy: 100,
        happiness: 80,
        health: 100,
        intelligence: 100,
        money: 1000,
        sanity: 100,
      },
      traits: [],
    },
    turn: 1,
    year: 2024,
  } as unknown as GameState

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockedSchema.safeParse.mockReturnValue({
      data: mockState,
      success: true,
    } as unknown as ReturnType<typeof mockedSchema.safeParse>)
  })

  it('should save and load valid state', async () => {
    saveManager.save(mockState)
    const loaded = await saveManager.load()
    expect(loaded).toBeDefined()
    expect(loaded?.player?.id).toBe(mockState.player?.id)
  })

  it('should return null for non-existent save', async () => {
    const loaded = await saveManager.load()
    expect(loaded).toBeNull()
  })

  it('should return null for corrupted JSON in localStorage', async () => {
    localStorage.setItem('lifesim_save_v1', 'invalid-json{')
    const loaded = await saveManager.load()
    expect(loaded).toBeNull()
  })

  it('should reject tampered checksum', async () => {
    // Force strict mode by mocking process.env
    const oldEnv = process.env.NODE_ENV
    // Use unknown as any to bypass read-only restriction in TS
    Object.assign(process.env, { NODE_ENV: 'production' })

    try {
      saveManager.save(mockState)
      const raw = localStorage.getItem('lifesim_save_v1')
      const parsed = JSON.parse(raw!) as { data: string; checksum: string }
      parsed.data = parsed.data.replace('player-1', 'player-hacked')
      localStorage.setItem('lifesim_save_v1', JSON.stringify(parsed))

      const loaded = await saveManager.load()
      expect(loaded).toBeNull()
    } finally {
      Object.assign(process.env, { NODE_ENV: oldEnv })
    }
  })

  it('should handle state that fails Zod validation during load', async () => {
    mockedSchema.safeParse.mockReturnValue({
      error: { errors: [{ message: 'Required', path: ['player'] }] },
      success: false,
    } as unknown as ReturnType<typeof mockedSchema.safeParse>)

    // In strict mode, save() will throw if validation fails.
    // For this test, we want to simulate a corrupted save that was somehow written.
    try {
      saveManager.save(mockState)
    } catch {
      // expected if strict save
    }
    const loaded = await saveManager.load()
    expect(loaded).toBeNull()
  })

  it('should skip saving in menu/setup phases', () => {
    const menuState = { ...mockState, gameStatus: 'menu' } as GameState
    saveManager.save(menuState)
    expect(localStorage.getItem('lifesim_save_v1')).toBeNull()
  })
})
