import type { GameState } from '@/core/schemas/game.schema'

// Migration functions for each version upgrade
// Use unknown to force safe type checking during migration
type MigrationFn = (oldState: unknown) => unknown

const migrations: Record<number, MigrationFn | undefined> = {
  // Example: v1 -> v2
  // Uncomment and modify when you need to add a new field or change structure
  /*
  2: (state) => {
    console.log('📦 Migrating save from v1 to v2')
    return {
      ...state,
      // Example: Add new field with default value
      newFeature: {
        enabled: false,
        value: 0
      },
      // Example: Rename field
      player: state.player ? {
        ...state.player,
        newFieldName: state.player.oldFieldName || 'default'
      } : null
    }
  },
  */
  // Example: v2 -> v3
  /*
  3: (state) => {
    console.log('📦 Migrating save from v2 to v3')
    return {
      ...state,
      // Add another field
      anotherNewField: []
    }
  }
  */
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
