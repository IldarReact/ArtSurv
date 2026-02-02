import type { Business, EmployeeRole } from '../../../types/business.types'
import type { Skill } from '../../../types/skill.types'
import { getRoleConfig } from '../employee-roles.config'
import { isRoleFilled, getTotalEmployeesCount } from './role-utils'

/**
 * Проверить, может ли игрок взять указанную роль
 * (для операционных ролей можно проверять наличие навыков)
 */
export function canPlayerTakeRole(role: EmployeeRole, playerSkills: Skill[]): boolean {
  const config = getRoleConfig(role)
  if (!config) return false

  // Если нет требований к уровню, может взять любой
  if (config.minSkillLevel === undefined || config.minSkillLevel === 0) {
    return true
  }

  // Найти соответствующий навык
  const skillName = config.skillGrowth?.name
  if (!skillName) return true // Если нет привязанного навыка (странно, но допустимо)

  const playerSkill = playerSkills.find((s) => s.name === skillName)
  const currentLevel = playerSkill?.level ?? 0

  return currentLevel >= config.minSkillLevel
}

const COMPLEX_BUSINESS_THRESHOLD = 15

/**
 * Проверить, выполнены ли минимальные требования к персоналу
 */
export function checkMinimumStaffing(business: Business): {
  isValid: boolean
  missingRoles: EmployeeRole[]
  totalEmployees: number
  requiredEmployees: number
  workerCount: number
  requiredWorkers: number
} {
  // Базовые обязательные роли (для маленьких бизнесов только менеджер)
  const globalRequiredRoles: EmployeeRole[] =
    business.maxEmployees > COMPLEX_BUSINESS_THRESHOLD ? ['manager', 'accountant'] : ['manager']
  const specificRequiredRoles = business.employeeRoles
    .filter((r) => r.priority === 'required')
    .map((r) => r.role)
  const allRequiredRoles = Array.from(new Set([...globalRequiredRoles, ...specificRequiredRoles]))

  const minEmployees = business.minEmployees

  // Проверить обязательные роли
  const missingRoles: EmployeeRole[] = []

  allRequiredRoles.forEach((role) => {
    if (!isRoleFilled(business, role)) {
      missingRoles.push(role)
    }
  })

  // Подсчитать общее количество "сотрудников"
  const totalEmployees = getTotalEmployeesCount(business)

  // Подсчитать только работников (worker)
  let workerCount = business.employees.filter((e) => e.role === 'worker').length

  // Если игрок выполняет роль worker, учитываем его
  if (business.playerRoles.operationalRole === 'worker') {
    workerCount += 1
  }

  // Проверка: выполнены обязательные роли И достаточно работников
  const isValid = missingRoles.length === 0 && workerCount >= minEmployees

  return {
    isValid,
    missingRoles,
    requiredEmployees: minEmployees,
    requiredWorkers: minEmployees,
    totalEmployees,
    workerCount,
  }
}

/**
 * Получить список ролей, которые игрок должен выполнять автоматически
 * (если нет сотрудников на этих ролях)
 */
export function getAutoAssignedManagerialRoles(): EmployeeRole[] {
  // Теперь роли не назначаются автоматически. Игрок должен выбрать слот вручную.
  return []
}

/**
 * Обновить роли игрока автоматически
 * (УДАЛЕНО: теперь игрок должен назначать себя сам)
 */
export function updateAutoAssignedRoles(business: Business): Business {
  // Теперь роли не назначаются автоматически. Игрок должен выбрать слот вручную.
  return business
}
