import { isManagerialRole } from '@/core/lib/business/employee-roles.config'
import type { EmployeeRole } from '@/core/types/business.types'

import type { GameStateCreator } from '../../../types'

export const createRolesSlice: GameStateCreator<Record<string, unknown>> = (set, get) => ({
  assignPlayerRole: (businessId: string, role: EmployeeRole) => {
    const state = get()
    if (!state.player) return

    const isManagerial = isManagerialRole(role)

    state.updatePlayer((prev) => ({
      businesses: prev.businesses.map((b) => {
        if (b.id !== businessId) return b

        const playerRoles = { ...b.playerRoles }
        if (isManagerial) {
          if (!playerRoles.managerialRoles.includes(role)) {
            playerRoles.managerialRoles = [...playerRoles.managerialRoles, role]
          }
        } else {
          playerRoles.operationalRole = role
        }

        // Инициализируем трудоустройство игрока, чтобы можно было настраивать занятость
        const playerEmployment = b.playerEmployment ?? {
          effortPercent: 100,
          experience: 0,
          role,
          salary: 0,
          startedTurn: state.turn,
        }

        return { ...b, playerEmployment, playerRoles }
      }),
    }))
  },

  setPlayerManagerialRoles: (businessId: string, roles: EmployeeRole[]) => {
    const state = get()
    if (!state.player) return

    state.updatePlayer((prev) => ({
      businesses: prev.businesses.map((b) =>
        b.id === businessId
          ? { ...b, playerRoles: { ...b.playerRoles, managerialRoles: roles } }
          : b,
      ),
    }))
  },

  setPlayerOperationalRole: (businessId: string, role: EmployeeRole | null) => {
    const state = get()
    if (!state.player) return

    state.updatePlayer((prev) => ({
      businesses: prev.businesses.map((b) =>
        b.id === businessId
          ? { ...b, playerRoles: { ...b.playerRoles, operationalRole: role } }
          : b,
      ),
    }))
  },

  unassignPlayerRole: (businessId: string, role: EmployeeRole) => {
    const state = get()
    if (!state.player) return

    state.updatePlayer((prev) => ({
      businesses: prev.businesses.map((b) => {
        if (b.id !== businessId) return b

        const playerRoles = { ...b.playerRoles }
        let playerEmployment = b.playerEmployment

        if (playerRoles.managerialRoles.includes(role)) {
          playerRoles.managerialRoles = playerRoles.managerialRoles.filter((r) => r !== role)
        } else if (playerRoles.operationalRole === role) {
          playerRoles.operationalRole = null
        }

        // Если увольняемая роль совпадает с основной ролью трудоустройства, сбрасываем трудоустройство
        if (playerEmployment?.role === role) {
          playerEmployment = undefined
        }

        return { ...b, playerEmployment, playerRoles }
      }),
    }))
  },
})
