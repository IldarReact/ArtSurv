import { describe, expect, it } from 'vitest'

import { migrateState } from './migrations'

describe('migrations', () => {
  it('migrates v1 duration fields from turns to months', () => {
    const legacyState = {
      pendingFreelanceApplications: [{ duration: 2, id: 'app-1' }],
      player: {
        activeFreelanceGigs: [{ id: 'gig-1', remainingDuration: 1, totalDuration: 2 }],
        businesses: [
          {
            id: 'biz-1',
            openingProgress: {
              id: 'open-1',
              quartersLeft: 1,
              remainingDuration: 1,
              title: 'Opening',
              totalDuration: 2,
              totalQuarters: 2,
            },
          },
        ],
        personal: {
          activeCourses: [{ id: 'course-1', remainingDuration: 2, totalDuration: 2 }],
          activeUniversity: [{ id: 'uni-1', remainingDuration: 4, totalDuration: 4 }],
          buffs: [{ duration: 1, id: 'buff-1', remainingDuration: 1, totalDuration: 1 }],
          pregnancy: {
            id: 'preg-1',
            remainingDuration: 3,
            title: 'Беременность',
            totalDuration: 3,
            turnsLeft: 3,
          },
        },
      },
    }

    const migrated = migrateState(legacyState, 1, 2) as unknown as typeof legacyState

    expect(migrated.player.personal.buffs[0].remainingDuration).toBe(3)
    expect(migrated.player.personal.buffs[0].duration).toBe(3)
    expect(migrated.player.personal.activeCourses[0].remainingDuration).toBe(6)
    expect(migrated.player.personal.activeUniversity[0].remainingDuration).toBe(12)
    expect(migrated.player.personal.pregnancy.remainingDuration).toBe(9)
    expect(migrated.player.personal.pregnancy.turnsLeft).toBe(9)
    expect(migrated.player.activeFreelanceGigs[0].remainingDuration).toBe(3)
    expect(migrated.pendingFreelanceApplications[0].duration).toBe(6)
    expect(migrated.player.businesses[0].openingProgress.remainingDuration).toBe(3)
    expect(migrated.player.businesses[0].openingProgress.totalQuarters).toBe(6)
  })

  it('does not multiply month-based durations marked in legacy payload', () => {
    const monthBasedState = {
      pendingFreelanceApplications: [{ duration: 6, durationUnit: 'months', id: 'app-1' }],
      player: {
        activeFreelanceGigs: [
          {
            durationUnit: 'months',
            id: 'gig-1',
            remainingDuration: 6,
            totalDuration: 9,
          },
        ],
        businesses: [
          {
            id: 'biz-1',
            openingProgress: {
              durationUnit: 'months',
              id: 'open-1',
              quartersLeft: 6,
              remainingDuration: 6,
              title: 'Opening',
              totalDuration: 9,
              totalQuarters: 9,
            },
          },
        ],
        personal: {
          activeCourses: [
            {
              durationUnit: 'months',
              id: 'course-1',
              remainingDuration: 6,
              totalDuration: 9,
            },
          ],
          activeUniversity: [],
          buffs: [
            {
              duration: 6,
              durationUnit: 'months',
              id: 'buff-1',
              remainingDuration: 6,
              totalDuration: 9,
            },
          ],
          pregnancy: {
            durationUnit: 'months',
            id: 'preg-1',
            remainingDuration: 9,
            title: 'Беременность',
            totalDuration: 9,
            turnsLeft: 9,
          },
        },
      },
    }

    const migrated = migrateState(monthBasedState, 1, 2) as unknown as typeof monthBasedState

    expect(migrated.player.personal.buffs[0].remainingDuration).toBe(6)
    expect(migrated.player.personal.activeCourses[0].remainingDuration).toBe(6)
    expect(migrated.player.personal.pregnancy.remainingDuration).toBe(9)
    expect(migrated.player.activeFreelanceGigs[0].remainingDuration).toBe(6)
    expect(migrated.pendingFreelanceApplications[0].duration).toBe(6)
    expect(migrated.player.businesses[0].openingProgress.remainingDuration).toBe(6)

    expect('durationUnit' in migrated.player.personal.buffs[0]).toBe(false)
    expect('durationUnit' in migrated.pendingFreelanceApplications[0]).toBe(false)
  })

  it('migrates saved job salaries and pending job offers to quarterly amounts', () => {
    const legacyState = {
      notifications: [
        {
          data: { jobApplicationId: 'app-1', salary: 5000 },
          id: 'offer-1',
          isRead: false,
          message: 'Offer',
          title: 'Job offer',
          type: 'info',
        },
        {
          data: { salary: 100 },
          id: 'other-1',
          isRead: false,
          message: 'Other',
          title: 'Other',
          type: 'info',
        },
      ],
      pendingApplications: [{ id: 'app-1', salary: 5000 }],
      player: {
        currentJob: { salary: 6000 },
        jobs: [{ salary: 6000 }, { salary: 3000 }],
        quarterlySalary: 27000,
      },
    }

    const migrated = migrateState(legacyState, 4, 5) as unknown as typeof legacyState

    expect(migrated.player.jobs.map((job) => job.salary)).toEqual([18000, 9000])
    expect(migrated.player.currentJob.salary).toBe(18000)
    expect(migrated.player.quarterlySalary).toBe(27000)
    expect(migrated.pendingApplications[0].salary).toBe(15000)
    expect(migrated.notifications[0].data.salary).toBe(15000)
    expect(Reflect.get(migrated.notifications[0].data, 'applicationId')).toBe('app-1')
    expect('jobApplicationId' in migrated.notifications[0].data).toBe(false)
    expect(migrated.notifications[0].type).toBe('job_offer')
    expect(migrated.notifications[1].data.salary).toBe(100)
  })
})
