import { MONTHS_PER_QUARTER } from '@/core/lib/time/constants'
import type { StatChangeEffect } from '@/core/types/stats.types'

import type { TurnStep } from './step.types'

function addEffectDelta(state: Parameters<TurnStep>[1], effect: StatChangeEffect) {
  for (const key in effect.effects) {
    const stat = key as keyof typeof effect.effects
    const value = effect.effects[stat]
    if (typeof value !== 'number' || !Number.isFinite(value)) continue

    if (stat === 'money') {
      state.moneyDelta += value
      continue
    }

    state.statModifiers[stat] = (state.statModifiers[stat] ?? 0) + value
  }
}

export const statEffectsStep: TurnStep = (_ctx, state) => {
  const nextActive: StatChangeEffect[] = []
  const effectsForTurn: StatChangeEffect[] = [
    ...(state.player.activeStatEffects ?? []),
    ...state.pendingStatEffects,
  ]

  for (const effect of effectsForTurn) {
    switch (effect.kind) {
      case 'one_time':
        addEffectDelta(state, effect)
        break
      case 'temporary': {
        addEffectDelta(state, effect)
        const nextDuration = effect.durationMonths - MONTHS_PER_QUARTER
        if (nextDuration > 0) {
          nextActive.push({
            ...effect,
            durationMonths: nextDuration,
          })
        }
        break
      }
      case 'persistent':
        if (effect.isActive) {
          addEffectDelta(state, effect)
        }
        nextActive.push(effect)
        break
      default:
        break
    }
  }

  state.player.activeStatEffects = nextActive
  state.pendingStatEffects = []
}
