import { describe, expect, it, vi } from 'vitest'

import { createJobSlice } from '../activities/work/job-slice'
import type { GameStore } from '../types'

describe('job slice', () => {
  it('adds an accepted offer as quarterly salary without multiplying it again', () => {
    let player = {
      jobs: [
        {
          company: 'Existing Co',
          cost: {},
          id: 'existing-job',
          imageUrl: '',
          salary: 3000,
          title: 'Existing role',
        },
      ],
      quarterlySalary: 3000,
    }

    const state = {
      dismissNotification: vi.fn(),
      notifications: [
        {
          data: {
            applicationId: 'application-1',
            company: 'New Co',
            jobTitle: 'New role',
            requirements: [],
            salary: 9000,
          },
          id: 'offer-1',
          isRead: false,
          message: 'Offer',
          title: 'Job offer',
          type: 'job_offer',
        },
      ],
      player,
      updatePlayer: (updater: (current: typeof player) => Partial<typeof player>) => {
        player = { ...player, ...updater(player) }
      },
    } as unknown as GameStore

    const get = vi.fn(() => ({ ...state, player }))
    const set = vi.fn()
    const slice = createJobSlice(
      set as unknown as Parameters<typeof createJobSlice>[0],
      get as unknown as Parameters<typeof createJobSlice>[1],
      {} as Parameters<typeof createJobSlice>[2],
    )

    slice.acceptJobOffer('application-1')

    expect(player.jobs.map((job) => job.salary)).toEqual([3000, 9000])
    expect(player.quarterlySalary).toBe(12000)
    expect(state.dismissNotification).toHaveBeenCalledWith('offer-1')
  })
})
