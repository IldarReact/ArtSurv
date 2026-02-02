import {
  updateBusinessMetrics,
  validateEmployeeHire,
  createEmployeeFromCandidate,
  createEmployeeObject,
} from '@/core/lib/business'
import { broadcastBusinessEmployeesUpdate } from '@/core/lib/multiplayer/broadcast-utils'
import type { EmployeeCandidate, Employee, EmployeeRole, EmployeeStars } from '@/core/types'

import type { GameStore } from '../../../../types'
import { updateBusinessInState } from '../utils/business-state-utils'

/* eslint-disable @typescript-eslint/no-magic-numbers */
const HIRE_ENERGY_COST = 5
const STAR_PENALTY_MULTIPLIER = 12
const BASE_ACCEPTANCE_PROB = 40
const MIN_ACCEPTANCE_PROB = 5
const MAX_ACCEPTANCE_PROB = 98

const ADULT_CHILD_STARS = 2 as EmployeeStars
const PARENT_STARS = 4 as EmployeeStars
const TEEN_CHILD_STARS = 1 as EmployeeStars
const WIFE_HUSBAND_STARS = 3 as EmployeeStars

const FAMILY_STARS = {
  ADULT_CHILD: ADULT_CHILD_STARS,
  PARENT: PARENT_STARS,
  TEEN_CHILD: TEEN_CHILD_STARS,
  WIFE_HUSBAND: WIFE_HUSBAND_STARS,
} as const

const AGES = {
  ADULT: 18,
  TEEN: 14,
} as const

const EXPERIENCE_AGE_MULTIPLIER = 4
/* eslint-enable @typescript-eslint/no-magic-numbers */

export function handleHireEmployee(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  candidate: EmployeeCandidate,
) {
  const player = state.player
  if (!player) return

  // 1. Проверка энергии (нужно 5 на попытку найма)
  const currentEnergy = player.personal.stats.energy
  if (currentEnergy < HIRE_ENERGY_COST) {
    state.pushNotification({
      message: `Вам нужно хотя бы ${String(HIRE_ENERGY_COST)} единиц энергии, чтобы провести собеседование.`,
      title: 'Недостаточно энергии',
      type: 'error',
    })
    return
  }

  const business = player.businesses.find((b) => b.id === businessId)
  if (!business) return

  // 1. Списываем энергию за попытку через транзакцию (даже если будет отказ или ошибка валидации)
  if (
    !state.performTransaction({ energy: -HIRE_ENERGY_COST }, { title: 'Собеседование сотрудника' })
  ) {
    return
  }

  const playerRolesCount =
    business.playerRoles.managerialRoles.length + (business.playerRoles.operationalRole ? 1 : 0)

  // 2. Валидация параметров найма (деньги, лимиты)
  const validation = validateEmployeeHire(
    business.walletBalance ?? 0,
    candidate.requestedSalary,
    business.employees.length + playerRolesCount,
    business.maxEmployees,
  )

  if (!validation.isValid) {
    state.pushNotification({
      message: validation.error ?? 'Невозможно нанять сотрудника',
      title: 'Ошибка найма',
      type: 'error',
    })
    return
  }

  // 3. Логика отказа на основе репутации
  // Базовая вероятность согласия: 40% + репутация - (звезды * 12)
  const baseProb = BASE_ACCEPTANCE_PROB
  const reputationWeight = business.reputation
  const starPenalty = candidate.stars * STAR_PENALTY_MULTIPLIER
  const acceptanceProb = Math.max(
    MIN_ACCEPTANCE_PROB,
    Math.min(MAX_ACCEPTANCE_PROB, baseProb + reputationWeight - starPenalty),
  )

  // В тестах не используем рандом для детерминизма
  const isTest =
    (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') ||
    (typeof window !== 'undefined' && (window as Window & { isE2E?: boolean }).isE2E)

  if (!isTest && Math.random() * 100 > acceptanceProb) {
    state.pushNotification({
      message: `${candidate.name} отклонил ваше предложение. Ваша репутация (${String(Math.round(reputationWeight))}) недостаточно высока для специалиста такого уровня (${String(candidate.stars)}★).`,
      title: 'Отказ от предложения',
      type: 'warning',
    })
    return
  }

  const newEmployee = createEmployeeFromCandidate(candidate)
  const employees = [...business.employees, newEmployee]

  const updatedBusiness = updateBusinessMetrics({
    ...business,
    employees,
  })

  updateBusinessInState(set, businessId, () => updatedBusiness)

  const notification = {
    message: `${candidate.name} принял ваше предложение и приступил к работе в ${business.name}.`,
    title: 'Сотрудник нанят',
    type: 'success' as const,
  }

  state.pushNotification(notification)

  broadcastBusinessEmployeesUpdate(updatedBusiness, player)
}

export function handleHireFamilyMember(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  familyMemberId: string,
  role: EmployeeRole,
) {
  const player = state.player
  if (!player) return

  const familyMember = player.personal.familyMembers.find((m) => m.id === familyMemberId)
  if (!familyMember) return

  const business = player.businesses.find((b) => b.id === businessId)
  if (!business) return

  // Validate hiring parameters
  // Family members are hired for free initially (or we can set a token salary)
  const salary = 0
  const playerRolesCount =
    business.playerRoles.managerialRoles.length + (business.playerRoles.operationalRole ? 1 : 0)

  const validation = validateEmployeeHire(
    business.walletBalance ?? 0,
    salary,
    business.employees.length + playerRolesCount,
    business.maxEmployees,
  )

  if (!validation.isValid) {
    state.pushNotification({
      message: validation.error ?? 'Невозможно нанять члена семьи',
      title: 'Ошибка найма',
      type: 'error',
    })
    return
  }

  // Determine stars based on family member type
  let stars: EmployeeStars = 1
  if (familyMember.type === 'wife' || familyMember.type === 'husband') {
    stars = FAMILY_STARS.WIFE_HUSBAND
  } else if (familyMember.type === 'parent') {
    stars = FAMILY_STARS.PARENT
  } else if (familyMember.type === 'child') {
    if (familyMember.age >= AGES.ADULT) {
      stars = FAMILY_STARS.ADULT_CHILD
    } else if (familyMember.age >= AGES.TEEN) {
      stars = FAMILY_STARS.TEEN_CHILD
    } else {
      state.pushNotification({
        message: 'Этот член семьи слишком мал для работы.',
        title: 'Ошибка найма',
        type: 'error',
      })
      return
    }
  }

  const newEmployee = createEmployeeObject({
    experience: familyMember.age * EXPERIENCE_AGE_MULTIPLIER, // Simple proxy
    humanTraits: familyMember.traits ?? [],
    id: `family_${familyMember.id}`,
    name: familyMember.name,
    productivity: 100,
    role: role,
    salary: salary,
    stars: stars,
  })

  const employees = [...business.employees, newEmployee]
  const updatedBusiness = updateBusinessMetrics({
    ...business,
    employees,
  })

  // Hiring family costs 5 energy now
  if (!state.performTransaction({ energy: -HIRE_ENERGY_COST }, { title: 'Наем члена семьи' })) {
    return
  }

  state.updatePlayer((prev) => ({
    businesses: prev.businesses.map((b) => (b.id === businessId ? updatedBusiness : b)),
    personal: {
      ...prev.personal,
      familyMembers: prev.personal.familyMembers.map((m) =>
        m.id === familyMemberId
          ? {
              ...m,
              employedInBusinessId: businessId,
              occupation: `Работает в ${business.name}`,
            }
          : m,
      ),
    },
  }))

  state.pushNotification({
    message: `${familyMember.name} теперь работает в ${business.name} на позиции ${role}.`,
    title: 'Семейный бизнес',
    type: 'success',
  })

  broadcastBusinessEmployeesUpdate(updatedBusiness, player)
}

export function handleFireEmployee(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  employeeId: string,
) {
  const player = state.player
  if (!player) return

  const business = player.businesses.find((b) => b.id === businessId)
  if (!business) return

  const employees = business.employees.filter((e) => e.id !== employeeId)

  const updatedBusiness = updateBusinessMetrics({
    ...business,
    employees,
  })

  updateBusinessInState(set, businessId, () => updatedBusiness)

  const employeeName = business.employees.find((e) => e.id === employeeId)?.name ?? 'Сотрудник'
  state.pushNotification({
    message: `${employeeName} уволен из ${business.name}.`,
    title: 'Сотрудник уволен',
    type: 'info',
  })

  broadcastBusinessEmployeesUpdate(updatedBusiness, player)
}

export function handleAddEmployeeToBusiness(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  employeeName: string,
  role: EmployeeRole,
  salary: number,
  playerId?: string,
  extraData?: Partial<Employee>,
) {
  const player = state.player
  if (!player) return

  const business = player.businesses.find((b) => b.id === businessId)
  if (!business) return

  const newEmployee = createEmployeeObject({
    experience: extraData?.experience,
    humanTraits: extraData?.humanTraits,
    id: playerId ? `player_${playerId}` : undefined,
    name: employeeName,
    productivity: 100,
    role,
    salary: salary,
    skills: extraData?.skills,
    stars: extraData?.stars ?? 1,
  })

  const existingIndex = business.employees.findIndex((e) => e.id === newEmployee.id)
  const newEmployees = [...business.employees]
  if (existingIndex !== -1) {
    newEmployees[existingIndex] = newEmployee
  } else {
    newEmployees.push(newEmployee)
  }

  const updatedBusiness = {
    ...business,
    employees: newEmployees,
  }

  updateBusinessInState(set, businessId, () => updatedBusiness)

  broadcastBusinessEmployeesUpdate(updatedBusiness, player)
}
