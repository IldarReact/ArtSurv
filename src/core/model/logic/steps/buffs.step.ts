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
  state.pendingStatEffects.push({
    effects: {
      ...res.statModifiers,
      money: res.moneyDelta,
    },
    kind: 'one_time',
  })

  // 🔔 уведомления
  state.notifications.push(...res.notifications)
}
