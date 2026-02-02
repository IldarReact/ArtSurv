/**
 * Layer 3: Process Jobs and Skill Progression
 *
 * ✅ Pure function — processes job skills and leveling
 * ✅ No dependencies on store
 * ✅ Single responsibility: handle skill progression from work
 */

import type { Skill, SkillLevel, Job, Notification } from '@/core/types'
import { LEVEL_4 } from '@/core/types/skill.types'

import { formatGameDate } from '../quarter'

export interface JobSkillProgressionResult {
  notifications: Notification[]
  protectedSkills: Set<string>
  skillUpdates: Skill[]
}

/**
 * Processes skill progression from active jobs
 * - Protects skills being used at work
 * - Increments skill progress based on job requirements
 * - Levels up skills when progress reaches 100
 *
 * @param jobs - Player's active jobs
 * @param currentSkills - Player's current skills
 * @param currentTurn - Current game turn
 * @param currentYear - Current game year
 * @returns Updated skills, notifications, and protected skills
 */
export function processJobSkillProgression(
  jobs: Job[],
  currentSkills: Skill[],
  currentTurn: number,
  currentYear: number,
): JobSkillProgressionResult {
  const updatedSkills = [...currentSkills]
  const notifications: Notification[] = []
  const protectedSkills = new Set<string>()

  jobs.forEach((job) => {
    if (job.requirements?.skills) {
      job.requirements.skills.forEach((req) => {
        const skillName = req.name
        protectedSkills.add(skillName)
        const skillIdx = updatedSkills.findIndex((s) => s.name === skillName)

        if (skillIdx !== -1) {
          const skill = { ...updatedSkills[skillIdx] }

          // Only progress below level 4
          const PROGRESS_INCREMENT = 15
          const PROGRESS_MAX = 100
          if (skill.level < LEVEL_4) {
            skill.progress += PROGRESS_INCREMENT
            skill.lastPracticedTurn = currentTurn
            skill.isBeingUsedAtWork = true

            // Level up on 100+ progress
            if (skill.progress >= PROGRESS_MAX) {
              skill.level = (skill.level + 1) as SkillLevel
              skill.progress = 0
              notifications.push({
                date: formatGameDate(currentYear, currentTurn),
                id: `work_lvl_${String(Date.now())}_${String(Math.random())}`,
                isRead: false,
                message: `Благодаря работе ваш навык ${skill.name} повысился до уровня ${String(skill.level)}!`,
                title: 'Профессиональный рост',
                type: 'success',
              })
            }

            updatedSkills[skillIdx] = skill
          }
        }
      })
    }
  })

  return {
    notifications,
    protectedSkills,
    skillUpdates: updatedSkills,
  }
}
