import { describe, expect, it, vi } from 'vitest'

import type { ActiveFreelanceGig, FreelanceApplication, Skill, SkillLevel } from '@/core/types'

import { processFreelance } from '../freelance-processor'

describe('freelance-processor', () => {
  const mockSkill: Skill = {
    experience: 0,
    id: 'Programming',
    isBeingUsedAtWork: false,
    lastPracticedTurn: 0,
    level: 3 as SkillLevel,
    name: 'Programming',
    progress: 0,
  } as Skill

  const mockApp: FreelanceApplication = {
    cost: { money: 10 },
    description: 'Test gig',
    duration: 3,
    gigId: 'gig-1',
    id: 'app-1',
    payment: 500,
    requirements: [{ minLevel: 1 as SkillLevel, skillId: 'Programming' }],
    title: 'Small Script',
    type: 'one-time',
  } as unknown as FreelanceApplication

  const mockGig: ActiveFreelanceGig = {
    cost: { money: 20 },
    costPerTurn: { money: 20 },
    gigId: 'gig-2',
    id: 'active-1',
    payment: 1000,
    remainingDuration: 6,
    requirements: [],
    startedTurn: 1,
    title: 'Active Project',
    totalDuration: 6,
    type: 'one-time',
  } as unknown as ActiveFreelanceGig

  it('should progress active gigs', () => {
    const result = processFreelance([], [mockGig], [mockSkill], 1, 2025)

    expect(result.updatedGigs).toHaveLength(1)
    expect(result.updatedGigs[0].remainingDuration).toBe(3)
    expect(result.finishedGigs).toHaveLength(0)
  })

  it('should complete active gigs when duration reaches zero', () => {
    const endingGig = { ...mockGig, remainingDuration: 3 }
    const result = processFreelance([], [endingGig], [mockSkill], 1, 2025)

    expect(result.updatedGigs).toHaveLength(0)
    expect(result.finishedGigs).toHaveLength(1)
    expect(result.notifications.some((n) => n.title === '✅ Заказ выполнен!')).toBe(true)
  })

  it('should handle freelance applications (success)', () => {
    // Mock Math.random to always succeed
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.01)

    const result = processFreelance([mockApp], [], [mockSkill], 1, 2025)

    expect(result.updatedGigs).toHaveLength(1)
    expect(result.updatedGigs[0].title).toBe('Small Script')
    expect(result.notifications.some((n) => n.title === '💼 Заказ одобрен!')).toBe(true)

    randomSpy.mockRestore()
  })

  it('should handle freelance applications (failure)', () => {
    // Mock Math.random to always fail
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.99)

    const result = processFreelance([mockApp], [], [mockSkill], 1, 2025)

    expect(result.updatedGigs).toHaveLength(0)
    expect(result.remainingApplications).toHaveLength(0) // It was processed

    randomSpy.mockRestore()
  })
})
