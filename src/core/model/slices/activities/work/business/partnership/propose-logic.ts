import {
  canProposeChanges,
  canMakeDirectChanges,
  getPlayerShare,
  getBusinessPartner,
  requiresApproval,
  generateProposalId,
} from '@/core/lib/business/partnership-permissions'
import { broadcastEvent } from '@/core/lib/multiplayer'
import type { BusinessChangeType, Business } from '@/core/types/business.types'

import type { GameStore } from '../../../../types'
import type { BusinessChangeProposal } from '../partnership-business-slice.types'
import { applyProposal } from './proposal-applier'

function handleFundCollection(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  business: Business,
  amount: number,
) {
  if (!state.player) return

  const playerShare = getPlayerShare(business, state.player.id)
  const PERCENT_MIN = 0
  const PERCENT_MAX = 100
  const contribution = Math.round(
    amount * (Math.max(PERCENT_MIN, Math.min(PERCENT_MAX, playerShare)) / PERCENT_MAX),
  )

  if (contribution <= 0) return

  // Списываем деньги через транзакцию
  if (
    !state.performTransaction(
      { money: -contribution },
      { title: `Взнос в бизнес ${business.name}` },
    )
  ) {
    return
  }

  state.updatePlayer((prev) => ({
    businesses: prev.businesses.map((b) =>
      b.id === business.id ? { ...b, walletBalance: (b.walletBalance ?? 0) + contribution } : b,
    ),
  }))

  const partner = getBusinessPartner(business, state.player.id)
  if (partner) {
    const updatedBusiness = state.player.businesses.find((b) => b.id === business.id)
    broadcastEvent({
      payload: {
        businessId: business.id,
        changes: { walletBalance: updatedBusiness?.walletBalance },
      },
      toPlayerId: partner.id,
      type: 'BUSINESS_UPDATED',
    })
  }

  state.pushNotification({
    message: 'Ваш вклад внесён в кошелёк бизнеса',
    title: 'Взнос выполнен',
    type: 'success',
  })
}

function handleCreateProposal(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  business: Business,
  changeType: BusinessChangeType,
  data: BusinessChangeProposal['data'],
) {
  if (!state.player) return

  const proposalId = generateProposalId()
  const partner = getBusinessPartner(business, state.player.id)

  if (!partner) {
    return
  }

  const proposal: BusinessChangeProposal = {
    businessId: business.id,
    changeType,
    createdAt: state.turn,
    data,
    id: proposalId,
    initiatorId: state.player.id,
    initiatorName: state.player.name,
    status: 'pending',
  }

  set((state) => ({
    businessProposals: [...state.businessProposals, proposal],
  }))

  broadcastEvent({
    payload: {
      businessId: business.id,
      changeType,
      data,
      initiatorId: state.player.id,
      initiatorName: state.player.name,
      proposalId,
    },
    toPlayerId: partner.id,
    type: 'BUSINESS_CHANGE_PROPOSED',
  })

  state.pushNotification({
    message: `Предложение об изменении отправлено партнёру ${partner.name}`,
    title: 'Предложение отправлено',
    type: 'info',
  })
}

export function handleProposeBusinessChange(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  businessId: string,
  changeType: BusinessChangeType,
  data: BusinessChangeProposal['data'],
) {
  if (!state.player) return

  const business = state.player.businesses.find((b) => b.id === businessId)
  if (!business) {
    // console.warn(`Business ${businessId} not found for proposal`)
    return
  }

  // Проверяем права
  if (!canProposeChanges(business, state.player.id)) {
    state.pushNotification({
      message: 'У вас недостаточно доли в бизнесе для внесения изменений (требуется минимум 50%)',
      title: 'Недостаточно прав',
      type: 'error',
    })
    return
  }

  // Если можем вносить изменения напрямую
  if (canMakeDirectChanges(business, state.player.id)) {
    switch (changeType) {
      case 'fund_collection':
        handleFundCollection(state, set, business, data.collectionAmount ?? 0)
        break
      case 'price':
      case 'quantity':
      case 'hire_employee':
      case 'fire_employee':
      case 'dividend':
      case 'auto_purchase':
      case 'change_role':
      case 'promote_employee':
      case 'demote_employee':
      case 'set_salary':
      case 'expand_storage':
      case 'marketing_campaign':
      case 'change_name':
      case 'sell_business':
        state.updateBusinessDirectly(businessId, {
          price: data.newPrice,
          quantity: data.newQuantity,
        })
        break
      case 'freeze':
        state.freezeBusiness(businessId)
        break
      case 'unfreeze':
        state.unfreezeBusiness(businessId)
        break
      case 'open_branch':
      case 'branch':
        state.openBranch(businessId)
        break
      case 'close_business':
        state.closeBusiness(businessId)
        break
    }
    return
  }

  if (requiresApproval(business, state.player.id)) {
    handleCreateProposal(state, set, business, changeType, data)
  } else {
    // Apply changes directly
    const directProposal: BusinessChangeProposal = {
      businessId,
      changeType,
      createdAt: state.turn,
      data,
      id: 'direct',
      initiatorId: state.player.id,
      initiatorName: state.player.name,
      status: 'approved',
    }
    applyProposal(state, directProposal, set)
  }
}
