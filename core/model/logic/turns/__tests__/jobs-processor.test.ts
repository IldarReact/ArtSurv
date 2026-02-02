import { describe, expect, it, vi } from 'vitest'

import type { Job, JobApplication, Skill, SkillLevel } from '@/core/types'
import type { EconomicCycle } from '@/core/types/economy.types'

import { processJobs } from '../jobs-processor'

describe('Jobs Processor', () => {
  const mockSkill: Skill = {
    experience: 0,
    id: 'skill-1',
    isBeingUsedAtWork: false,
    lastPracticedTurn: 0,
    level: 1 as SkillLevel,
    name: 'Programming',
    progress: 50,
  } as Skill

  const mockJob: Job = {
    company: 'Tech Corp',
    cost: { energy: -10 },
    id: 'job-1',
    imageUrl: '',
    requirements: {
      skills: [{ level: 1, name: 'Programming' }],
    },
    salary: 3000,
    startedTurn: 0,
    title: 'Junior Developer',
    type: 'full-time',
  } as Job

  const cycle: EconomicCycle = {
    intensity: 1,
    nextPhase: 'growth',
    phase: 'recovery',
    trend: 'neutral',
  } as unknown as EconomicCycle

  it('should increase skill progress and level up', () => {
    const skills = [{ ...mockSkill, progress: 90 }] as Skill[]
    const jobs = [mockJob]

    const result = processJobs(jobs, [], skills, 1, 2025, cycle)

    expect(result.updatedSkills[0].level).toBe(2)
    expect(result.updatedSkills[0].progress).toBe(0)
    expect(result.notifications.some((n) => n.title === 'Рост навыка')).toBe(true)
  })

  it('should handle salary increase chance', () => {
    // Mock Math.random:
    // 1. Firing risk (0.9 -> no firing)
    // 2. Salary increase (0.01 -> increase)
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValueOnce(0.9).mockReturnValueOnce(0.01)

    const skills = [{ ...mockSkill, level: 3 as SkillLevel }] as Skill[] // Level higher than requirement (1)
    const jobs = [
      { ...mockJob, requirements: { skills: [{ level: 1, name: 'Programming' }] } },
    ] as Job[]

    const result = processJobs(jobs, [], skills, 1, 2025, cycle)

    expect(result.updatedJobs[0].salary).toBeGreaterThan(3000)
    expect(result.notifications.some((n) => n.title === 'Повышение зарплаты! 💰')).toBe(true)

    randomSpy.mockRestore()
  })

  it('should handle job applications', () => {
    const applications: JobApplication[] = [
      {
        company: 'New Corp',
        cost: { energy: -5 },
        daysPending: 0,
        id: 'app-1',
        jobTitle: 'Senior Dev',
        requirements: [{ minLevel: 2 as SkillLevel, skillId: 'Programming' }],
        salary: 8000,
      },
    ]
    const skills = [{ ...mockSkill, level: 3 as SkillLevel }] as Skill[] // Score boost

    // Mock Math.random to always accept application
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.01)

    const result = processJobs([], applications, skills, 1, 2025, cycle)

    expect(result.notifications.some((n) => n.title === '💼 Приглашение на работу!')).toBe(true)

    randomSpy.mockRestore()
  })

  it('should handle firing risk during recession', () => {
    // Mock Math.random to trigger firing
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.0001)

    const recessionCycle: EconomicCycle = { ...cycle, phase: 'recession' }
    const jobs = [mockJob]

    const result = processJobs(jobs, [], [mockSkill], 1, 2025, recessionCycle)

    expect(result.updatedJobs).toHaveLength(0)
    expect(result.notifications.some((n) => n.message.includes('уволены'))).toBe(true)

    randomSpy.mockRestore()
  })
})
