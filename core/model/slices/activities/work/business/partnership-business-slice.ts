import type { StateCreator } from 'zustand'

import { getBusinessPartner } from '@/core/lib/business/partnership-permissions'
import { broadcastEvent } from '@/core/lib/multiplayer'
import type { BusinessChangeType } from '@/core/types/business.types'

import type { GameStore } from '../../../types'
import type {
  PartnershipBusinessSlice,
  BusinessChangeProposal,
} from './partnership-business-slice.types'
import { createPartnershipHandlers } from './partnership/partnership-handlers'
import { applyProposal } from './partnership/proposal-applier'
import { handleProposeBusinessChange } from './partnership/propose-logic'

export const createPartnershipBusinessSlice: StateCreator<
  GameStore,
  [],
  [],
  PartnershipBusinessSlice
> = (set, get) => {
  const handlers = createPartnershipHandlers(set, get)

  return {
    ...handlers,
    approveBusinessChange: (proposalId: string) => {
      const state = get()
      if (!state.player) return

      const proposal = state.businessProposals.find((p) => p.id === proposalId)
      if (!proposal) {
        return
      }

      const business = state.player.businesses.find((b) => b.id === proposal.businessId)
      if (!business) {
        state.pushNotification({
          message: `Бизнес не найден (ID: ${proposal.businessId}). Это может быть старое предложение.`,
          title: 'Ошибка',
          type: 'error',
        })
        return
      }

      // Применяем изменения через хелпер
      const changesToBroadcast = applyProposal(state, proposal, set)

      if (changesToBroadcast === null) return // Ошибка (например, нет денег)

      // Отправляем событие инициатору об одобрении
      broadcastEvent({
        payload: {
          approverId: state.player.id,
          businessId: proposal.businessId,
          proposalId,
        },
        toPlayerId: proposal.initiatorId,
        type: 'BUSINESS_CHANGE_APPROVED',
      })

      // Отправляем обновление бизнеса инициатору
      broadcastEvent({
        payload: {
          businessId: proposal.businessId,
          changes: changesToBroadcast,
        },
        toPlayerId: proposal.initiatorId,
        type: 'BUSINESS_UPDATED',
      })

      state.pushNotification({
        message: 'Изменения применены к бизнесу',
        title: 'Изменение одобрено',
        type: 'success',
      })
    },

    businessProposals: [],

    proposeBusinessChange: (
      businessId: string,
      changeType: BusinessChangeType,
      data: BusinessChangeProposal['data'],
    ) => {
      handleProposeBusinessChange(get(), set, businessId, changeType, data)
    },

    rejectBusinessChange: (proposalId: string) => {
      const state = get()
      if (!state.player) return

      const proposal = state.businessProposals.find((p) => p.id === proposalId)
      if (!proposal) return

      set((state) => {
        if (!state.player) return state
        return {
          businessProposals: state.businessProposals.map((p) =>
            p.id === proposalId ? { ...p, status: 'rejected' as const } : p,
          ),
        }
      })

      broadcastEvent({
        payload: {
          businessId: proposal.businessId,
          proposalId,
          rejecterId: state.player.id,
        },
        toPlayerId: proposal.initiatorId,
        type: 'BUSINESS_CHANGE_REJECTED',
      })

      state.pushNotification({
        message: 'Предложение было отклонено',
        title: 'Изменение отклонено',
        type: 'info',
      })
    },

    updateBusinessDirectly: (businessId, changes) => {
      const state = get()
      if (!state.player) return

      const business = state.player.businesses.find((b) => b.id === businessId)
      if (!business) return

      state.updatePlayer((prev) => ({
        businesses: prev.businesses.map((b) =>
          b.id === businessId
            ? {
                ...b,
                price: changes.price ?? b.price,
                quantity: changes.quantity ?? b.quantity,
                state: changes.state ?? b.state,
              }
            : b,
        ),
      }))

      const partner = getBusinessPartner(business, state.player.id)
      if (partner) {
        broadcastEvent({
          payload: {
            businessId,
            changes,
          },
          toPlayerId: partner.id,
          type: 'BUSINESS_UPDATED',
        })
      }

      state.pushNotification({
        message: 'Изменения применены',
        title: 'Бизнес обновлён',
        type: 'success',
      })
    },

    ...handlers,
  }
}
