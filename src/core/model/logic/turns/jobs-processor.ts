import { formatGameDate } from '@/core/lib/quarter'
import type { Job, JobApplication, Skill, Notification, SkillLevel } from '@/core/types'
import type { EconomicCycle } from '@/core/types/economy.types'

interface JobsResult {
  notifications: Notification[]
  protectedSkills: string[]
  remainingApplications: JobApplication[]
  updatedJobs: Job[]
  updatedSkills: Skill[]
}

/**
 * Рассчитывает риск увольнения
 */
function calculateFiringRisk(
  job: Job,
  cycle: EconomicCycle,
  currentTurn: number,
  updatedSkills: Skill[],
): number {
  const BASE_FIRING_RISK = 0.005
  const RECESSION_FIRING_RISK_BOOST = 0.05
  const GROWTH_FIRING_RISK_DECREASE = 0.005
  const PROBATION_TURNS = 4
  const PROBATION_RISK_BOOST = 0.03
  const SENIORITY_TURNS = 12
  const SENIORITY_RISK_DECREASE = 0.02
  const SKILL_RISK_DECREASE_PER_LEVEL = 0.01
  const MAX_FIRING_RISK = 0.2
  const MIN_FIRING_RISK = 0

  let risk = BASE_FIRING_RISK // Lowered base risk

  if (cycle.phase === 'recession') risk += RECESSION_FIRING_RISK_BOOST // Lowered recession penalty
  if (cycle.phase === 'growth') risk -= GROWTH_FIRING_RISK_DECREASE

  const tenure = currentTurn - (job.startedTurn ?? currentTurn)
  if (tenure < PROBATION_TURNS) risk += PROBATION_RISK_BOOST // Lowered probation penalty
  if (tenure > SENIORITY_TURNS) risk -= SENIORITY_RISK_DECREASE

  // Skill bonus: reduce risk if player skills are higher than required
  let skillBonus = 0
  job.requirements?.skills?.forEach((req) => {
    const skill = updatedSkills.find((s) => s.id === req.name)
    if (skill && skill.level > req.level) {
      skillBonus += (skill.level - req.level) * SKILL_RISK_DECREASE_PER_LEVEL
    }
  })
  risk -= skillBonus

  return Math.min(MAX_FIRING_RISK, Math.max(MIN_FIRING_RISK, risk)) // Lowered max risk cap
}

/**
 * Обрабатывает прогресс навыка и возможное повышение зарплаты
 */
function updateSkillAndSalary(
  skill: Skill,
  reqLevel: number,
  job: Job,
  currentTurn: number,
  currentYear: number,
  notifications: Notification[],
): Skill {
  const SKILL_PROGRESS_PER_TURN = 15
  const MAX_SKILL_PROGRESS = 100
  const MAX_SKILL_LEVEL = 5
  const SALARY_INCREASE_CHANCE = 0.05
  const SALARY_INCREASE_PERCENT = 0.05

  const updatedSkill = { ...skill }
  updatedSkill.progress += SKILL_PROGRESS_PER_TURN
  updatedSkill.lastPracticedTurn = currentTurn
  updatedSkill.isBeingUsedAtWork = true

  if (updatedSkill.progress >= MAX_SKILL_PROGRESS) {
    if (updatedSkill.level < MAX_SKILL_LEVEL) {
      updatedSkill.level = (updatedSkill.level + 1) as SkillLevel
    }
    updatedSkill.progress = 0
    notifications.push({
      date: formatGameDate(currentYear, currentTurn),
      id: `skill_up_${updatedSkill.name}_${String(currentTurn)}`,
      isRead: false,
      message: `Навык ${updatedSkill.name} повышен до ${String(updatedSkill.level)}!`,
      title: 'Рост навыка',
      type: 'success',
    })
  }

  // Salary increase chance if skill is high or improved
  if (updatedSkill.level > reqLevel && Math.random() < SALARY_INCREASE_CHANCE) {
    const increase = Math.round(job.salary * SALARY_INCREASE_PERCENT)
    job.salary += increase
    notifications.push({
      date: formatGameDate(currentYear, currentTurn),
      id: `salary_inc_${job.id}_${String(currentTurn)}`,
      isRead: false,
      message: `Ваша зарплата на должности ${job.title} выросла на ${String(increase)}!`,
      title: 'Повышение зарплаты! 💰',
      type: 'success',
    })
  }

  return updatedSkill
}

/**
 * Обрабатывает заявки на работу
 */
function processJobApplications(
  pendingApplications: JobApplication[],
  updatedSkills: Skill[],
  currentTurn: number,
  currentYear: number,
  notifications: Notification[],
  remainingApplications: JobApplication[],
) {
  for (const app of pendingApplications) {
    let score = 0
    let match = true

    for (const req of app.requirements) {
      const skill = updatedSkills.find((s) => s.id === req.skillId)
      if (!skill || skill.level < req.minLevel) match = false
      else score += skill.level - req.minLevel
    }

    const MAX_JOB_CHANCE = 0.95
    const BASE_JOB_CHANCE = 0.4
    const SCORE_CHANCE_BOOST = 0.1
    const MIN_JOB_CHANCE = 0.02
    const MAX_APPLICATION_PENDING_DAYS = 1

    const chance = match
      ? Math.min(MAX_JOB_CHANCE, BASE_JOB_CHANCE + score * SCORE_CHANCE_BOOST)
      : MIN_JOB_CHANCE

    if (Math.random() < chance) {
      notifications.push({
        data: {
          company: app.company,
          jobApplicationId: app.id,
          salary: app.salary,
          title: app.jobTitle,
        },
        date: formatGameDate(currentYear, currentTurn),
        id: `job_offer_${app.id}_${String(currentTurn)}`,
        isRead: false,
        message: `Ваша заявка в компанию ${app.company} на должность ${app.jobTitle} была одобрена.`,
        title: '💼 Приглашение на работу!',
        type: 'info',
      })
    } else if (app.daysPending < MAX_APPLICATION_PENDING_DAYS) {
      // Keep application for one more turn
      remainingApplications.push({
        ...app,
        daysPending: app.daysPending + 1,
      })
    } else {
      // Finally rejected
      notifications.push({
        date: formatGameDate(currentYear, currentTurn),
        id: `job_rejected_${app.id}_${String(currentTurn)}`,
        isRead: false,
        message: `К сожалению, компания ${app.company} отклонила вашу заявку на должность ${app.jobTitle}.`,
        title: 'Отказ по вакансии',
        type: 'warning',
      })
    }
  }
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
      const risk = calculateFiringRisk(job, cycle, currentTurn, updatedSkills)

      if (Math.random() < risk) {
        isFired = true
        notifications.push({
          date: formatGameDate(currentYear, currentTurn),
          id: `fired_${job.id}_${String(currentTurn)}`,
          isRead: false,
          message: `Вы были уволены с должности ${job.title}.`,
          title: 'Вас уволили! 😱',
          type: 'warning',
        })
      }
    }

    if (!isFired) {
      updatedJobs.push(job)

      job.requirements?.skills?.forEach((req: { name: string; level: number }) => {
        protectedSkills.add(req.name)

        const idx = updatedSkills.findIndex((s) => s.name === req.name)
        if (idx !== -1) {
          updatedSkills[idx] = updateSkillAndSalary(
            updatedSkills[idx],
            req.level,
            job,
            currentTurn,
            currentYear,
            notifications,
          )
        }
      })
    }
  }

  // 2. Job Applications
  const remainingApplications: JobApplication[] = []
  processJobApplications(
    pendingApplications,
    updatedSkills,
    currentTurn,
    currentYear,
    notifications,
    remainingApplications,
  )

  // 3. Skill decay
  const finalSkills = updatedSkills.map((skill) => {
    if (protectedSkills.has(skill.name) || skill.isBeingStudied || skill.isBeingUsedAtWork) {
      return skill
    }

    const SKILL_IDLE_TURNS_THRESHOLD = 4
    const SKILL_DECAY_PER_TURN = 5

    const idleTurns = currentTurn - skill.lastPracticedTurn
    if (idleTurns > SKILL_IDLE_TURNS_THRESHOLD) {
      const decay = (idleTurns - SKILL_IDLE_TURNS_THRESHOLD) * SKILL_DECAY_PER_TURN
      skill.progress = Math.max(0, skill.progress - decay)
    }

    return skill
  })

  return {
    notifications,
    protectedSkills: [...protectedSkills],
    remainingApplications,
    updatedJobs,
    updatedSkills: finalSkills,
  }
}
