import type { Stats } from '@/core/types'

import { processBuffs } from '../turns/buffs-processor'
import type { TurnStep } from './step.types'

export const buffsStep: TurnStep = (ctx, state) => {
  const res = processBuffs(state.buffs, {
    turn: ctx.turn,
    year: ctx.year,
  })

  // ⏳ обновляем баффы
  state.buffs = res.activeBuffs

  // 💰 деньги
  state.moneyDelta += res.moneyDelta

  // 📊 модификаторы статов
  for (const key in res.statModifiers) {
    const stat = key as keyof Stats
    const value = res.statModifiers[stat]
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    state.statModifiers[stat] = (state.statModifiers[stat] ?? 0) + value
  }

  // 🔔 уведомления
  state.notifications.push(...res.notifications)
}
