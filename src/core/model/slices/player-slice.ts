import type { StateCreator } from 'zustand'

import type { Player } from '@/core/types'
import type { StatChangeEffect, StatEffect } from '@/core/types/stats.types'

import type { GameStore, PlayerSlice } from './types'

export const createPlayerSlice: StateCreator<GameStore, [], [], PlayerSlice> = (set, get) => {
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
              energy: Math.min(100, Math.max(0, currentStatEffect.energy + (changes.energy ?? 0))),
              happiness: Math.min(
                100,
                Math.max(0, currentStatEffect.happiness + (changes.happiness ?? 0)),
              ),
              health: Math.min(100, Math.max(0, currentStatEffect.health + (changes.health ?? 0))),
              intelligence: Math.min(
                100,
                Math.max(0, currentStatEffect.intelligence + (changes.intelligence ?? 0)),
              ),
              money: currentStatEffect.money + (changes.money ?? changes.cash ?? 0),
              sanity: Math.min(100, Math.max(0, currentStatEffect.sanity + (changes.sanity ?? 0))),
            },
          },
          stats: {
            ...currentStats,
            energy: Math.min(100, Math.max(0, currentStats.energy + (changes.energy ?? 0))),
            money: currentStats.money + (changes.money ?? changes.cash ?? 0),
          },
        },
      }
    })
  }

  return {
    applyStatChangeEffect: (effect: StatChangeEffect) => {
      // Runtime stat mutation in this slice supports immediate changes only.
      // Temporary/persistent effects are processed in turn pipeline/state containers.
      if (effect.kind !== 'one_time') {
        return
      }

      applyOneTimeStatChanges(effect.effects)
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

      set((state) => ({
        player: state.player
          ? {
              ...state.player,
              personal: {
                ...state.player.personal,
                stats: {
                  ...state.player.personal.stats,
                  energy: Math.max(0, state.player.personal.stats.energy - amount),
                },
              },
              stats: {
                ...state.player.stats,
                energy: Math.max(0, state.player.stats.energy - amount),
              },
            }
          : null,
      }))
    },

    updatePlayer: (updater: Partial<Player> | ((prev: Player) => Partial<Player>)) => {
      set((state) => {
        const prev = state.player
        if (!prev) return state

        const patch = typeof updater === 'function' ? updater(prev) : updater

        return {
          player: {
            ...prev,
            ...patch,
            personal: {
              ...prev.personal,
              ...(patch.personal ?? {}),
              stats: {
                ...prev.personal.stats,
                ...(patch.personal?.stats ?? {}),
              },
            },
            stats: {
              ...prev.stats,
              ...(patch.personal?.stats ?? {}), // ✅ Sync: Сначала применяем статы из personal (если есть)
              ...(patch.stats ?? {}), // ✅ Sync: Затем явные статы (имеют приоритет)
            },
          },
        }
      })
    },
  }
}
