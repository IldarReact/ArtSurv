import type { EmployeeRole } from '@/core/types/business.types'
import type {
  BusinessChangeApprovedEvent,
  BusinessChangeProposedEvent,
  BusinessChangeRejectedEvent,
  BusinessUpdatedEvent,
} from '@/core/types/events.types'

import type { GameStore } from '../../../../types'
import type { BusinessChangeProposal } from '../partnership-business-slice.types'

export const createPartnershipHandlers = (
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  get: () => GameStore,
) => ({
  onBusinessChangeApproved: (event: BusinessChangeApprovedEvent) => {
    const state = get()
    if (!state.player) return

    const { proposalId } = event.payload
    const proposal = state.businessProposals.find((p) => p.id === proposalId)

    set((state) => ({
      businessProposals: state.businessProposals.map((p) =>
        p.id === proposalId ? { ...p, status: 'approved' as const } : p,
      ),
    }))

    // Если это было предложение о вступлении в роль самого инициатора
    if (
      proposal &&
      (proposal.changeType === 'change_role' || proposal.changeType === 'hire_employee') &&
      proposal.data.isMe
    ) {
      state.joinBusinessAsEmployee(
        proposal.businessId,
        proposal.data.employeeRole as EmployeeRole,
        proposal.data.employeeSalary ?? 0,
      )
    }

    state.pushNotification({
      message: 'Ваше предложение по бизнесу было одобрено партнёром',
      title: 'Предложение одобрено',
      type: 'success',
    })
  },

  onBusinessChangeProposed: (event: BusinessChangeProposedEvent) => {
    const state = get()
    if (!state.player) return

    const { businessId, changeType, data, initiatorId, initiatorName, proposalId } = event.payload

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) return

    const proposal: BusinessChangeProposal = {
      businessId,
      changeType,
      createdAt: state.turn,
      data,
      id: proposalId,
      initiatorId,
      initiatorName,
      status: 'pending',
    }

    set((state) => ({
      businessProposals: [...state.businessProposals, proposal],
    }))

    state.pushNotification({
      message: `${initiatorName} предлагает изменить параметры бизнеса ${business.name}`,
      title: 'Новое предложение',
      type: 'info',
    })
  },

  onBusinessChangeRejected: (event: BusinessChangeRejectedEvent) => {
    const state = get()
    if (!state.player) return

    set((state) => ({
      businessProposals: state.businessProposals.map((p) =>
        p.id === event.payload.proposalId ? { ...p, status: 'rejected' as const } : p,
      ),
    }))

    state.pushNotification({
      message: 'Ваше предложение было отклонено партнёром',
      title: 'Предложение отклонено',
      type: 'warning',
    })
  },

  onBusinessUpdated: (event: BusinessUpdatedEvent) => {
    const state = get()
    if (!state.player) return

    const { businessId, changes } = event.payload
    const player = state.player

    state.updatePlayer((prev) => ({
      businesses: prev.businesses.map((business) => {
        if (business.id !== businessId) return business

        const processedChanges = { ...changes }
        let updatedPlayerEmployment = business.playerEmployment

        if (changes.employees && Array.isArray(changes.employees)) {
          const selfAsEmployee = changes.employees.find((emp) => emp.id === `player_${player.id}`)

          if (selfAsEmployee) {
            updatedPlayerEmployment = {
              ...(updatedPlayerEmployment ?? {
                experience: 0,
                productivity: 100,
                startedTurn: state.turn,
              }),
              effortPercent:
                selfAsEmployee.effortPercent ?? updatedPlayerEmployment?.effortPercent ?? 100,
              role: selfAsEmployee.role,
              salary: selfAsEmployee.salary,
            }
          } else if (updatedPlayerEmployment) {
            updatedPlayerEmployment = undefined
          }

          processedChanges.employees = changes.employees.filter(
            (emp) => emp.id !== `player_${player.id}`,
          )
        }

        return {
          ...business,
          ...processedChanges,
          playerEmployment: updatedPlayerEmployment,
        }
      }),
    }))
  },
})
