import { processProgress } from '@/core/lib/progress/progress-processor'
import { formatGameDate } from '@/core/lib/quarter'
import type { FreelanceApplication, ActiveFreelanceGig, Skill, Notification } from '@/core/types'

interface FreelanceResult {
  notifications: Notification[]
  remainingApplications: FreelanceApplication[]
  updatedGigs: ActiveFreelanceGig[]
  finishedGigs: ActiveFreelanceGig[]
}

export function processFreelance(
  pendingApplications: FreelanceApplication[],
  activeGigs: ActiveFreelanceGig[],
  playerSkills: Skill[],
  currentTurn: number,
  currentYear: number,
): FreelanceResult {
  const notifications: Notification[] = []
  const remainingApplications: FreelanceApplication[] = []
  const updatedGigs: ActiveFreelanceGig[] = []
  const finishedGigs: ActiveFreelanceGig[] = []

  // 1. Process active gigs progress
  const gigProgress = processProgress(activeGigs)
  updatedGigs.push(...gigProgress.active)

  // Handle completed gigs
  for (const gig of gigProgress.completed) {
    finishedGigs.push(gig)
    notifications.push({
      id: `freelance_done_${gig.id}_${currentTurn}`,
      type: 'success',
      title: '✅ Заказ выполнен!',
      message: `Вы успешно завершили заказ "${gig.title}" и получили оплату $${gig.payment}.`,
      date: formatGameDate(currentYear, currentTurn),
      isRead: false,
    })
  }

  // 2. Process new applications
  for (const app of pendingApplications) {
    let score = 0
    let match = true

    for (const req of app.requirements ?? []) {
      const skill = playerSkills.find((s) => s.name === req.skillId)
      if (!skill || skill.level < req.minLevel) {
        match = false
      } else {
        score += skill.level - req.minLevel
      }
    }

    // Chance calculation:
    // If match: 40% base + 10% per level above min (max 95%)
    // If no match: 2% chance
    const chance = match ? Math.min(0.95, 0.4 + score * 0.1) : 0.02

    if (Math.random() < chance) {
      // Bonus payment if skills are high
      const bonus = score > 0 ? Math.round(app.payment * score * 0.05) : 0
      const finalPayment = app.payment + bonus

      // Create new active gig
      const newGig: ActiveFreelanceGig = {
        id: `gig_${app.id}_${currentTurn}`,
        gigId: app.gigId,
        title: app.title,
        payment: finalPayment,
        cost: app.cost,
        costPerTurn: app.cost,
        requirements: app.requirements,
        totalDuration: app.duration,
        remainingDuration: app.duration,
        startedTurn: currentTurn,
      }

      updatedGigs.push(newGig)

      notifications.push({
        id: `freelance_offer_${app.id}_${currentTurn}`,
        type: 'info',
        title: '💼 Заказ одобрен!',
        message: `Ваша заявка на заказ "${app.title}" была одобрена.${bonus > 0 ? ` За высокий уровень навыков предложена надбавка $${bonus}!` : ''} Вы приступили к работе.`,
        date: formatGameDate(currentYear, currentTurn),
        isRead: false,
        data: {
          freelanceApplicationId: app.id,
          title: app.title,
          payment: finalPayment,
          cost: app.cost,
          requirements: app.requirements,
          duration: app.duration,
          isApproved: true,
        },
      })
    } else {
      notifications.push({
        id: `freelance_reject_${app.id}_${currentTurn}`,
        type: 'warning',
        title: '❌ Заказ отклонен',
        message: `Клиент отклонил вашу заявку на заказ "${app.title}".`,
        date: formatGameDate(currentYear, currentTurn),
        isRead: false,
      })
    }
  }

  return {
    notifications,
    remainingApplications: [], // Applications are resolved immediately in this version
    updatedGigs,
    finishedGigs,
  }
}
