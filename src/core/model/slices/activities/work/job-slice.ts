import type { StateCreator } from 'zustand'

import type { Job, JobApplication } from '@/core/types'
import type { SkillRequirement } from '@/core/types/skill.types'
import type { StatEffect } from '@/core/types/stats.types'

import type { GameStore, JobSlice } from '../../types'

interface JobApplicationNotificationData {
  applicationId: string
  company: string
  cost?: StatEffect
  jobTitle: string
  requirements: SkillRequirement[]
  salary: number
}

export const createJobSlice: StateCreator<GameStore, [], [], JobSlice> = (set, get) => ({
  acceptExternalJob: (jobTitle: string, company: string, salary: number, _businessId: string) => {
    const state = get()
    if (!state.player) return

    void _businessId

    // Зарплата в оффере указана за квартал, а в Job хранится за месяц
    const MONTHS_IN_QUARTER = 3
    const monthlySalary = Math.round(salary / MONTHS_IN_QUARTER)

    const newJob: Job = {
      company: company,
      cost: { energy: -20 },
      description: `Работа в ${company} (онлайн)`,
      id: `job_ext_${String(Date.now())}`,
      imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop',
      requirements: {},
      salary: monthlySalary,
      title: jobTitle,
    }

    state.updatePlayer((prev) => ({
      jobs: [...prev.jobs, newJob],
      quarterlySalary: prev.quarterlySalary + salary,
    }))

    state.pushNotification({
      message: `Вы устроились на должность ${jobTitle} в ${company}.`,
      title: 'Вы приняты на работу!',
      type: 'success',
    })
  },

  acceptJobOffer: (applicationId: string) => {
    const state = get()
    const notification = state.notifications.find(
      (n) =>
        typeof n.data === 'object' &&
        n.data !== null &&
        'applicationId' in n.data &&
        n.data.applicationId === applicationId,
    )

    if (!notification || !state.player) return

    const appData = notification.data as JobApplicationNotificationData

    const newJob: Job = {
      company: appData.company,
      cost: appData.cost ?? {},
      description: 'Новая работа',
      id: `job_${String(Date.now())}`,
      imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop',
      requirements: {
        skills: appData.requirements.map((r) => ({
          level: r.minLevel,
          name: r.skillId,
        })),
      },
      salary: appData.salary,
      title: appData.jobTitle,
    }

    const MONTHS_IN_QUARTER = 3
    state.updatePlayer((prev) => ({
      jobs: [...prev.jobs, newJob],
      quarterlySalary: prev.quarterlySalary + newJob.salary * MONTHS_IN_QUARTER,
    }))

    state.dismissNotification(notification.id)
  },

  // Actions
  applyForJob: (company, jobTitle, salary, cost, requirements) => {
    const state = get()
    if (!state.player) return

    const APPLY_ENERGY_COST = 5

    // Списываем энергию за собеседование через транзакцию
    if (
      !state.performTransaction(
        { energy: -APPLY_ENERGY_COST },
        { title: 'Прохождение собеседования' },
      )
    ) {
      return
    }

    const newApplication: JobApplication = {
      company,
      cost,
      daysPending: 0,
      id: `app_${String(Date.now())}`,
      jobTitle,
      requirements,
      salary,
    }

    set({
      pendingApplications: [...state.pendingApplications, newApplication],
    })

    state.pushNotification({
      message: `Вы подали заявку на вакансию ${jobTitle} в ${company}. Ожидайте ответа в следующем квартале.`,
      title: 'Заявка отправлена',
      type: 'info',
    })
  },

  askForRaise: (jobId: string) => {
    const state = get()
    const player = state.player
    if (!player) return

    const job = player.jobs.find((j) => j.id === jobId)
    if (!job) return

    const energyCost = 15
    // Списываем энергию за разговор через транзакцию
    if (!state.performTransaction({ energy: -energyCost }, { title: 'Разговор о повышении' })) {
      return
    }

    // Chance calculation
    const intelligence = player.stats.intelligence
    const playerSkills = player.personal.skills
    const jobRequirements = job.requirements?.skills ?? []

    let isSkillMatch = true
    if (jobRequirements.length > 0) {
      for (const req of jobRequirements) {
        const playerSkill = playerSkills.find((s) => s.name === req.name)
        if (!playerSkill || playerSkill.level <= req.level) {
          isSkillMatch = false
          break
        }
      }
    } else {
      isSkillMatch = false
    }

    const INTELLIGENCE_CHANCE_BASE = 30
    const INTELLIGENCE_CHANCE_DIVISOR = 2
    const baseChance = INTELLIGENCE_CHANCE_BASE + intelligence / INTELLIGENCE_CHANCE_DIVISOR
    const SUCCESS_CHANCE_MAX = 100
    const chance = isSkillMatch ? SUCCESS_CHANCE_MAX : baseChance
    const roll = Math.random() * SUCCESS_CHANCE_MAX
    const isSuccess = roll < chance

    if (isSuccess) {
      const RAISE_PERCENT_BASE = 10
      const RAISE_PERCENT_RANDOM = 10
      const raisePercent = RAISE_PERCENT_BASE + Math.random() * RAISE_PERCENT_RANDOM // 10-20% raise
      const oldSalary = job.salary
      const PERCENT_DIVISOR = 100
      const newSalary = Math.round(oldSalary * (1 + raisePercent / PERCENT_DIVISOR))
      const salaryDiff = newSalary - oldSalary

      const MONTHS_IN_QUARTER = 3
      state.updatePlayer((prev) => ({
        jobs: prev.jobs.map((j) => (j.id === jobId ? { ...j, salary: newSalary } : j)),
        quarterlySalary: prev.quarterlySalary + salaryDiff * MONTHS_IN_QUARTER,
      }))

      state.pushNotification({
        message: `Ваш разговор прошел успешно. Зарплата в ${job.company} выросла на ${String(Math.round(raisePercent))}% (+$${String(salaryDiff)}/мес).`,
        title: 'Повышение получено!',
        type: 'success',
      })
    } else {
      state.pushNotification({
        message: 'К сожалению, в повышении отказано. Попробуйте улучшить навыки.',
        title: 'Отказ в повышении',
        type: 'info',
      })
    }
  },

  // State
  pendingApplications: [],

  quitJob: (jobId: string) => {
    const state = get()
    if (!state.player) return

    const job = state.player.jobs.find((j) => j.id === jobId)
    if (!job) return

    const MONTHS_IN_QUARTER = 3
    state.updatePlayer((prev) => ({
      jobs: prev.jobs.filter((j) => j.id !== jobId),
      quarterlySalary: prev.quarterlySalary - job.salary * MONTHS_IN_QUARTER,
    }))
  },
})
