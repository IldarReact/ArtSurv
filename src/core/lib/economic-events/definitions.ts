import { EconomicEventDefinitionSchema } from '@/core/schemas/economy.schema'
import type { EconomicEvent, EconomicEventType } from '@/core/types'
import usEconomicEvents from '@/shared/data/world/countries/us/economic-events.json'

export const ECONOMIC_EVENT_DEFINITIONS =
  EconomicEventDefinitionSchema.array().parse(usEconomicEvents)

export function createEconomicEvent(type: EconomicEventType, turn: number): EconomicEvent {
  const definition = ECONOMIC_EVENT_DEFINITIONS.find((event) => event.type === type)

  if (!definition) {
    throw new Error(`Missing economic event definition: ${type}`)
  }

  return {
    ...definition,
    id: `event_${String(turn)}_${type}`,
    turn,
  }
}
