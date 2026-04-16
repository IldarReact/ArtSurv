import type { BusinessType } from './business.types'
import type { SkillRequirement } from './skill.types'

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high'
export type IdeaStage = 'idea' | 'prototype' | 'mvp' | 'launched'

/**
 * Бизнес-идея, которую игрок может развивать
 */
export interface BusinessIdea {
  description: string
  developmentProgress: number // 0-100, прогресс текущей стадии
  expiresIn: number // Через сколько кварталов идея устареет (0 = бессрочно)
  // Метаданные
  generatedTurn: number

  id: string
  // Инвестиции
  investedAmount: number // Сколько уже вложено
  marketDemand: number // 0-100, текущий спрос на рынке

  maxInvestment: number
  minInvestment: number
  name: string

  potentialReturn: number // Множитель годовой прибыли (0.5 = 50%, 2.0 = 200%)
  // Требования для реализации
  requiredSkills: SkillRequirement[]

  // Характеристики идеи
  riskLevel: RiskLevel

  // Стадия развития
  stage: IdeaStage
  type: BusinessType
}

/**
 * Шаблон для генерации идей
 */
export interface IdeaTemplate {
  descriptionTemplates: string[]
  investmentRange: [number, number]
  nameTemplates: string[]
  requiredSkills: SkillRequirement[]
  returnRange: [number, number]
  riskRange: [RiskLevel, RiskLevel]
  type: BusinessType
}

export interface IdeaReplacements {
  [key: string]: string[]
  categories: string[]
  fields: string[]
  niches: string[]
  products: string[]
}
