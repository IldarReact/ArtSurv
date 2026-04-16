import type { PersonalLife } from '@/core/types/personal.types'

const SICK_EVENT_PROBABILITY = 0.9
const HAPPINESS_PENALTY_SICK = 5
const HEALTH_PENALTY_SICK = 10

export function applyRandomPersonalEvents(personal: PersonalLife, _turn: number): PersonalLife {
  // Simple random event logic
  if (Math.random() > SICK_EVENT_PROBABILITY) {
    // Sick
    return {
      ...personal,
      stats: {
        ...personal.stats,
        happiness: Math.max(0, personal.stats.happiness - HAPPINESS_PENALTY_SICK),
        health: Math.max(0, personal.stats.health - HEALTH_PENALTY_SICK),
      },
    }
  }

  return personal
}
