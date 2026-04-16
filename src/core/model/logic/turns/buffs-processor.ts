import { processProgress } from '@/core/lib/progress/progress-processor'
import type { TimedBuff } from '@/core/types'
import type { Notification } from '@/core/types'
import type { Stats } from '@/core/types'

export interface BuffsProcessResult {
  activeBuffs: TimedBuff[]
  moneyDelta: number
  notifications: Notification[]
  statModifiers: Partial<Stats>
}

export function processBuffs(
  buffs: TimedBuff[],
  ctx: {
    turn: number
    year: number
  },
): BuffsProcessResult {
  const notifications: Notification[] = []
  const statModifiers: Partial<Stats> = {}
  let moneyDelta = 0

  // Синхронизируем старые поля для обратной совместимости
  const syncedBuffs = buffs.map((b) => ({
    ...b,
    remainingDuration: b.remainingDuration,
    title: b.title,
    totalDuration: b.totalDuration,
  }))

  const progress = processProgress(syncedBuffs)

  // 🧹 баффы, которые закончились в этом ходу
  progress.completed.forEach((buff) => {
    notifications.push({
      id: `buff_end_${buff.id}_${String(ctx.turn)}`,
      isRead: false,
      message: buff.description,
      title: 'Эффект закончился',
      type: 'info',
    })
  })

  // 📊 применяем эффекты для активных баффов
  progress.active.forEach((buff) => {
    for (const key in buff.effects) {
      const stat = key as keyof Stats
      const value = buff.effects[stat]
      if (typeof value !== 'number' || !Number.isFinite(value)) continue

      if (stat === 'money') {
        moneyDelta += value
      } else {
        statModifiers[stat] = (statModifiers[stat] ?? 0) + value
      }
    }
  })

  return {
    activeBuffs: progress.active.map((b) => ({ ...b, duration: b.remainingDuration })),
    moneyDelta,
    notifications,
    statModifiers,
  }
}
