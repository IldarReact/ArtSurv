// Human traits types
import type { StatEffect } from './stats.types'

/**
 * Человеческая черта характера или состояние
 */
export interface HumanTrait {
  description: string
  // Эффекты на статы персонажа
  effects: StatEffect & {
    // Дополнительные эффекты для бизнеса/работы
    productivity?: number // -100 до +100
    socialSkills?: number // -100 до +100
    stressResistance?: number // -100 до +100
    learningSpeed?: number // -100 до +100
  }
  id: string
  // Может ли черта быть приобретена/потеряна в игре
  isDynamic: boolean

  name: string

  // Редкость черты (влияет на генерацию NPC)
  rarity: 'common' | 'uncommon' | 'rare' | 'very_rare'

  // Влияние на отношения
  relationshipModifier?: number // -50 до +50

  type: 'positive' | 'negative' | 'neutral' | 'medical'
}
