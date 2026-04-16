import { processInflation } from '../turns/inflation-processor'
import type { TurnStep } from './step.types'

export const inflationStep: TurnStep = (ctx, state) => {
  const res = processInflation(state.countries, state.player.countryId, ctx.turn + 1, ctx.year)

  state.countries = res.updatedCountries
  state.inflationNotification = res.inflationNotification

  if (res.notification) {
    state.notifications.push(res.notification)
  }
}
