import { getShopItem } from '@/core/lib/shop-helpers'
import type { Player, StatModifiers, StatModifier } from '@/core/types'
import type { StatEffect } from '@/core/types/stats.types'

const COURSE_INTELLIGENCE_BONUS = 1
const UNIVERSITY_INTELLIGENCE_BONUS = 2
const UNIVERSITY_SANITY_PENALTY = -1
const PREGNANCY_HAPPINESS_BONUS = 5
const PREGNANCY_ENERGY_PENALTY = -10

/**
 * Собирает все модификаторы статов из разных источников
 */
export function calculateStatModifiers(player: Player): StatModifiers {
  const modifiers: StatModifiers = {
    energy: [],
    happiness: [],
    health: [],
    intelligence: [],
    money: [],
    sanity: [],
  }

  // Helper to push effects
  const pushEffects = (source: string, effects: StatEffect) => {
    if (effects.happiness) modifiers.happiness.push({ happiness: effects.happiness, source })
    if (effects.health) modifiers.health.push({ health: effects.health, source })
    if (effects.energy) modifiers.energy.push({ energy: effects.energy, source })
    if (effects.sanity) modifiers.sanity.push({ sanity: effects.sanity, source })
    if (effects.intelligence)
      modifiers.intelligence.push({ intelligence: effects.intelligence, source })
  }

  // Модификаторы от семьи
  player.personal.familyMembers.forEach((member) => {
    pushEffects(`Семья: ${member.name}`, member.passiveEffects)
  })

  // Модификаторы от работы
  player.jobs.forEach((job) => {
    const effects: StatEffect = {
      energy: job.cost.energy,
      happiness: job.cost.happiness,
      health: job.cost.health,
      intelligence: job.cost.intelligence,
      sanity: job.cost.sanity,
    }
    pushEffects(`Работа: ${job.title}`, effects)
  })

  // Модификаторы от активных курсов
  player.personal.activeCourses.forEach((course) => {
    if (course.costPerTurn) {
      // Аналогично, costPerTurn - это затраты
      const effects: StatEffect = {}
      if (course.costPerTurn.energy) effects.energy = -course.costPerTurn.energy
      if (course.costPerTurn.health) effects.health = -course.costPerTurn.health
      if (course.costPerTurn.sanity) effects.sanity = -course.costPerTurn.sanity

      pushEffects(`Курс: ${course.courseName}`, effects)
    }
    // Обучение даёт интеллект (хардкод или из типа?)
    modifiers.intelligence.push({
      intelligence: COURSE_INTELLIGENCE_BONUS,
      source: `Курс: ${course.courseName}`,
    })
  })

  // Модификаторы от университета
  player.personal.activeUniversity.forEach((uni) => {
    if (uni.costPerTurn) {
      const effects: StatEffect = {}
      if (uni.costPerTurn.energy) effects.energy = -uni.costPerTurn.energy
      if (uni.costPerTurn.health) effects.health = -uni.costPerTurn.health
      if (uni.costPerTurn.sanity) effects.sanity = -uni.costPerTurn.sanity

      pushEffects(`Университет: ${uni.programName}`, effects)
    }
    // Университет даёт больше интеллекта
    modifiers.intelligence.push({
      intelligence: UNIVERSITY_INTELLIGENCE_BONUS,
      source: `Университет: ${uni.programName}`,
    })
    // Но может снижать рассудок из-за стресса (если не задано в costPerTurn)
    if (!uni.costPerTurn?.sanity) {
      modifiers.sanity.push({
        sanity: UNIVERSITY_SANITY_PENALTY,
        source: `Университет: ${uni.programName}`,
      })
    }
  })

  // Модификаторы от беременности
  if (player.personal.pregnancy) {
    modifiers.happiness.push({
      happiness: PREGNANCY_HAPPINESS_BONUS,
      source: 'Беременность',
    })
    modifiers.energy.push({
      energy: PREGNANCY_ENERGY_PENALTY,
      source: 'Беременность',
    })
  }

  // Модификаторы от бизнеса (пока пропускаем, так как нет явных полей в типе Business)
  // Если нужно, можно добавить логику на основе playerRoles

  // Штраф за переполненность жилья
  if (player.housingId) {
    const housing = getShopItem(player.housingId, player.countryId)

    if (housing && 'capacity' in housing && housing.capacity) {
      const familySize = 1 + player.personal.familyMembers.length
      const capacity = housing.capacity

      if (familySize > capacity) {
        const overcrowdingPercent = ((familySize - capacity) / capacity) * 100
        const penalty = Math.ceil(overcrowdingPercent / 10)

        modifiers.happiness.push({
          happiness: -penalty,
          source: 'Переполненность жилья',
        })
        modifiers.sanity.push({
          sanity: -penalty,
          source: 'Переполненность жилья',
        })
        modifiers.intelligence.push({
          intelligence: -Math.floor(penalty / 2),
          source: 'Переполненность жилья',
        })
      }
    }
  }

  return modifiers
}

/**
 * Вычисляет суммарный модификатор для конкретного стата
 */
export function getTotalModifier(modifiers: StatModifier[], stat: keyof StatModifier): number {
  let sum = 0
  for (const mod of modifiers) {
    const value = mod[stat]
    sum += typeof value === 'number' ? value : 0
  }
  return sum
}
