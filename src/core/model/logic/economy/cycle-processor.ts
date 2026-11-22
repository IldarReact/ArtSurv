import type { EconomicCycle, EconomicPhase } from '@/core/types/economy.types'

/**
 * Configuration for Economic Cycles
 */
const CYCLE_CONFIG = {
  growth: { baseModifier: 1.2, maxDuration: 16, minDuration: 8 },
  peak: { baseModifier: 1.5, maxDuration: 4, minDuration: 2 },
  recession: { baseModifier: 0.6, maxDuration: 8, minDuration: 4 },
  recovery: { baseModifier: 0.9, maxDuration: 6, minDuration: 4 },
}

/**
 * Helper to get random duration for a phase
 */
function getRandomDuration(phase: EconomicPhase): number {
  const config = CYCLE_CONFIG[phase]
  return (
    Math.floor(Math.random() * (config.maxDuration - config.minDuration + 1)) + config.minDuration
  )
}

/**
 * Helper to get next phase
 */
function getNextPhase(currentPhase: EconomicPhase): EconomicPhase {
  switch (currentPhase) {
    case 'growth':
      return 'peak'
    case 'peak':
      return 'recession'
    case 'recession':
      return 'recovery'
    case 'recovery':
      return 'growth'
  }
}

/**
 * Helper to calculate market modifier based on phase and intensity
 */
function calculateMarketModifier(phase: EconomicPhase, intensity: number): number {
  const config = CYCLE_CONFIG[phase]
  // Random fluctuation +/- 10%
  const BASE_FLUCTUATION = 0.9
  const FLUCTUATION_RANGE = 0.2
  const fluctuation = BASE_FLUCTUATION + Math.random() * FLUCTUATION_RANGE

  const INTENSITY_BOOST = 0.3
  const INTENSITY_REDUCTION = 0.2

  // Intensity makes peaks higher and recessions deeper
  let modifier = config.baseModifier
  if (phase === 'peak') modifier += intensity * INTENSITY_BOOST
  if (phase === 'recession') modifier -= intensity * INTENSITY_REDUCTION

  return Number((modifier * fluctuation).toFixed(2))
}

/**
 * Process Economic Cycle for a country
 * Should be called every turn
 */
export function processEconomicCycle(currentCycle: EconomicCycle | undefined): EconomicCycle {
  // Initialize if missing
  if (!currentCycle) {
    return {
      durationLeft: getRandomDuration('growth'),
      intensity: 0.5,
      marketModifier: 1.0,
      phase: 'growth',
    }
  }

  let { durationLeft, intensity, phase } = currentCycle

  // Decrease duration
  durationLeft -= 1

  // Check for phase change
  if (durationLeft <= 0) {
    phase = getNextPhase(phase)
    durationLeft = getRandomDuration(phase)

    const MIN_INTENSITY = 0.3
    const INTENSITY_RANGE = 0.7

    // Randomize intensity for new phase
    intensity = MIN_INTENSITY + Math.random() * INTENSITY_RANGE // 0.3 - 1.0
  }

  const marketModifier = calculateMarketModifier(phase, intensity)

  return {
    durationLeft,
    intensity,
    marketModifier,
    phase,
  }
}
