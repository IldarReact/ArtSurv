import type { GameOverReason } from '@/core/types/game.types'
import type { StatEffect } from '@/core/types/stats.types'

/**
 * Проверяет условия поражения игрока
 * @returns Причина поражения или null, если игрок еще жив
 */
export function checkDefeatConditions(stats: StatEffect): GameOverReason | null {
  // Проверка здоровья
  if ((stats.health ?? 0) <= 0) {
    return 'DEATH'
  }

  // Проверка рассудка
  if ((stats.sanity ?? 0) <= 0) {
    return 'MENTAL_BREAKDOWN'
  }

  // Проверка интеллекта
  if ((stats.intelligence ?? 0) <= 0) {
    return 'DEGRADATION'
  }

  // Проверка счастья
  if ((stats.happiness ?? 0) <= 0) {
    return 'DEPRESSION'
  }

  return null
}

/**
 * Возвращает человекочитаемое описание причины поражения
 */
export function getGameOverMessage(reason: GameOverReason): { title: string; message: string } {
  switch (reason) {
    case 'DEATH':
      return {
        message: 'Ваше здоровье упало до нуля. Вы умерли от болезни или истощения.',
        title: 'Смерть',
      }
    case 'MENTAL_BREAKDOWN':
      return {
        message: 'Ваш рассудок не выдержал. Вы потеряли способность продолжать жизнь.',
        title: 'Психический срыв',
      }
    case 'DEGRADATION':
      return {
        message: 'Ваш интеллект упал до нуля. Вы больше не способны принимать решения.',
        title: 'Деградация',
      }
    case 'DEPRESSION':
      return {
        message: 'Вы потеряли всякое желание жить. Счастье упало до нуля.',
        title: 'Депрессия',
      }
    case 'BANKRUPTCY':
      return {
        message: 'Вы не смогли справиться с долгами и объявили банкротство.',
        title: 'Банкротство',
      }
  }
}
