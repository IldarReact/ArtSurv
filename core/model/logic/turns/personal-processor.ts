import { processProgress } from '@/core/lib/progress/progress-processor'
import { formatGameDate } from '@/core/lib/quarter'
import type { Notification } from '@/core/types'
import type { Player } from '@/core/types'

/**
 * Обрабатывает логику свиданий
 */
function handleDating(
  isDating: boolean,
  potentialPartner: Player['personal']['potentialPartner'],
  playerAge: number,
  turn: number,
  year: number,
  notifications: Notification[],
): { isDating: boolean; potentialPartner: Player['personal']['potentialPartner'] } {
  const DATING_SUCCESS_CHANCE = 0.7
  const QUARTERS_PER_YEAR = 4

  if (isDating && !potentialPartner) {
    const success = Math.random() < DATING_SUCCESS_CHANCE || turn % QUARTERS_PER_YEAR === 0
    if (success) {
      const names = ['Мария', 'Анна', 'Елена', 'Виктория', 'София', 'Алиса', 'Дарья', 'Полина']
      const jobs = [
        { id: 'job_worker_start', income: 3000, title: 'Рабочий' },
        { id: 'job_indebted_start', income: 18000, title: 'Офисный работник' },
        { id: 'job_marketing', income: 22500, title: 'Digital Marketing Specialist' },
      ]

      const selectedJob = jobs[Math.floor(Math.random() * jobs.length)]

      const AGE_OFFSET = 2
      const AGE_VARIANCE = 5

      const partner = {
        age: playerAge - AGE_OFFSET + Math.floor(Math.random() * AGE_VARIANCE),
        id: `partner_${String(Date.now())}`,
        income: selectedJob.income,
        name: names[Math.floor(Math.random() * names.length)],
        occupation: selectedJob.title,
      }

      notifications.push({
        date: formatGameDate(year, turn),
        id: `dating_success_${String(Date.now())}`,
        isRead: false,
        message: `Вы познакомились с ${partner.name}. Она работает как ${partner.occupation}.`,
        title: 'Успешное свидание! 💘',
        type: 'success',
      })

      return { isDating: false, potentialPartner: partner }
    }

    notifications.push({
      date: formatGameDate(year, turn),
      id: `dating_fail_${String(Date.now())}`,
      isRead: false,
      message: 'В этом квартале не удалось найти подходящую пару. Поиски продолжаются...',
      title: 'Поиск партнера',
      type: 'info',
    })
  }

  return { isDating, potentialPartner }
}

/**
 * Создает новых членов семьи при рождении детей
 */
function createChildren(
  isTwins: boolean,
  year: number,
  turn: number,
  notifications: Notification[],
): Player['personal']['familyMembers'] {
  const children: Player['personal']['familyMembers'] = []
  const childCount = isTwins ? 2 : 1
  const names = ['Макс', 'Александр', 'Михаил', 'Артем', 'Иван', 'Дмитрий']

  for (let i = 0; i < childCount; i++) {
    children.push({
      age: 0,
      expenses: 500,
      foodPreference: undefined,
      id: `child_${String(Date.now())}_${String(i)}`,
      income: 0,
      loyalty: 100,
      name: names[Math.floor(Math.random() * names.length)],
      passiveEffects: { happiness: 10, health: 0, sanity: -2 },
      relationLevel: 100,
      transportPreference: undefined,
      type: 'child',
    })
  }

  notifications.push({
    date: formatGameDate(year, turn),
    id: `birth_${String(Date.now())}`,
    isRead: false,
    message: `Поздравляем! В вашей семье ${isTwins ? 'пополнение (двойня)' : 'пополнение'}.`,
    title: isTwins ? 'Двойня! 👶👶' : 'Рождение ребенка! 👶',
    type: 'success',
  })

  return children
}

/**
 * Обрабатывает логику беременности и рождения детей
 */
function handlePregnancy(
  pregnancy: Player['personal']['pregnancy'],
  familyMembers: Player['personal']['familyMembers'],
  turn: number,
  year: number,
  notifications: Notification[],
): {
  familyMembers: Player['personal']['familyMembers']
  pregnancy: Player['personal']['pregnancy']
} {
  let updatedPregnancy = pregnancy
  const updatedFamilyMembers = [...familyMembers]

  if (updatedPregnancy) {
    // Синхронизируем старые поля для процессора
    const PREGNANCY_DURATION = 3
    const progressable = {
      ...updatedPregnancy,
      remainingDuration: updatedPregnancy.remainingDuration,
      totalDuration: updatedPregnancy.totalDuration || PREGNANCY_DURATION,
    }

    const res = processProgress([progressable])

    if (res.completed.length > 0) {
      const completedPregnancy = res.completed[0] as Exclude<Player['personal']['pregnancy'], null>
      updatedFamilyMembers.push(
        ...createChildren(completedPregnancy.isTwins, year, turn, notifications),
      )
      updatedPregnancy = null
    } else {
      updatedPregnancy = {
        ...res.active[0],
        remainingDuration: res.active[0].remainingDuration,
      } as typeof updatedPregnancy
    }
  }

  return { familyMembers: updatedFamilyMembers, pregnancy: updatedPregnancy }
}

export function processPersonal(
  prevPersonal: Player['personal'],
  playerAge: number,
  turn: number,
  year: number,
) {
  const notifications: Notification[] = []

  // Dating Logic
  const { isDating, potentialPartner } = handleDating(
    prevPersonal.isDating,
    prevPersonal.potentialPartner,
    playerAge,
    turn,
    year,
    notifications,
  )

  // Pregnancy Logic
  const { familyMembers, pregnancy } = handlePregnancy(
    prevPersonal.pregnancy,
    prevPersonal.familyMembers,
    turn,
    year,
    notifications,
  )

  return {
    familyMembers,
    isDating,
    notifications,
    potentialPartner,
    pregnancy,
  }
}
