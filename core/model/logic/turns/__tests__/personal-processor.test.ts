import { describe, expect, it, vi } from 'vitest'

import type { PersonalLife, Player } from '@/core/types'

import { processPersonal } from '../personal-processor'

describe('personal-processor', () => {
  const mockPlayer = {
    age: 25,
    personal: {
      activeCourses: [],
      activeUniversity: [],
      buffs: [],
      familyMembers: [],
      isDating: false,
      lifeGoals: [],
      potentialPartner: null,
      pregnancy: null,
      relations: {
        colleagues: 50,
        family: 50,
        friends: 50,
      },
      skills: [],
      stats: {
        energy: 100,
        happiness: 100,
        health: 100,
        intelligence: 100,
        money: 1000,
        sanity: 100,
      },
    },
  } as unknown as Player

  it('should handle dating success', () => {
    // Mock Math.random to guarantee success
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1)
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(123456789)

    const playerWithDating = {
      ...mockPlayer,
      personal: { ...mockPlayer.personal, isDating: true },
    }

    const result = processPersonal(
      playerWithDating.personal as PersonalLife,
      playerWithDating.age,
      1,
      2025,
    )

    expect(result.isDating).toBe(false)
    expect(result.potentialPartner).not.toBeNull()
    expect(result.notifications.some((n) => n.title === 'Успешное свидание! 💘')).toBe(true)

    randomSpy.mockRestore()
    nowSpy.mockRestore()
  })

  it('should handle pregnancy progress', () => {
    const playerWithPregnancy = {
      ...mockPlayer,
      personal: {
        ...mockPlayer.personal,
        pregnancy: {
          id: 'preg-1',
          isTwins: false,
          motherId: 'player',
          remainingDuration: 2,
          title: 'Pregnancy',
          totalDuration: 3,
          turnsLeft: 2,
        },
      },
    }

    const result = processPersonal(
      playerWithPregnancy.personal as PersonalLife,
      playerWithPregnancy.age,
      1,
      2025,
    )

    expect(result.pregnancy?.remainingDuration).toBe(1)
    expect(result.familyMembers).toHaveLength(0)
  })

  it('should handle birth when pregnancy completes', () => {
    const playerEndingPregnancy = {
      ...mockPlayer,
      personal: {
        ...mockPlayer.personal,
        pregnancy: {
          id: 'preg-ending',
          isTwins: false,
          motherId: 'player',
          remainingDuration: 1,
          title: 'Pregnancy',
          totalDuration: 3,
          turnsLeft: 1,
        },
      },
    }

    // Mock Date.now to have consistent IDs
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(987654321)

    const result = processPersonal(
      playerEndingPregnancy.personal as PersonalLife,
      playerEndingPregnancy.age,
      1,
      2025,
    )

    expect(result.pregnancy).toBeNull()
    expect(result.familyMembers).toHaveLength(1)
    expect(result.notifications.some((n) => n.title === 'Рождение ребенка! 👶')).toBe(true)

    nowSpy.mockRestore()
  })
})
