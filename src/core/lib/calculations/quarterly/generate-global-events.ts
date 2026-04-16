import seedrandom from 'seedrandom'

import type { GlobalEvent } from '@/core/types'

const EVENT_PROBABILITY_THRESHOLD = 0.95
const MAX_ACTIVE_EVENTS = 3

const IMPACT_GDP_PANDEMIC = -2
const IMPACT_INFLATION_PANDEMIC = 1

const IMPACT_GDP_TECH_BOOM = 3

const IMPACT_GDP_CRISIS = -3
const IMPACT_MARKET_CRISIS = -5

const IMPACT_GDP_CLIMATE = -1
const IMPACT_INFLATION_CLIMATE = 2

export function generateGlobalEvents(turn: number, currentEvents: GlobalEvent[]): GlobalEvent[] {
  const rng = seedrandom(`global_events_${String(turn)}`)

  const possibleEvents: GlobalEvent[] = [
    {
      description: 'A global pandemic spreads, affecting health and economy.',
      id: 'pandemic',
      impact: { gdp: IMPACT_GDP_PANDEMIC, inflation: IMPACT_INFLATION_PANDEMIC },
      title: 'Pandemic',
    },
    {
      description: 'Rapid technological advancements boost productivity.',
      id: 'tech_boom',
      impact: { gdp: IMPACT_GDP_TECH_BOOM },
      title: 'Tech Boom',
    },
    {
      description: 'Markets crash, causing financial instability.',
      id: 'financial_crisis',
      impact: { gdp: IMPACT_GDP_CRISIS, market: IMPACT_MARKET_CRISIS },
      title: 'Financial Crisis',
    },
    {
      description: 'Significant climate changes affect agriculture.',
      id: 'climate_shift',
      impact: { gdp: IMPACT_GDP_CLIMATE, inflation: IMPACT_INFLATION_CLIMATE },
      title: 'Climate Shift',
    },
  ]

  // 5% chance to add a new event
  if (rng() > EVENT_PROBABILITY_THRESHOLD) {
    const newEvent = possibleEvents[Math.floor(rng() * possibleEvents.length)]
    if (!currentEvents.find((e) => e.id === newEvent.id)) {
      return [...currentEvents, newEvent]
    }
  }

  // Keep at most X events
  if (currentEvents.length > MAX_ACTIVE_EVENTS) {
    return currentEvents.slice(1)
  }

  return currentEvents
}
