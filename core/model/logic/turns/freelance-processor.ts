import { processProgress } from '@/core/lib/progress/progress-processor'
import { formatGameDate } from '@/core/lib/quarter'
import type { FreelanceApplication, ActiveFreelanceGig, Skill, Notification } from '@/core/types'

interface FreelanceResult {
  finishedGigs: ActiveFreelanceGig[]
  notifications: Notification[]
  remainingApplications: FreelanceApplication[]
  updatedGigs: ActiveFreelanceGig[]
}

/**
 * Обрабатывает прогресс активных заказов
 */
function handleActiveGigs(
  activeGigs: ActiveFreelanceGig[],
  currentTurn: number,
  currentYear: number,
  notifications: Notification[],
): { finished: ActiveFreelanceGig[]; updated: ActiveFreelanceGig[] } {
  const updated: ActiveFreelanceGig[] = []
  const finished: ActiveFreelanceGig[] = []

  const gigProgress = processProgress(activeGigs)
  updated.push(...gigProgress.active)

  for (const gig of gigProgress.completed) {
    finished.push(gig)
    notifications.push({
      date: formatGameDate(currentYear, currentTurn),
      id: `freelance_done_${gig.id}_${String(currentTurn)}`,
      isRead: false,
      message: `Вы успешно завершили заказ "${gig.title}" и получили оплату $${String(gig.payment)}.`,
      title: '✅ Заказ выполнен!',
      type: 'success',
    })
  }

  return { finished, updated }
}

/**
 * Рассчитывает шанс и результат для одной заявки
 */
function processApplication(
  app: FreelanceApplication,
  playerSkills: Skill[],
  currentTurn: number,
  currentYear: number,
  notifications: Notification[],
): ActiveFreelanceGig | null {
  let score = 0
  let match = true

  for (const req of app.requirements) {
    const skill = playerSkills.find((s) => s.id === req.skillId)
    if (!skill || skill.level < req.minLevel) {
      match = false
    } else {
      score += skill.level - req.minLevel
    }
  }

  const MAX_CHANCE = 1.0
  const BASE_CHANCE = 0.4
  const SCORE_CHANCE_BOOST = 0.1
  const MIN_CHANCE = 0.05
  const BONUS_PER_SCORE_POINT = 0.05

  const chance =
    match || (typeof window !== 'undefined' && (window as { isE2E?: boolean }).isE2E)
      ? Math.min(MAX_CHANCE, BASE_CHANCE + score * SCORE_CHANCE_BOOST)
      : MIN_CHANCE

  if (
    Math.random() < chance ||
    (typeof window !== 'undefined' && (window as { isE2E?: boolean }).isE2E)
  ) {
    const bonus = score > 0 ? Math.round(app.payment * score * BONUS_PER_SCORE_POINT) : 0
    const finalPayment = app.payment + bonus

    const newGig: ActiveFreelanceGig = {
      cost: app.cost,
      costPerTurn: app.cost,
      gigId: app.gigId,
      id: `gig_${app.id}_${String(currentTurn)}`,
      payment: finalPayment,
      remainingDuration: app.duration,
      requirements: app.requirements,
      startedTurn: currentTurn,
      title: app.title,
      totalDuration: app.duration,
    }

    notifications.push({
      data: {
        cost: app.cost,
        duration: app.duration,
        freelanceApplicationId: app.id,
        isApproved: true,
        payment: finalPayment,
        requirements: app.requirements,
        title: app.title,
      },
      date: formatGameDate(currentYear, currentTurn),
      id: `freelance_offer_${app.id}_${String(currentTurn)}`,
      isRead: false,
      message: `Ваша заявка на заказ "${app.title}" была одобрена.${bonus > 0 ? ` За высокий уровень навыков предложена надбавка $${String(bonus)}!` : ''} Вы приступили к работе.`,
      title: '💼 Заказ одобрен!',
      type: 'info',
    })

    return newGig
  }

  notifications.push({
    date: formatGameDate(currentYear, currentTurn),
    id: `freelance_reject_${app.id}_${String(currentTurn)}`,
    isRead: false,
    message: `Клиент отклонил вашу заявку на заказ "${app.title}".`,
    title: '❌ Заказ отклонен',
    type: 'warning',
  })

  return null
}

export function processFreelance(
  pendingApplications: FreelanceApplication[],
  activeGigs: ActiveFreelanceGig[],
  playerSkills: Skill[],
  currentTurn: number,
  currentYear: number,
): FreelanceResult {
  const notifications: Notification[] = []

  // 1. Process active gigs progress
  const { finished: finishedGigs, updated: updatedGigs } = handleActiveGigs(
    activeGigs,
    currentTurn,
    currentYear,
    notifications,
  )

  // 2. Process new applications
  for (const app of pendingApplications) {
    const newGig = processApplication(app, playerSkills, currentTurn, currentYear, notifications)
    if (newGig) {
      updatedGigs.push(newGig)
    }
  }

  return {
    finishedGigs,
    notifications,
    remainingApplications: [], // Applications are resolved immediately in this version
    updatedGigs,
  }
}
