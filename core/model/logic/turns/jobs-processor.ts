import { formatGameDate } from '@/core/lib/quarter'
import type { Job, JobApplication, Skill, Notification, SkillLevel } from '@/core/types'
import type { EconomicCycle } from '@/core/types/economy.types'

interface JobsResult {
  updatedSkills: Skill[]
  notifications: Notification[]
  remainingApplications: JobApplication[]
  protectedSkills: string[]
  updatedJobs: Job[]
}

export function processJobs(
  jobs: Job[],
  pendingApplications: JobApplication[],
  updatedSkills: Skill[],
  currentTurn: number,
  currentYear: number,
  cycle?: EconomicCycle,
): JobsResult {
  const notifications: Notification[] = []
  const protectedSkills = new Set<string>()
  const updatedJobs: Job[] = []

  // 1. Process Jobs
  for (const job of jobs) {
    let isFired = false

    if (cycle) {
      let risk = 0.005 // Lowered base risk

      if (cycle.phase === 'recession') risk += 0.05 // Lowered recession penalty
      if (cycle.phase === 'growth') risk -= 0.005

      const tenure = currentTurn - (job.startedTurn ?? currentTurn)
      if (tenure < 4) risk += 0.03 // Lowered probation penalty
      if (tenure > 12) risk -= 0.02

      // Skill bonus: reduce risk if player skills are higher than required
      let skillBonus = 0
      job.requirements?.skills?.forEach((req) => {
        const skill = updatedSkills.find((s) => s.name === req.name)
        if (skill && skill.level > req.level) {
          skillBonus += (skill.level - req.level) * 0.01
        }
      })
      risk -= skillBonus

      risk = Math.min(0.2, Math.max(0, risk)) // Lowered max risk cap

      if (Math.random() < risk) {
        isFired = true
        notifications.push({
          id: `fired_${job.id}_${currentTurn}`,
          type: 'warning',
          title: 'Вас уволили! 😱',
          message: `Вы были уволены с должности ${job.title}.`,
          date: formatGameDate(currentYear, currentTurn),
          isRead: false,
        })
      }
    }

    if (!isFired) {
      updatedJobs.push(job)

      job.requirements?.skills?.forEach((req: { name: string; level: number }) => {
        protectedSkills.add(req.name)

        const idx = updatedSkills.findIndex((s) => s.name === req.name)
        if (idx !== -1) {
          const skill = { ...updatedSkills[idx] }
          skill.progress += 15
          skill.lastPracticedTurn = currentTurn
          skill.isBeingUsedAtWork = true

          if (skill.progress >= 100) {
            if (skill.level < 5) {
              skill.level = (skill.level + 1) as SkillLevel
            }
            skill.progress = 0
            notifications.push({
              id: `skill_up_${skill.name}_${currentTurn}`,
              type: 'success',
              title: 'Рост навыка',
              message: `Навык ${skill.name} повышен до ${skill.level}!`,
              date: formatGameDate(currentYear, currentTurn),
              isRead: false,
            })
          }

          updatedSkills[idx] = skill

          // Salary increase chance if skill is high or improved
          const baseReqLevel = req.level || 0
          if (skill.level > baseReqLevel && Math.random() < 0.05) {
            const increase = Math.round(job.salary * 0.05)
            job.salary += increase
            notifications.push({
              id: `salary_up_${job.id}_${currentTurn}`,
              type: 'success',
              title: 'Повышение зарплаты! 💰',
              message: `За отличную работу на должности ${job.title} вам повысили зарплату на $${increase}.`,
              date: formatGameDate(currentYear, currentTurn),
              isRead: false,
            })
          }
        }
      })
    }
  }

  // 2. Job Applications
  const remainingApplications: JobApplication[] = []

  for (const app of pendingApplications) {
    let score = 0
    let match = true

    for (const req of app.requirements ?? []) {
      const skill = updatedSkills.find((s) => s.name === req.skillId)
      if (!skill || skill.level < req.minLevel) match = false
      else score += skill.level - req.minLevel
    }

    const chance = match ? Math.min(0.95, 0.4 + score * 0.1) : 0.02

    if (Math.random() < chance) {
      notifications.push({
        id: `job_offer_${app.id}_${currentTurn}`,
        type: 'info',
        title: '💼 Приглашение на работу!',
        message: `Ваша заявка в компанию ${app.company} на должность ${app.jobTitle} была одобрена.`,
        date: formatGameDate(currentYear, currentTurn),
        isRead: false,
        data: {
          jobApplicationId: app.id,
          company: app.company,
          title: app.jobTitle,
          salary: app.salary,
        },
      })
    } else if ((app as any).daysPending < 1) {
      // Keep application for one more turn
      remainingApplications.push({
        ...app,
        daysPending: ((app as any).daysPending || 0) + 1,
      } as any)
    } else {
      // Finally rejected
      notifications.push({
        id: `job_rejected_${app.id}_${currentTurn}`,
        type: 'warning',
        title: 'Отказ по вакансии',
        message: `К сожалению, компания ${app.company} отклонила вашу заявку на должность ${app.jobTitle}.`,
        date: formatGameDate(currentYear, currentTurn),
        isRead: false,
      })
    }
  }

  // 3. Skill decay
  updatedSkills = updatedSkills.map((skill) => {
    if (protectedSkills.has(skill.name) || skill.isBeingStudied || skill.isBeingUsedAtWork) {
      return skill
    }

    const idleTurns = currentTurn - (skill.lastPracticedTurn ?? 0)
    if (idleTurns > 4) {
      const decay = (idleTurns - 4) * 5
      skill.progress = Math.max(0, skill.progress - decay)
    }

    return skill
  })

  return {
    updatedSkills,
    notifications,
    remainingApplications,
    protectedSkills: [...protectedSkills],
    updatedJobs,
  }
}
