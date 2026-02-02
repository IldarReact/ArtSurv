import { generateGlobalEvents } from '@/core/lib/calculations'
import { formatGameDate } from '@/core/lib/quarter'

import { processEconomicCycle } from '../economy/cycle-processor'
import type { TurnStep } from './step.types'

export const economyStep: TurnStep = (ctx, state) => {
  const country = state.country

  // 1. Цикл экономики страны
  const res = processEconomicCycle(country.cycle, ctx.turn)

  state.country = {
    ...country,
    cycle: res.cycle,
  }

  state.globalMarketValue = res.cycle.marketModifier

  if (res.newEvent) {
    state.country.activeEvents.push(res.newEvent)

    state.notifications.push({
      date: formatGameDate(ctx.year, ctx.turn),
      id: res.newEvent.id,
      isRead: false,
      message: res.newEvent.description,
      title: res.newEvent.title,
      type: res.newEvent.type === 'crisis' ? 'warning' : 'success',
    })
  }

  // 2. Глобальные события
  const oldEventsCount = state.globalEvents.length
  state.globalEvents = generateGlobalEvents(ctx.turn, state.globalEvents)

  // Если добавилось новое событие, отправляем уведомление
  if (state.globalEvents.length > oldEventsCount) {
    const newEvent = state.globalEvents[state.globalEvents.length - 1]
    state.notifications.push({
      date: formatGameDate(ctx.year, ctx.turn),
      id: `global_${newEvent.id}_${String(ctx.turn)}`,
      isRead: false,
      message: newEvent.description,
      title: `🌍 Глобальное событие: ${newEvent.title}`,
      type: 'info',
    })
  }
}
