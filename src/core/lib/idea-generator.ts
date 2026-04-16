import { getIdeaTemplates, getIdeaReplacements } from '@/core/lib/data-loaders/static-data-loader'
import type { Skill } from '@/core/types'
import type {
  BusinessIdea,
  RiskLevel,
  IdeaTemplate,
  IdeaReplacements,
} from '@/core/types/idea.types'

/**
 * Выбирает подходящий шаблон на основе навыков игрока
 */
function selectTemplate(templates: IdeaTemplate[], playerSkills: Skill[]): IdeaTemplate {
  let template = templates[Math.floor(Math.random() * templates.length)]

  // Если у игрока есть программирование, больше шансов на tech
  const programmingSkill = playerSkills.find((s) => s.name === 'Программирование')
  const MIN_PROG_LEVEL = 3
  const PROG_CHANCE = 0.6
  if (programmingSkill && programmingSkill.level >= MIN_PROG_LEVEL && Math.random() < PROG_CHANCE) {
    template = templates.find((t) => t.type === 'tech') ?? template
  }

  // Если у игрока есть менеджмент, больше шансов на service
  const managementSkill = playerSkills.find((s) => s.name === 'Менеджмент')
  const MIN_MGMT_LEVEL = 2
  const MGMT_CHANCE = 0.5
  if (managementSkill && managementSkill.level >= MIN_MGMT_LEVEL && Math.random() < MGMT_CHANCE) {
    template = templates.find((t) => t.type === 'service') ?? template
  }

  return template
}

/**
 * Применяет замены в тексте шаблона
 */
function applyReplacements(
  name: string,
  description: string,
  replacements: IdeaReplacements,
): { description: string; name: string } {
  const mapping: Record<string, keyof IdeaReplacements> = {
    '{category}': 'categories',
    '{field}': 'fields',
    '{niche}': 'niches',
    '{product}': 'products',
  }

  let finalName = name
  let finalDescription = description

  for (const [placeholder, jsonKey] of Object.entries(mapping)) {
    if (finalName.includes(placeholder) || finalDescription.includes(placeholder)) {
      const options = replacements[jsonKey]
      if (options.length > 0) {
        const replacement = options[Math.floor(Math.random() * options.length)]
        finalName = finalName.replace(new RegExp(placeholder, 'g'), replacement)
        finalDescription = finalDescription.replace(new RegExp(placeholder, 'g'), replacement)
      }
    }
  }

  return { description: finalDescription, name: finalName }
}

/**
 * Генерирует бизнес-идею на основе навыков игрока
 */
export function generateBusinessIdea(
  playerSkills: Skill[],
  currentTurn: number,
  globalMarketValue = 1.0,
): BusinessIdea {
  const IDEA_TEMPLATES = getIdeaTemplates()
  const REPLACEMENTS = getIdeaReplacements()

  // Выбираем шаблон на основе навыков
  const template = selectTemplate(IDEA_TEMPLATES, playerSkills)

  // Генерируем название и описание
  const nameTemplate =
    template.nameTemplates[Math.floor(Math.random() * template.nameTemplates.length)]
  const descTemplate =
    template.descriptionTemplates[Math.floor(Math.random() * template.descriptionTemplates.length)]

  const { description, name } = applyReplacements(nameTemplate, descTemplate, REPLACEMENTS)

  // Определяем риск
  const riskLevels: RiskLevel[] = ['low', 'medium', 'high', 'very_high']
  const minRiskIndex = riskLevels.indexOf(template.riskRange[0])
  const maxRiskIndex = riskLevels.indexOf(template.riskRange[1])
  const riskIndex = minRiskIndex + Math.floor(Math.random() * (maxRiskIndex - minRiskIndex + 1))
  const riskLevel = riskLevels[riskIndex]

  // Определяем потенциал (зависит от риска и рынка)
  const baseReturn =
    template.returnRange[0] + Math.random() * (template.returnRange[1] - template.returnRange[0])

  const RISK_POTENTIAL_STEP = 0.2
  const RISK_POTENTIAL_BASE = 0.8
  const riskMultiplier = riskIndex * RISK_POTENTIAL_STEP + RISK_POTENTIAL_BASE // 0.8 для low, 1.4 для very_high
  const potentialReturn = baseReturn * riskMultiplier * globalMarketValue

  // Определяем спрос (зависит от рынка и типа)
  const DEMAND_BASE = 50
  const DEMAND_RANDOM_RANGE = 30
  const MAX_DEMAND = 100
  const baseDemand = DEMAND_BASE + Math.random() * DEMAND_RANDOM_RANGE
  const marketDemand = Math.min(MAX_DEMAND, baseDemand * globalMarketValue)

  // Инвестиции
  const minInvestment = template.investmentRange[0]
  const maxInvestment = template.investmentRange[1]

  // Срок актуальности (больше для низкого риска)
  const EXPIRES_LOW = 0
  const EXPIRES_MEDIUM = 8
  const EXPIRES_HIGH = 4
  const EXPIRES_VERY_HIGH = 2

  const expiresIn =
    riskLevel === 'low'
      ? EXPIRES_LOW
      : riskLevel === 'medium'
        ? EXPIRES_MEDIUM
        : riskLevel === 'high'
          ? EXPIRES_HIGH
          : EXPIRES_VERY_HIGH

  const ID_SUBSTRING_START = 2
  const ID_SUBSTRING_END = 11
  const RANDOM_BASE_36 = 36

  return {
    description,
    developmentProgress: 0,
    expiresIn,
    generatedTurn: currentTurn,
    id: `idea_${String(Date.now())}_${Math.random().toString(RANDOM_BASE_36).substring(ID_SUBSTRING_START, ID_SUBSTRING_END)}`,
    investedAmount: 0,
    marketDemand,
    maxInvestment,
    minInvestment,
    name,
    potentialReturn,
    requiredSkills: template.requiredSkills,
    riskLevel,
    stage: 'idea',
    type: template.type,
  }
}

/**
 * Проверяет, соответствует ли игрок требованиям идеи
 */
export function canDevelopIdea(idea: BusinessIdea, playerSkills: Skill[]): boolean {
  return idea.requiredSkills.every((req) => {
    const playerSkill = playerSkills.find((s) => s.id === req.skillId)
    return playerSkill && playerSkill.level >= req.minLevel
  })
}

/**
 * Рассчитывает стоимость развития идеи до следующей стадии
 */
export function calculateDevelopmentCost(idea: BusinessIdea): number {
  const COST_IDEA = 0.1
  const COST_LAUNCHED = 0
  const COST_MVP = 0.7
  const COST_PROTOTYPE = 0.2

  const stageCosts: Record<typeof idea.stage, number> = {
    idea: idea.minInvestment * COST_IDEA, // 10% для прототипа
    launched: COST_LAUNCHED,
    mvp: idea.minInvestment * COST_MVP, // 70% для запуска
    prototype: idea.minInvestment * COST_PROTOTYPE, // 20% для MVP
  }

  return stageCosts[idea.stage]
}

/**
 * Рассчитывает время развития (в кварталах)
 */
export function calculateDevelopmentTime(idea: BusinessIdea, playerSkills: Skill[]): number {
  const TIME_IDEA = 2
  const TIME_LAUNCHED = 0
  const TIME_MVP = 2
  const TIME_PROTOTYPE = 3

  const baseTimes: Record<typeof idea.stage, number> = {
    idea: TIME_IDEA, // 2 квартала до прототипа
    launched: TIME_LAUNCHED,
    mvp: TIME_MVP, // 2 квартала до запуска
    prototype: TIME_PROTOTYPE, // 3 квартала до MVP
  }

  let time = baseTimes[idea.stage]

  // Навыки ускоряют развитие
  const relevantSkills = playerSkills.filter((s) =>
    idea.requiredSkills.some((req) => req.skillId === s.id),
  )

  let avgSkillLevel = 0
  if (relevantSkills.length > 0) {
    let skillSum = 0
    for (const s of relevantSkills) {
      skillSum += s.level
    }
    avgSkillLevel = skillSum / relevantSkills.length
  }

  // Каждый уровень навыка сокращает время на 10%
  const SKILL_REDUCTION_PER_LEVEL = 0.1
  const MIN_TIME = 1
  const skillReduction = avgSkillLevel * SKILL_REDUCTION_PER_LEVEL
  time = Math.max(MIN_TIME, Math.round(time * (1 - skillReduction)))

  return time
}
