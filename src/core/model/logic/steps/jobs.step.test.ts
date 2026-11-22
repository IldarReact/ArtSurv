import { describe, expect, it, vi } from 'vitest'

import type { TurnState } from '../turn/turn-state'
import { jobsStep } from './jobs.step'

function createState(cycle?: TurnState['country']['cycle']): TurnState {
  return {
    country: { cycle } as TurnState['country'],
    lifeEvents: [],
    notifications: [],
    pendingApplications: [],
    pendingStatEffects: [],
    player: {
      jobs: [
        {
          company: 'Test Corp',
          cost: { energy: -5 },
          id: 'job-1',
          salary: 12_000,
          title: 'Analyst',
        },
      ],
      personal: { skills: [] },
      quarterlySalary: 12_000,
    },
    protectedSkills: new Set<string>(),
  } as unknown as TurnState
}

describe('jobsStep life events', () => {
  it('records a completed work quarter only when the job survives processing', () => {
    const state = createState()
    jobsStep({ prev: {} as never, turn: 1, year: 2024 }, state)

    expect(state.lifeEvents).toContainEqual(
      expect.objectContaining({
        amount: 12_000,
        category: 'work',
        entityName: 'Analyst',
        kind: 'work_quarter',
        turn: 1,
        year: 2024,
      }),
    )
  })

  it('records an actual dismissal instead of a work quarter', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const state = createState({
      durationLeft: 2,
      intensity: 1,
      marketModifier: 0.6,
      phase: 'recession',
    })
    jobsStep({ prev: {} as never, turn: 1, year: 2024 }, state)
    vi.restoreAllMocks()

    expect(state.lifeEvents).toContainEqual(
      expect.objectContaining({ category: 'work', kind: 'job_lost', turn: 1, year: 2024 }),
    )
    expect(state.lifeEvents.some((event) => event.kind === 'work_quarter')).toBe(false)
  })
})
