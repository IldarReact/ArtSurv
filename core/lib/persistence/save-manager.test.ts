/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveManager } from './save-manager'
import { GameStateSchema } from '@/core/schemas/game.schema'

// Mock the schema validation to focus on persistence logic
vi.mock('@/core/schemas/game.schema', () => ({
  GameStateSchema: {
    safeParse: vi.fn((data) => ({ success: true, data })),
  },
}))
import CryptoJS from 'crypto-js'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('saveManager', () => {
  const mockState = {
    gameStatus: 'playing',
    player: {
      id: 'player-1',
    },
  } as any

  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.mocked(GameStateSchema.safeParse).mockReturnValue({ success: true, data: mockState } as any)
  })

  it('should save and load valid state', async () => {
    saveManager.save(mockState)
    const loaded = await saveManager.load()
    expect(loaded).toBeDefined()
    expect(loaded?.player?.id).toBe(mockState.player.id)
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
    // Use any to bypass read-only restriction in TS
    ;(process.env as any).NODE_ENV = 'production'

    try {
      saveManager.save(mockState)
      const raw = localStorage.getItem('lifesim_save_v1')
      const parsed = JSON.parse(raw!)
      parsed.data = parsed.data.replace('player-1', 'player-hacked')
      localStorage.setItem('lifesim_save_v1', JSON.stringify(parsed))

      const loaded = await saveManager.load()
      expect(loaded).toBeNull()
    } finally {
      ;(process.env as any).NODE_ENV = oldEnv
    }
  })

  it('should handle state that fails Zod validation during load', async () => {
    vi.mocked(GameStateSchema.safeParse).mockReturnValue({
      success: false,
      error: { errors: [{ path: ['player'], message: 'Required' }] },
    } as any)

    saveManager.save(mockState)
    const loaded = await saveManager.load()
    expect(loaded).toBeNull()
  })

  it('should skip saving in menu/setup phases', () => {
    const menuState = { ...mockState, gameStatus: 'menu' }
    saveManager.save(menuState)
    expect(localStorage.getItem('lifesim_save_v1')).toBeNull()
  })
})
