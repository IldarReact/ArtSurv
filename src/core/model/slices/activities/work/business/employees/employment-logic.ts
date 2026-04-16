import { broadcastBusinessEmployeesUpdate } from '@/core/lib/multiplayer/broadcast-utils'
import type { Employee, EmployeeRole } from '@/core/types'

import type { GameStore } from '../../../../types'
import { updateBusinessInState } from '../utils/business-state-utils'

const DEFAULT_MANAGERIAL_EFFORT = 50
const DEFAULT_OPERATIONAL_EFFORT = 100
const MIN_EFFORT_PERCENT = 10
const MAX_EFFORT_PERCENT = 100
const INITIAL_EXPERIENCE = 0
const DEFAULT_PRODUCTIVITY = 100

export function handleJoinBusinessAsEmployee(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  role: EmployeeRole,
  salary: number,
  productivity = DEFAULT_PRODUCTIVITY,
  effortPercent?: number,
) {
  const player = state.player
  if (!player) return

  const business = player.businesses.find((b) => b.id === businessId)
  if (!business || business.playerEmployment) return

  const isManagerial = (
    ['manager', 'accountant', 'marketer', 'lawyer', 'hr'] as EmployeeRole[]
  ).includes(role)
  const isOperational = (['salesperson', 'technician', 'worker'] as EmployeeRole[]).includes(role)
  const finalEffortPercent =
    effortPercent ?? (isManagerial ? DEFAULT_MANAGERIAL_EFFORT : DEFAULT_OPERATIONAL_EFFORT)

  updateBusinessInState(set, businessId, (b) => {
    const nextPlayerRoles = { ...b.playerRoles }
    if (isManagerial) {
      const setRoles = new Set(nextPlayerRoles.managerialRoles)
      setRoles.add(role)
      nextPlayerRoles.managerialRoles = Array.from(setRoles)
    } else if (isOperational) {
      nextPlayerRoles.operationalRole = role
    }

    const updatedBusiness = {
      ...b,
      playerEmployment: {
        effortPercent: finalEffortPercent,
        experience: INITIAL_EXPERIENCE,
        productivity,
        role,
        salary,
        startedTurn: state.turn,
      },
      playerRoles: nextPlayerRoles,
    }

    // Call broadcast after update
    setTimeout(() => {
      broadcastBusinessEmployeesUpdate(updatedBusiness, player)
    }, 0)

    return updatedBusiness
  })
}

export function handleLeaveBusinessJob(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
) {
  const player = state.player
  if (!player) return

  const business = player.businesses.find((b) => b.id === businessId)
  if (!business?.playerEmployment) return

  updateBusinessInState(set, businessId, (b) => {
    const nextPlayerRoles = { ...b.playerRoles }
    const roleToLeave = b.playerEmployment?.role

    if (roleToLeave) {
      const isManagerial = (
        ['manager', 'accountant', 'marketer', 'lawyer', 'hr'] as EmployeeRole[]
      ).includes(roleToLeave)
      if (isManagerial) {
        nextPlayerRoles.managerialRoles = nextPlayerRoles.managerialRoles.filter(
          (r) => r !== roleToLeave,
        )
      } else {
        nextPlayerRoles.operationalRole = null
      }
    }

    const updatedBusiness = {
      ...b,
      playerEmployment: undefined,
      playerRoles: nextPlayerRoles,
    }

    // Call broadcast after update
    setTimeout(() => {
      broadcastBusinessEmployeesUpdate(updatedBusiness, player)
    }, 0)

    return updatedBusiness
  })
}

export function handleSetPlayerEmploymentEffort(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  effortPercent: number,
) {
  const player = state.player
  if (!player) return

  const clamped = Math.max(
    MIN_EFFORT_PERCENT,
    Math.min(MAX_EFFORT_PERCENT, Math.round(effortPercent)),
  )

  updateBusinessInState(set, businessId, (b) => {
    if (!b.playerEmployment) return b

    const role = b.playerEmployment.role
    const isOperational = (['salesperson', 'technician', 'worker'] as EmployeeRole[]).includes(role)
    const newEffort = isOperational ? MAX_EFFORT_PERCENT : clamped

    const updatedBusiness = {
      ...b,
      playerEmployment: {
        ...b.playerEmployment,
        effortPercent: newEffort,
      },
    }

    // Call broadcast after update
    setTimeout(() => {
      broadcastBusinessEmployeesUpdate(updatedBusiness, player)
    }, 0)

    return updatedBusiness
  })
}

export function handleSetPlayerEmploymentSalary(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  salary: number,
) {
  const player = state.player
  if (!player) return

  const clamped = Math.max(0, Math.round(salary))

  updateBusinessInState(set, businessId, (b) => {
    if (!b.playerEmployment) return b

    const updatedBusiness = {
      ...b,
      playerEmployment: {
        ...b.playerEmployment,
        salary: clamped,
      },
    }

    // Call broadcast after update
    setTimeout(() => {
      broadcastBusinessEmployeesUpdate(updatedBusiness, player)
    }, 0)

    return updatedBusiness
  })
}

export function handleUpdateEmployeeInBusiness(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  employeeId: string,
  updates: Partial<Employee>,
) {
  const player = state.player
  if (!player) return

  updateBusinessInState(set, businessId, (b) => {
    const existingIndex = b.employees.findIndex((e) => e.id === employeeId)
    if (existingIndex === -1) return b

    const updatedEmployees = [...b.employees]
    updatedEmployees[existingIndex] = {
      ...updatedEmployees[existingIndex],
      ...updates,
    }

    const updatedBusiness = {
      ...b,
      employees: updatedEmployees,
    }

    // Call broadcast after update
    setTimeout(() => {
      broadcastBusinessEmployeesUpdate(updatedBusiness, player)
    }, 0)

    return updatedBusiness
  })
}
