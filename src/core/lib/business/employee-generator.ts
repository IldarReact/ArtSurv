import {
  getBaseSalary,
  getStarMultiplier,
  getRandomFirstName,
  getRandomLastName,
  getRandomHumanTraits,
} from '@/core/lib/data-loaders/static-data-loader'
import type {
  EmployeeCandidate,
  EmployeeRole,
  EmployeeStars,
  EmployeeSkills,
  Employee,
} from '@/core/types/business.types'
import type { CountryEconomy } from '@/core/types/economy.types'

import { getInflatedBaseSalary } from '../calculations/price-helpers'

const DEFAULT_EFFORT_PERCENT = 100
const DEFAULT_PRODUCTIVITY = 75
const DEFAULT_STARS = 3
const DEFAULT_SKILLS_EFFICIENCY = 50

const BASE_EFFICIENCY = 40
const EFFICIENCY_STAR_BONUS = 10
const EFFICIENCY_RANDOM_VARIATION = 20
const EFFICIENCY_MIN = 10
const EFFICIENCY_MAX = 100

const STAR_PROB_5 = 0.98
const STAR_PROB_4 = 0.9
const STAR_PROB_3 = 0.7
const STAR_PROB_2 = 0.4

const AVATAR_RANDOM_RANGE = 1000
const AVATAR_SIZE = 150
const DEFAULT_CANDIDATE_COUNT = 3
const MIN_TRAIT_COUNT = 1
const MAX_TRAIT_COUNT = 3

const EXP_RANGE_1 = 4
const EXP_RANGE_2 = 8
const EXP_RANGE_3 = 12
const EXP_RANGE_4 = 24
const EXP_RANGE_5 = 48

const STAR_1 = 1
const STAR_2 = 2
const STAR_3 = 3
const STAR_4 = 4
const STAR_5 = 5

/**
 * Создает объект сотрудника с заданными параметрами
 */
export function createEmployeeObject(params: {
  id?: string
  name: string
  role: EmployeeRole
  stars?: EmployeeStars
  skills?: EmployeeSkills
  salary: number
  experience?: number
  humanTraits?: string[]
  productivity?: number
  effortPercent?: number
}): Employee {
  const radix = 36
  const subStart = 2
  const subEnd = 11

  return {
    effortPercent: params.effortPercent ?? DEFAULT_EFFORT_PERCENT,
    experience: params.experience ?? 0,
    humanTraits: params.humanTraits ?? [],
    id:
      params.id ??
      `employee_${String(Date.now())}_${Math.random().toString(radix).substring(subStart, subEnd)}`,
    name: params.name,
    productivity: params.productivity ?? DEFAULT_PRODUCTIVITY,
    role: params.role,
    salary: params.salary,
    skills: params.skills ?? { efficiency: DEFAULT_SKILLS_EFFICIENCY },
    stars: params.stars ?? (DEFAULT_STARS as EmployeeStars),
  }
}

/**
 * Создает объект сотрудника на основе кандидата
 */
export function createEmployeeFromCandidate(candidate: EmployeeCandidate): Employee {
  return createEmployeeObject({
    experience: candidate.experience,
    humanTraits: candidate.humanTraits,
    name: candidate.name,
    role: candidate.role,
    salary: candidate.requestedSalary,
    skills: candidate.skills,
    stars: candidate.stars,
  })
}

/**
 * Генерирует случайные навыки для сотрудника на основе роли и звезд
 */
export function generateSkills(_role: EmployeeRole, stars: EmployeeStars): EmployeeSkills {
  // Базовая эффективность: 40 + (звезды * 10) + рандом
  const starBonus = stars * EFFICIENCY_STAR_BONUS
  const randomVariation = Math.random() * EFFICIENCY_RANDOM_VARIATION - EFFICIENCY_STAR_BONUS

  const efficiency = Math.min(
    EFFICIENCY_MAX,
    Math.max(EFFICIENCY_MIN, BASE_EFFICIENCY + starBonus + randomVariation),
  )

  return { efficiency }
}

/**
 * Рассчитывает зарплату на основе роли и звезд с учетом инфляции
 */
export function calculateSalary(
  role: EmployeeRole,
  stars: EmployeeStars,
  economy?: CountryEconomy,
): number {
  const baseSalary = getBaseSalary(role)

  // Применяем инфляцию к базовой зарплате
  const inflatedBaseSalary = economy ? getInflatedBaseSalary(baseSalary, economy) : baseSalary

  // Множитель зарплаты от звезд (экспоненциальный рост)
  const starMultiplier = getStarMultiplier(stars)

  return Math.round(inflatedBaseSalary * starMultiplier)
}

/**
 * Генерирует кандидата на работу
 */
export function generateEmployeeCandidate(
  role: EmployeeRole,
  stars?: EmployeeStars,
  economy?: CountryEconomy,
  countryId?: string,
): EmployeeCandidate {
  // Распределение звезд если не указано: 1★ (40%), 2★ (30%), 3★ (20%), 4★ (8%), 5★ (2%)
  let candidateStars: EmployeeStars = STAR_1
  if (stars) {
    candidateStars = stars
  } else {
    const rand = Math.random()
    if (rand > STAR_PROB_5) candidateStars = STAR_5
    else if (rand > STAR_PROB_4) candidateStars = STAR_4
    else if (rand > STAR_PROB_3) candidateStars = STAR_3
    else if (rand > STAR_PROB_2) candidateStars = STAR_2
  }

  const firstName = getRandomFirstName(countryId)
  const lastName = getRandomLastName(countryId)
  const skills = generateSkills(role, candidateStars)
  const salary = calculateSalary(role, candidateStars, economy)

  // Генерируем случайную аватарку (unsplash)
  const avatarId = Math.floor(Math.random() * AVATAR_RANDOM_RANGE)
  const avatar = `https://i.pravatar.cc/${String(AVATAR_SIZE)}?u=${String(avatarId)}`

  const experience = {
    [STAR_1]: Math.floor(Math.random() * EXP_RANGE_1),
    [STAR_2]: EXP_RANGE_1 + Math.floor(Math.random() * EXP_RANGE_2),
    [STAR_3]: EXP_RANGE_3 + Math.floor(Math.random() * EXP_RANGE_3),
    [STAR_4]: EXP_RANGE_4 + Math.floor(Math.random() * EXP_RANGE_4),
    [STAR_5]: EXP_RANGE_5 + Math.floor(Math.random() * EXP_RANGE_5),
  }[candidateStars]

  // Генерируем 1-3 случайные черты характера
  const traitCount = MIN_TRAIT_COUNT + Math.floor(Math.random() * MAX_TRAIT_COUNT)
  const humanTraits = getRandomHumanTraits(traitCount)

  return {
    avatar,
    countryId,
    experience,
    humanTraits,
    id: `candidate_${String(Date.now())}_${String(Math.random())}`,
    name: `${firstName} ${lastName}`,
    requestedSalary: salary,
    role,
    skills,
    stars: candidateStars,
  }
}

/**
 * Генерирует несколько кандидатов для выбора
 */
export function generateCandidates(
  role: EmployeeRole,
  count = DEFAULT_CANDIDATE_COUNT,
  economy?: CountryEconomy,
  countryId?: string,
): EmployeeCandidate[] {
  const candidates: EmployeeCandidate[] = []
  for (let i = 0; i < count; i++) {
    candidates.push(generateEmployeeCandidate(role, undefined, economy, countryId))
  }
  return candidates
}
