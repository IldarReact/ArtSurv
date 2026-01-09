import { processProgress } from '@/core/lib/progress/progress-processor'
import type { TimedBuff } from '@/core/types'
import type { Notification } from '@/core/types'
import type { Stats } from '@/core/types'

export interface BuffsProcessResult {
  activeBuffs: TimedBuff[]
  statModifiers: Partial<Stats>
  moneyDelta: number
  notifications: Notification[]
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
    totalDuration: b.totalDuration || b.duration || 1,
    remainingDuration: b.remainingDuration ?? b.duration ?? 1,
    title: b.title || b.source || 'Эффект',
  }))

  const progress = processProgress(syncedBuffs)

  // 🧹 баффы, которые закончились в этом ходу
  progress.completed.forEach((buff) => {
    notifications.push({
      id: `buff_end_${buff.id}_${ctx.turn}`,
      type: 'info',
      title: 'Эффект закончился',
      message: buff.description,
      isRead: false,
    })
  })

  // 📊 применяем эффекты для активных баффов
  progress.active.forEach((buff) => {
    // Синхронизируем обратно для совместимости
    const activeBuff = {
      ...buff,
      duration: buff.remainingDuration,
    }

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
    statModifiers,
    moneyDelta,
    notifications,
  }
}
