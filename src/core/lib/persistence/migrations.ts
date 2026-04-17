import {
  normalizeDurationFromTurns,
  normalizeDurationMonths,
} from '@/core/lib/stats/stat-change-format'
import type { GameState } from '@/core/schemas/game.schema'

// Migration functions for each version upgrade
// Use unknown to force safe type checking during migration
type MigrationFn = (oldState: unknown) => unknown

const migrations: Record<number, MigrationFn | undefined> = {
  2: (state) => migrateV2(state),
  3: (state) => migrateV3(state),
}

function toObject(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function toArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map((entry) => toObject(entry)) : []
}

function isMonthBasedProgress(progressLike: Record<string, unknown>): boolean {
  return progressLike.durationUnit === 'months' || progressLike.durationFormat === 'months'
}

function convertProgressFromTurns(progressLike: Record<string, unknown>): Record<string, unknown> {
  const converted = { ...progressLike }
  const monthBased = isMonthBasedProgress(converted)

  const remainingDuration = Number(converted.remainingDuration ?? 0)
  const totalDuration = Number(converted.totalDuration ?? remainingDuration)

  const normalizedRemaining = monthBased
    ? normalizeDurationMonths(remainingDuration)
    : normalizeDurationFromTurns(remainingDuration)
  const normalizedTotal = monthBased
    ? normalizeDurationMonths(totalDuration)
    : normalizeDurationFromTurns(totalDuration)

  converted.remainingDuration = normalizedRemaining
  converted.totalDuration = normalizedTotal

  if ('duration' in converted) converted.duration = normalizedRemaining
  if ('turnsLeft' in converted) converted.turnsLeft = normalizedRemaining
  if ('quartersLeft' in converted) converted.quartersLeft = normalizedRemaining
  if ('totalQuarters' in converted) converted.totalQuarters = normalizedTotal
  if ('durationUnit' in converted) Reflect.deleteProperty(converted, 'durationUnit')
  if ('durationFormat' in converted) Reflect.deleteProperty(converted, 'durationFormat')

  return converted
}

function migrateV2(rawState: unknown): unknown {
  const state = toObject(rawState)
  const player = toObject(state.player)
  const personal = toObject(player.personal)

  const migratedBuffs = toArray(personal.buffs).map((buff) => convertProgressFromTurns(buff))
  const migratedPregnancy = personal.pregnancy
    ? convertProgressFromTurns(toObject(personal.pregnancy))
    : null
  const migratedCourses = toArray(personal.activeCourses).map((course) =>
    convertProgressFromTurns(course),
  )
  const migratedUniversity = toArray(personal.activeUniversity).map((uni) =>
    convertProgressFromTurns(uni),
  )

  const migratedGigs = toArray(player.activeFreelanceGigs).map((gig) =>
    convertProgressFromTurns(gig),
  )

  const migratedBusinesses = toArray(player.businesses).map((biz) => {
    const business = { ...biz }
    if (business.openingProgress) {
      business.openingProgress = convertProgressFromTurns(toObject(business.openingProgress))
    }
    return business
  })

  const migratedPendingFreelance = toArray(state.pendingFreelanceApplications).map((app) => {
    const duration = Number(app.duration ?? 0)
    const monthBased = app.durationUnit === 'months' || app.durationFormat === 'months'
    const normalizedApp = { ...app }
    if ('durationUnit' in normalizedApp) Reflect.deleteProperty(normalizedApp, 'durationUnit')
    if ('durationFormat' in normalizedApp) Reflect.deleteProperty(normalizedApp, 'durationFormat')
    return {
      ...normalizedApp,
      duration: monthBased
        ? normalizeDurationMonths(duration)
        : normalizeDurationFromTurns(duration),
    }
  })

  return {
    ...state,
    pendingFreelanceApplications: migratedPendingFreelance,
    player: state.player
      ? {
          ...player,
          activeFreelanceGigs: migratedGigs,
          businesses: migratedBusinesses,
          personal: {
            ...personal,
            activeCourses: migratedCourses,
            activeUniversity: migratedUniversity,
            buffs: migratedBuffs,
            pregnancy: migratedPregnancy,
          },
        }
      : null,
  }
}

function migrateV3(rawState: unknown): unknown {
  const state = toObject(rawState)
  const player = toObject(state.player)

  if (!state.player) {
    return state
  }

  return {
    ...state,
    player: {
      ...player,
      activeStatEffects: Array.isArray(player.activeStatEffects) ? player.activeStatEffects : [],
    },
  }
}

export function migrateState(state: unknown, fromVersion: number, toVersion: number): GameState {
  let migratedState: unknown = state

  for (let v = fromVersion + 1; v <= toVersion; v++) {
    const migrationFn = migrations[v]
    if (migrationFn) {
      migratedState = migrationFn(migratedState)
    } else {
      // console.warn(`⚠️ No migration defined for version ${String(v)}, skipping`)
    }
  }

  // console.log(`✅ Migration complete: v${String(fromVersion)} → v${String(toVersion)}`)
  return migratedState as GameState
}
