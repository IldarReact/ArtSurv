import { processProgress } from '@/core/lib/progress/progress-processor'
import { formatGameDate } from '@/core/lib/quarter'
import type {
  Notification,
  Skill,
  SkillLevel,
  ActiveCourse,
  ActiveUniversity,
  Progressable,
} from '@/core/types'

interface EducationResult {
  activeCourses: ActiveCourse[]
  activeUniversity: ActiveUniversity[]
  notifications: Notification[]
  protectedSkills: string[]
  updatedSkills: Skill[]
}

const MAX_SKILL_LEVEL = 5

/**
 * Generic handler for education progress (courses or university)
 */
function handleEducationProgress<
  T extends Progressable & { skillName: string; courseName?: string; programName?: string },
>(
  items: T[],
  updatedSkills: Skill[],
  currentTurn: number,
  currentYear: number,
  type: 'course' | 'uni',
): { active: T[]; notifications: Notification[] } {
  const notifications: Notification[] = []
  const progress = processProgress(items)

  progress.completed.forEach((item) => {
    const levelsGained = Math.ceil(item.totalDuration)
    const skillIdx = updatedSkills.findIndex((s) => s.name === item.skillName)
    const itemName = item.courseName ?? item.programName ?? item.title
    const isUni = type === 'uni'
    const successTitle = isUni ? 'Диплом получен' : 'Курс завершен'
    const successMsg = isUni
      ? `Поздравляем! Вы завершили обучение по программе "${itemName}"`
      : `Вы завершили курс "${itemName}"`

    if (skillIdx === -1) {
      const newLevel = Math.min(MAX_SKILL_LEVEL, levelsGained) as SkillLevel
      updatedSkills.push({
        id: `skill_${String(Date.now())}_${String(Math.random())}`,
        isBeingStudied: false,
        lastPracticedTurn: currentTurn,
        level: newLevel,
        name: item.skillName,
        progress: 0,
      })
      notifications.push({
        date: formatGameDate(currentYear, currentTurn),
        id: `${type}_end_${String(Date.now())}_${String(Math.random())}`,
        isRead: false,
        message: `${successMsg} и получили навык ${item.skillName} (${String(newLevel)} зв.)!`,
        title: successTitle,
        type: 'success',
      })
    } else {
      const skill = { ...updatedSkills[skillIdx] }
      skill.level = Math.min(MAX_SKILL_LEVEL, skill.level + levelsGained) as SkillLevel
      skill.progress = 0
      skill.lastPracticedTurn = currentTurn
      updatedSkills[skillIdx] = skill
      notifications.push({
        date: formatGameDate(currentYear, currentTurn),
        id: `${type}_end_${String(Date.now())}_${String(Math.random())}`,
        isRead: false,
        message: `${successMsg}. Навык ${skill.name} повышен до ${String(skill.level)} зв.!`,
        title: successTitle,
        type: 'success',
      })
    }
  })

  return { active: progress.active, notifications }
}

/**
 * Process active courses and university studies for the turn.
 */
export function processEducation(
  activeCourses: ActiveCourse[],
  activeUniversity: ActiveUniversity[],
  playerSkills: Skill[],
  currentTurn: number,
  currentYear: number,
): EducationResult {
  const updatedSkills = [...playerSkills]
  const protectedSkills = new Set<string>()

  const courseRes = handleEducationProgress(
    activeCourses,
    updatedSkills,
    currentTurn,
    currentYear,
    'course',
  )
  const uniRes = handleEducationProgress(
    activeUniversity,
    updatedSkills,
    currentTurn,
    currentYear,
    'uni',
  )

  // Protect skills being studied
  courseRes.active.forEach((c) => protectedSkills.add(c.skillName))
  uniRes.active.forEach((u) => protectedSkills.add(u.skillName))

  return {
    activeCourses: courseRes.active,
    activeUniversity: uniRes.active,
    notifications: [...courseRes.notifications, ...uniRes.notifications],
    protectedSkills: Array.from(protectedSkills),
    updatedSkills,
  }
}
