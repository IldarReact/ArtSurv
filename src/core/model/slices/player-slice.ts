import type { StateCreator } from 'zustand'

import type { Player } from '@/core/types'
import type { StatChangeEffect, StatEffect } from '@/core/types/stats.types'

import type { GameStore, PlayerSlice } from './types'

export const createPlayerSlice: StateCreator<GameStore, [], [], PlayerSlice> = (set, get) => {
  const clampPercentStat = (value: number) => Math.min(100, Math.max(0, value))

  const applyOneTimeStatChanges = (changes: StatEffect & { cash?: number }) => {
    const player = get().player
    if (!player) return

    set((state) => {
      if (!state.player) return { player: null }

      const currentStats = state.player.stats
      const currentStatEffect = state.player.personal.stats

      return {
        player: {
          ...state.player,
          personal: {
            ...state.player.personal,
            stats: {
              ...currentStatEffect,
              energy: clampPercentStat(currentStatEffect.energy + (changes.energy ?? 0)),
              happiness: clampPercentStat(currentStatEffect.happiness + (changes.happiness ?? 0)),
              health: clampPercentStat(currentStatEffect.health + (changes.health ?? 0)),
              intelligence: clampPercentStat(
                currentStatEffect.intelligence + (changes.intelligence ?? 0),
              ),
              money: currentStatEffect.money + (changes.money ?? changes.cash ?? 0),
              sanity: clampPercentStat(currentStatEffect.sanity + (changes.sanity ?? 0)),
            },
          },
          stats: {
            ...currentStats,
            energy: clampPercentStat(currentStats.energy + (changes.energy ?? 0)),
            happiness: clampPercentStat(currentStats.happiness + (changes.happiness ?? 0)),
            health: clampPercentStat(currentStats.health + (changes.health ?? 0)),
            intelligence: clampPercentStat(currentStats.intelligence + (changes.intelligence ?? 0)),
            money: currentStats.money + (changes.money ?? changes.cash ?? 0),
            sanity: clampPercentStat(currentStats.sanity + (changes.sanity ?? 0)),
          },
        },
      }
    })
  }

  return {
    applyStatChangeEffect: (effect: StatChangeEffect) => {
      if (effect.kind === 'one_time') {
        applyOneTimeStatChanges(effect.effects)
        return
      }

      set((state) => {
        if (!state.player) return { player: null }
        const activeStatEffects = Array.isArray(state.player.activeStatEffects)
          ? state.player.activeStatEffects
          : []

        return {
          player: {
            ...state.player,
            activeStatEffects: [...activeStatEffects, effect],
          },
        }
      })
    },

    applyStatChanges: (changes: StatEffect & { cash?: number }) => {
      get().applyStatChangeEffect({
        effects: changes,
        kind: 'one_time',
      })
    },

    performTransaction: (
      cost: StatEffect,
      options?: { requireFunds?: boolean; title?: string },
    ) => {
      const state = get()
      if (!state.player) return false

      const deltaMoney = cost.money ?? 0
      const deltaEnergy = cost.energy ?? 0
      const requireFunds = options?.requireFunds ?? true
      const title = options?.title

      // 1. Check Money (only if spending)
      if (requireFunds && deltaMoney < 0 && state.player.stats.money < Math.abs(deltaMoney)) {
        state.pushNotification({
          message: `Требуется $${Math.abs(deltaMoney).toLocaleString()}, у вас только $${state.player.stats.money.toLocaleString()}`,
          title: title ?? 'Недостаточно средств',
          type: 'error',
        })
        return false
      }

      // 2. Check Energy (only if spending)
      if (deltaEnergy < 0 && state.player.stats.energy < Math.abs(deltaEnergy)) {
        state.pushNotification({
          message: 'Вы слишком устали для этого действия',
          title: 'Недостаточно энергии',
          type: 'info',
        })
        return false
      }

      // 3. Apply Changes
      get().applyStatChangeEffect({
        effects: cost,
        kind: 'one_time',
      })
      return true
    },

    // State
    player: null,

    // Actions
    spendEnergy: (amount: number) => {
      const player = get().player
      if (!player) return

      get().applyStatChangeEffect({
        effects: { energy: -amount },
        kind: 'one_time',
      })
    },

    updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
      set((state) => {
        const prev = state.player
        if (!prev) return state

        const patch = typeof updater === 'function' ? updater(prev) : updater
        const { stats: _ignoredStats, ...patchWithoutStatsRoot } = patch
        const personalWithoutStats =
          patch.personal && 'stats' in patch.personal
            ? (() => {
                const { stats: _ignoredPersonalStats, ...restPersonal } = patch.personal
                return restPersonal
              })()
            : patch.personal

        const patchWithoutStats = {
          ...patchWithoutStatsRoot,
          personal: personalWithoutStats,
        }

        return {
          player: {
            ...prev,
            ...patchWithoutStats,
            personal: {
              ...prev.personal,
              ...(patchWithoutStats.personal ?? {}),
            },
          },
        }
      })
    },
  }
}
