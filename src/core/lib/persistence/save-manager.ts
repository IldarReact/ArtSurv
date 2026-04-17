import * as CryptoJS from 'crypto-js'
import superjson from 'superjson'

import type { GameState } from '@/core/schemas/game.schema'
import { GameStateSchema } from '@/core/schemas/game.schema'

const SAVE_KEY = 'lifesim_save_v1'
const CURRENT_VERSION = 3

// Secret key for HMAC (в продакшене должен быть в .env)
const SECRET_KEY =
  process.env.NEXT_PUBLIC_SAVE_SECRET ?? 'lifesim-default-secret-key-change-in-production'

// Strict mode: reject corrupted/modified saves
const STRICT_MODE = process.env.NODE_ENV === 'production' || process.env.VITEST === 'true'

interface SaveData {
  checksum: string
  data: string // SuperJSON string
  version: number
}

// HMAC-SHA256 checksum for anti-tampering
function calculateChecksum(data: string): string {
  return CryptoJS.HmacSHA256(data, SECRET_KEY).toString()
}

declare global {
  interface Window {
    __saveClearedFlag?: boolean
  }
}

export const saveManager = {
  clear(): void {
    if (typeof window === 'undefined') {
      // console.warn('⚠️ Cannot clear on server side')
      return
    }
    localStorage.removeItem(SAVE_KEY)
  },

  hasSave(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem(SAVE_KEY)
  },

  async load(): Promise<GameState | null> {
    if (typeof window === 'undefined') {
      // console.warn('⚠️ Cannot load on server side')
      return null
    }

    try {
      const raw = localStorage.getItem(SAVE_KEY)
      if (!raw) return null

      const saveData = JSON.parse(raw) as SaveData

      // 1. Checksum validation
      const currentChecksum = calculateChecksum(saveData.data)
      if (currentChecksum !== saveData.checksum) {
        const errorMsg = '🚨 SAVE FILE CORRUPTED OR MODIFIED (checksum mismatch)'
        // console.error(errorMsg)

        if (STRICT_MODE) {
          throw new Error(errorMsg)
        } else {
          // console.warn('⚠️ Loading anyway (dev mode)')
        }
      }

      // 2. Version check / Migration
      if (saveData.version !== CURRENT_VERSION) {
        /* console.warn(
          `⚠️ Save version mismatch: ${String(saveData.version)} vs ${String(CURRENT_VERSION)}`,
        ) */
        const { migrateState } = await import('./migrations')
        const migratedData = migrateState(
          superjson.parse(saveData.data),
          saveData.version,
          CURRENT_VERSION,
        )
        // Re-serialize after migration
        saveData.data = superjson.stringify(migratedData)
      }

      // 3. Deserialize
      const state = superjson.parse<GameState>(saveData.data)

      // 4. Schema Validation
      const validation = GameStateSchema.safeParse(state)
      if (!validation.success) {
        /* console.error('❌ Loaded state schema validation failed:')
        console.error(
          'Errors:',
          validation.error.errors.map((e) => ({
            code: e.code,
            message: e.message,
            path: e.path.join('.'),
          })),
        )
        console.warn(
          '💡 Hint: If you recently updated the game, your old save might be incompatible.',
        )
        console.warn('💡 Try clearing localStorage or starting a new game.') */

        if (STRICT_MODE) {
          throw new Error('Save file is corrupted or incompatible')
        } else {
          // console.warn('⚠️ Auto-clearing incompatible save in dev mode...')
          // Автоматически очищаем несовместимое сохранение
          this.clear()
          // Устанавливаем флаг для UI
          if (typeof window !== 'undefined') {
            window.__saveClearedFlag = true
          }
          return null
        }
      }

      return validation.data
    } catch {
      // console.error('❌ Failed to load game:', error)
      return null
    }
  },

  save(state: GameState): void {
    if (typeof window === 'undefined') {
      // console.warn('⚠️ Cannot save on server side')
      return
    }

    // Skip saving if state is empty or incomplete (during setup/menu)
    if (Object.keys(state).length === 0) {
      return
    }

    // Skip if in setup/menu phase (before game fully initialized)
    if (
      state.gameStatus === 'menu' ||
      state.gameStatus === 'setup' ||
      state.gameStatus === 'select_country' ||
      state.gameStatus === 'select_character'
    ) {
      return
    }

    // Skip if player not initialized yet
    if (!state.player) {
      return
    }

    // 1. Validate before saving (ensure we don't save broken state)
    const validation = GameStateSchema.safeParse(state)
    if (!validation.success) {
      /* console.error('❌ Save validation failed:')
      console.error(
        'Detailed errors:',
        validation.error.errors.map((e) => ({
          code: e.code,
          message: e.message,
          path: e.path.join('.'),
          received:
            'received' in e ? (e as unknown as Record<string, unknown>).received : undefined,
        })),
      ) */

      if (STRICT_MODE) {
        throw new Error('Cannot save invalid game state')
      } else {
        // console.warn('⚠️ Saving anyway in dev mode (validation disabled)')
      }
    }

    // 2. Serialize
    const serialized = superjson.stringify(state)

    // 3. Checksum
    const checksum = calculateChecksum(serialized)

    // 4. Wrap
    const saveData: SaveData = {
      checksum,
      data: serialized,
      version: CURRENT_VERSION,
    }

    // 5. Write
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
  },
}
