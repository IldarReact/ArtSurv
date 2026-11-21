import { formatGameDate } from '@/core/lib/quarter'
import { processCountryEconomy } from '@/core/model/logic/economy/country-economy-processor'

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
    state.notifications.push({
      date: formatGameDate(ctx.year, ctx.turn),
      id: result.event.id,
      isRead: false,
      message: result.event.description,
      title: result.event.title,
      type: result.event.type === 'crisis' ? 'warning' : 'success',
    })
  }
}
