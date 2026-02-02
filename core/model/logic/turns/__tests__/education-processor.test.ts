import { describe, expect, it } from 'vitest'

import type { ActiveCourse, ActiveUniversity, Skill, SkillLevel } from '@/core/types'

import { processEducation } from '../education-processor'

describe('Education Processor', () => {
  const mockSkill: Skill = {
    experience: 0,
    id: 'Programming',
    isBeingUsedAtWork: false,
    lastPracticedTurn: 0,
    level: 1 as SkillLevel,
    name: 'Programming',
    progress: 50,
  } as Skill

  const mockCourse: ActiveCourse = {
    courseName: 'Advanced Marketing',
    id: 'c1',
    remainingDuration: 1,
    skillName: 'Marketing',
    startedTurn: 1,
    title: 'Advanced Marketing',
    totalDuration: 1.5,
  } as unknown as ActiveCourse

  const _mockUni: ActiveUniversity = {
    id: 'uni-1',
    remainingDuration: 8,
    startedTurn: 1,
    title: 'CS Degree',
    totalDuration: 8,
  } as unknown as ActiveUniversity

  it('should progress active courses', () => {
    const activeCourses = [{ ...mockCourse, remainingDuration: 2 }]

    const result = processEducation(activeCourses, [], [mockSkill], 1, 2025)

    expect(result.activeCourses[0].remainingDuration).toBe(1)
    expect(result.notifications).toHaveLength(0)
  })

  it('should complete course and increase skill level', () => {
    const activeCourses = [{ ...mockCourse, remainingDuration: 1 }]

    const result = processEducation(activeCourses, [], [mockSkill], 1, 2025)

    expect(result.activeCourses).toHaveLength(0)
    expect(result.updatedSkills.find((s) => s.name === 'Marketing')?.level).toBe(2)
    expect(result.notifications.some((n) => n.title === 'Курс завершен')).toBe(true)
  })

  it('should create new skill upon course completion if not exists', () => {
    const activeCourses = [{ ...mockCourse, remainingDuration: 1, skillName: 'Design' }]

    const result = processEducation(activeCourses, [], [mockSkill], 1, 2025)

    expect(result.updatedSkills.some((s) => s.name === 'Design')).toBe(true)
    expect(result.notifications.some((n) => n.message.includes('получили навык Design'))).toBe(true)
  })

  it('should progress university studies', () => {
    const activeUni: ActiveUniversity = {
      cost: 5000,
      id: 'u1',
      intensity: 1,
      programName: 'Business Management',
      remainingDuration: 2,
      skillBonus: 20,
      skillName: 'Management',
      startedTurn: 1,
      title: 'Business Degree',
      totalDuration: 4,
    } as unknown as ActiveUniversity

    const result = processEducation([], [activeUni], [], 1, 2025)

    expect(result.activeUniversity[0].remainingDuration).toBe(1)
  })
})
