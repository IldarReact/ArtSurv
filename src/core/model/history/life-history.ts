// Persistent life-history and final scoring rules: see docs/mechanics/life-history-and-scoring.md.
import type { HistoryEntry, LifeEvent, LifeEventCategory, Player, Stats } from '@/core/types'

const STAT_SCORE_WEIGHT = 10
const CAPITAL_SCORE_WEIGHT = 15
const CATEGORY_SCORE_LIMIT = 7
const YEARLY_CATEGORY_CHANGE_LIMIT = 1.5
const CAPITAL_TARGET = 250_000
const RETURN_SCORE_BASELINE = CATEGORY_SCORE_LIMIT / 2
const PERCENT_DIVISOR = 100

const SCORED_STATS = ['happiness', 'health', 'sanity', 'intelligence'] as const
type ScoredStat = (typeof SCORED_STATS)[number]
export const MAX_LIFE_SCORE =
  SCORED_STATS.length * STAT_SCORE_WEIGHT + CAPITAL_SCORE_WEIGHT + CATEGORY_SCORE_LIMIT * 5

export interface LifeScoreBreakdown {
  capital: number
  categories: Record<LifeEventCategory, number>
  stats: Record<ScoredStat, number>
  total: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function sumFinite(values: number[]): number {
  return values.reduce((total, value) => total + (Number.isFinite(value) ? value : 0), 0)
}

export function calculateNetWorth(
  player: Pick<Player, 'assets' | 'businesses' | 'debts' | 'stats'>,
): number {
  const assetValue = sumFinite(player.assets.map((asset) => asset.currentValue))
  const debtValue = sumFinite(player.debts.map((debt) => debt.remainingAmount))
  const businessValue = sumFinite(
    player.businesses.map(
      (business) => business.currentValue * ((business.playerShare ?? 100) / PERCENT_DIVISOR),
    ),
  )
  return player.stats.money + assetValue + businessValue - debtValue
}

export function createAnnualSnapshot(
  player: Pick<Player, 'assets' | 'businesses' | 'debts'>,
  stats: Stats,
  committedMoney: number,
  turn: number,
  year: number,
): HistoryEntry {
  const assetValue = sumFinite(player.assets.map((asset) => asset.currentValue))
  const debtValue = sumFinite(player.debts.map((debt) => debt.remainingAmount))
  const businessValue = sumFinite(
    player.businesses.map(
      (business) => business.currentValue * ((business.playerShare ?? 100) / PERCENT_DIVISOR),
    ),
  )
  const investmentAssets = player.assets.filter(
    (asset) => asset.type === 'deposit' || asset.type === 'real_estate' || asset.type === 'stock',
  )

  return {
    happiness: stats.happiness,
    health: stats.health,
    intelligence: stats.intelligence,
    investmentCostBasis: sumFinite(investmentAssets.map((asset) => asset.purchasePrice)),
    investmentValue: sumFinite(investmentAssets.map((asset) => asset.currentValue)),
    money: committedMoney,
    netWorth: committedMoney + assetValue + businessValue - debtValue,
    sanity: stats.sanity,
    turn,
    year,
  }
}

function eventScore(event: LifeEvent): number {
  switch (event.kind) {
    case 'business_quarter':
      return clamp((event.gainOrLoss ?? 0) / 10_000, -1, 1)
    case 'child_born':
      return 0.75 * Math.max(1, event.amount ?? 1)
    case 'course_completed':
      return 0.75
    case 'family_member_added':
      return 0.35
    case 'family_member_removed':
      return -0.8
    case 'job_lost':
      return -1
    case 'job_quit':
      return -0.5
    case 'job_salary_increased':
      return 0.75
    case 'job_started':
      return 0.25
    case 'relationship_started':
      return 1
    case 'rest_performed': {
      const restorativeStats = ['happiness', 'health', 'intelligence', 'sanity'] as const
      return sumFinite(restorativeStats.map((stat) => event.statChanges?.[stat] ?? 0)) / 20
    }
    case 'university_completed':
      return 1.5
    case 'work_quarter':
      return 0.15
    case 'asset_purchased':
    case 'asset_sold':
    case 'partner_met':
      return 0
  }
}

function getInvestmentScore(lifeEvents: LifeEvent[], player: Player): number {
  const investmentAssets = player.assets.filter(
    (asset) => asset.type === 'deposit' || asset.type === 'real_estate' || asset.type === 'stock',
  )
  const portfolioCostBasis = sumFinite(investmentAssets.map((asset) => asset.purchasePrice))
  const portfolioValue = sumFinite(investmentAssets.map((asset) => asset.currentValue))

  const soldAssets = lifeEvents.filter((event) => event.kind === 'asset_sold')
  const costBasis = portfolioCostBasis + sumFinite(soldAssets.map((event) => event.costBasis ?? 0))
  const value = portfolioValue + sumFinite(soldAssets.map((event) => event.amount ?? 0))

  if (costBasis <= 0) return 0
  const returnPercent = ((value - costBasis) / costBasis) * PERCENT_DIVISOR
  return clamp(
    RETURN_SCORE_BASELINE + (returnPercent / PERCENT_DIVISOR) * RETURN_SCORE_BASELINE,
    0,
    CATEGORY_SCORE_LIMIT,
  )
}

export function calculateLifeScore(
  history: HistoryEntry[],
  lifeEvents: LifeEvent[],
  player: Player,
  currentTurn: number,
): LifeScoreBreakdown {
  const statValues = Object.fromEntries(
    SCORED_STATS.map((stat) => {
      const values = history
        .map((entry) => entry[stat])
        .filter((value): value is number => typeof value === 'number' && Number.isFinite(value))

      const lastSnapshotTurn = history.at(-1)?.turn
      if (lastSnapshotTurn !== currentTurn && lastSnapshotTurn !== currentTurn - 1) {
        values.push(player.stats[stat])
      }
      if (values.length === 0) values.push(player.stats[stat])

      const average = sumFinite(values) / values.length
      return [stat, clamp((average / PERCENT_DIVISOR) * STAT_SCORE_WEIGHT, 0, STAT_SCORE_WEIGHT)]
    }),
  ) as Record<ScoredStat, number>

  const yearlyCategoryDeltas = new Map<number, Record<LifeEventCategory, number>>()
  for (const event of [...lifeEvents].sort(
    (left, right) =>
      left.year - right.year || left.turn - right.turn || left.id.localeCompare(right.id),
  )) {
    const categoryDeltas = yearlyCategoryDeltas.get(event.year) ?? {
      education: 0,
      family: 0,
      investments: 0,
      rest: 0,
      work: 0,
    }
    categoryDeltas[event.category] += eventScore(event)
    yearlyCategoryDeltas.set(event.year, categoryDeltas)
  }

  const categories: Record<LifeEventCategory, number> = {
    education: 0,
    family: 0,
    investments: getInvestmentScore(lifeEvents, player),
    rest: 0,
    work: 0,
  }
  for (const [, yearlyDeltas] of [...yearlyCategoryDeltas].sort(
    ([yearA], [yearB]) => yearA - yearB,
  )) {
    for (const category of ['education', 'family', 'rest', 'work'] as const) {
      categories[category] = clamp(
        categories[category] +
          clamp(
            yearlyDeltas[category],
            -YEARLY_CATEGORY_CHANGE_LIMIT,
            YEARLY_CATEGORY_CHANGE_LIMIT,
          ),
        0,
        CATEGORY_SCORE_LIMIT,
      )
    }
  }

  const capital = clamp(
    (Math.max(0, calculateNetWorth(player)) / CAPITAL_TARGET) * CAPITAL_SCORE_WEIGHT,
    0,
    CAPITAL_SCORE_WEIGHT,
  )
  const categoryTotal = sumFinite(Object.values(categories))
  const statsTotal = sumFinite(Object.values(statValues))

  return {
    capital,
    categories,
    stats: statValues,
    total: clamp(statsTotal + capital + categoryTotal, 0, MAX_LIFE_SCORE),
  }
}
