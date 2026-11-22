import { formatGameDate } from '@/core/lib/quarter'
import { processCountryEconomy } from '@/core/model/logic/economy/country-economy-processor'
import type { EconomicMetricChange } from '@/core/types'

import type { TurnStep } from './step.types'

export const economyStep: TurnStep = (ctx, state) => {
  const result = processCountryEconomy(state.country, ctx.turn)

  state.country = result.country
  state.countries = {
    ...state.countries,
    [result.country.id]: result.country,
  }
  state.globalMarketValue = result.country.cycle?.marketModifier ?? state.globalMarketValue

  if (result.event) {
    const changes: [string, EconomicMetricChange | undefined][] = [
      ['Инфляция', result.event.appliedChanges?.inflation],
      ['Ключевая ставка', result.event.appliedChanges?.keyRate],
    ]
    const changeSummary = changes
      .filter((entry): entry is [string, EconomicMetricChange] => entry[1] !== undefined)
      .map(([label, change]) => `${label}: ${change.to.toFixed(2)}%`)
      .join('\n')

    state.notifications.push({
      date: formatGameDate(ctx.year, ctx.turn),
      id: result.event.id,
      isRead: false,
      message: changeSummary
        ? `${result.event.description}\n${changeSummary}`
        : result.event.description,
      title: result.event.title,
      type: result.event.type === 'crisis' ? 'warning' : 'success',
    })
  }
}
