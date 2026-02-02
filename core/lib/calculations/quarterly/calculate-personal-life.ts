import type { CountryEconomy, GlobalEvent } from '@/core/types/economy.types'
import type { Asset } from '@/core/types/finance.types'
import type { PersonalLife } from '@/core/types/personal.types'

const MAX_STAT_VALUE = 100
const MIN_STAT_VALUE = 0
const DEFAULT_ENERGY = 100

const DEBT_HAPPINESS_PENALTY = 10
const DEBT_HEALTH_PENALTY = 2
const DEBT_SANITY_PENALTY = 3

const WEALTH_THRESHOLD = 100_000
const WEALTH_HAPPINESS_BONUS = 2

const UNEMPLOYMENT_THRESHOLD = 10
const UNEMPLOYMENT_HAPPINESS_PENALTY = 2
const UNEMPLOYMENT_SANITY_PENALTY = 1

const INFLATION_THRESHOLD = 10
const INFLATION_HAPPINESS_PENALTY = 2

interface Params {
  assets: Asset[]
  cash: number
  countryEconomy: CountryEconomy
  current: PersonalLife
  globalEvents: GlobalEvent[]
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export function calculatePersonalLife({ cash, countryEconomy, current }: Params): PersonalLife {
  let { happiness, health, intelligence, sanity } = current.stats

  // ====================
  // Базовый ресет энергии
  // ====================
  const energy = DEFAULT_ENERGY

  // ====================
  // Влияние финансов
  // ====================
  if (cash < 0) {
    happiness -= DEBT_HAPPINESS_PENALTY
    health -= DEBT_HEALTH_PENALTY
    sanity -= DEBT_SANITY_PENALTY
  }

  if (cash > WEALTH_THRESHOLD) {
    happiness += WEALTH_HAPPINESS_BONUS
  }

  // ====================
  // Экономика страны
  // ====================
  if (countryEconomy.unemployment > UNEMPLOYMENT_THRESHOLD) {
    happiness -= UNEMPLOYMENT_HAPPINESS_PENALTY
    sanity -= UNEMPLOYMENT_SANITY_PENALTY
  }

  if (countryEconomy.inflation > INFLATION_THRESHOLD) {
    happiness -= INFLATION_HAPPINESS_PENALTY
  }

  // ====================
  // Баффы
  // ====================
  for (const buff of current.buffs) {
    happiness += buff.effects.happiness ?? 0
    health += buff.effects.health ?? 0
    sanity += buff.effects.sanity ?? 0
    intelligence += buff.effects.intelligence ?? 0
  }

  return {
    ...current,
    stats: {
      energy: clamp(energy, MIN_STAT_VALUE, MAX_STAT_VALUE),
      happiness: clamp(happiness, MIN_STAT_VALUE, MAX_STAT_VALUE),
      health: clamp(health, MIN_STAT_VALUE, MAX_STAT_VALUE),
      intelligence: clamp(intelligence, MIN_STAT_VALUE, MAX_STAT_VALUE),
      money: current.stats.money, // Preserve money value
      sanity: clamp(sanity, MIN_STAT_VALUE, MAX_STAT_VALUE),
    },
  }
}
