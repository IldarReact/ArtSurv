import { canPlayerTakeRole } from '@/core/lib/business'
import type { EmployeeCandidate, Player, EmployeeStars } from '@/core/types'

import { SKILL_STAR_DIVISOR, MONTHS_PER_QUARTER } from '../../shared-constants'

export function getSkillStarsCount(value: number): number {
  return Math.round(value / SKILL_STAR_DIVISOR)
}

export function calculateMonthlySalary(quarterlySalary: number): number {
  return Math.round(quarterlySalary / MONTHS_PER_QUARTER)
}

export function calculateMaxSalaryWithKPI(salary: number, kpiPercent: number): number {
  return salary + Math.round(salary * (kpiPercent / 100))
}

export function calculateKPIBonus(salary: number, kpiPercent: number): number {
  return Math.round(salary * (kpiPercent / 100))
}

export function createPlayerCandidate(
  playerData: { clientId: string; name: string; isLocal?: boolean },
  defaultRole: EmployeeCandidate['role'],
  customSalary: number,
  localPlayerStats?: Player, // Используем тип Player
): EmployeeCandidate {
  // Если это локальный игрок, используем его реальные данные
  if (playerData.isLocal && localPlayerStats) {
    const skills = localPlayerStats.personal.skills
    const stars = skills.length > 0 ? Math.max(1, ...skills.map((s) => s.level)) : 1

    return {
      experience: 24, // Можно тоже вычислять, если есть данные
      humanTraits: [], // Можно подтянуть из трейтов игрока
      id: `player_${playerData.clientId}`,
      meetsRequirements: canPlayerTakeRole(defaultRole, skills),
      name: playerData.name,
      requestedSalary: customSalary,
      role: defaultRole,
      skills: {
        efficiency: 100,
        ...Object.fromEntries(skills.map((s) => [s.id, s.level])),
      },
      stars: stars as EmployeeStars,
    }
  }

  // Для других игроков пока оставляем заглушку или базовые данные
  return {
    experience: 24,
    humanTraits: ['ambitious', 'creative'],
    id: `player_${playerData.clientId}`,
    name: playerData.name,
    requestedSalary: customSalary,
    role: defaultRole,
    skills: {
      efficiency: 80,
    },
    stars: 3,
  }
}
