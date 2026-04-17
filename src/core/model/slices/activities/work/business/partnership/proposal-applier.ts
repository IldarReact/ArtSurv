import { getPlayerShare } from '@/core/lib/business/partnership-permissions'
import type { Business, EmployeeRole, EmployeeStars } from '@/core/types/business.types'

import type { GameStore } from '../../../../types'
import type { BusinessChangeProposal } from '../partnership-business-slice.types'

export function applyProposal(
  state: GameStore,
  proposal: BusinessChangeProposal,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
): Record<string, unknown> | null {
  const { businessId, changeType, data } = proposal
  const business = state.player?.businesses.find((b) => b.id === businessId)

  if (!business || !state.player) return {}

  // Common helper to update proposal status and other state
  const approveAndSet = (updateFn: (state: GameStore) => Partial<GameStore>) => {
    set((state) => ({
      ...updateFn(state),
      businessProposals: state.businessProposals.map((p) =>
        p.id === proposal.id ? { ...p, status: 'approved' as const } : p,
      ),
    }))
  }

  switch (changeType) {
    case 'price':
      if (typeof data.newPrice === 'number') {
        state.changePrice(businessId, data.newPrice)
      }
      approveAndSet(() => ({}))
      return { price: data.newPrice }

    case 'quantity':
      if (typeof data.newQuantity === 'number') {
        state.setQuantity(businessId, data.newQuantity)
      }
      approveAndSet(() => ({}))
      return { quantity: data.newQuantity }

    case 'fund_collection':
      return handleFundCollection(state, business, data, approveAndSet)

    case 'hire_employee':
      return handleHireEmployee(state, businessId, data, proposal, approveAndSet)

    case 'change_role':
      return handleChangeRole(state, businessId, data, proposal, approveAndSet)

    case 'fire_employee':
      return handleFireEmployee(state, businessId, data, approveAndSet)

    case 'promote_employee':
    case 'demote_employee':
      return handleEmployeePromotion(state, businessId, data, approveAndSet)

    case 'freeze':
      state.freezeBusiness(businessId)
      approveAndSet(() => ({}))
      return { state: 'frozen' }

    case 'unfreeze':
      state.unfreezeBusiness(businessId)
      approveAndSet(() => ({}))
      return { state: 'active' }

    case 'auto_purchase':
      if (data.autoPurchaseAmount !== undefined) {
        state.setAutoPurchase(businessId, data.autoPurchaseAmount ?? 0)
        approveAndSet(() => ({}))
        return { autoPurchaseAmount: data.autoPurchaseAmount }
      }
      return {}

    case 'set_salary':
      if (data.employeeId && data.employeeSalary !== undefined) {
        state.updateEmployeeInBusiness(businessId, data.employeeId, {
          salary: data.employeeSalary,
        })
        approveAndSet(() => ({}))
      }
      return {}

    case 'open_branch':
    case 'branch':
      if (typeof state.openBranch === 'function') {
        state.openBranch(businessId)
      }
      approveAndSet(() => ({}))
      return {}

    case 'close_business':
      if (typeof state.closeBusiness === 'function') {
        state.closeBusiness(businessId)
      }
      approveAndSet(() => ({}))
      return { isClosed: true }

    case 'dividend':
      approveAndSet(() => ({}))
      return {}

    case 'expand_storage':
    case 'marketing_campaign':
    case 'change_name':
    case 'sell_business':
      // Future or specific logic
      return {}

    default:
      return null
  }
}

function handleHireEmployee(
  state: GameStore,
  businessId: string,
  data: BusinessChangeProposal['data'],
  proposal: BusinessChangeProposal,
  approveAndSet: (updateFn: (state: GameStore) => Partial<GameStore>) => void,
): Record<string, unknown> {
  state.addEmployeeToBusiness(
    businessId,
    data.employeeName ?? 'Unknown',
    data.employeeRole as EmployeeRole,
    data.employeeSalary ?? 0,
    data.isMe ? proposal.initiatorId : undefined,
    {
      experience: data.experience,
      humanTraits: data.humanTraits,
      skills: data.skills,
      stars: data.employeeStars as EmployeeStars,
    },
  )
  approveAndSet(() => ({}))
  return {}
}

function handleChangeRole(
  state: GameStore,
  businessId: string,
  data: BusinessChangeProposal['data'],
  proposal: BusinessChangeProposal,
  approveAndSet: (updateFn: (state: GameStore) => Partial<GameStore>) => void,
): Record<string, unknown> {
  if (data.isMe) {
    state.addEmployeeToBusiness(
      businessId,
      proposal.initiatorName,
      data.employeeRole as EmployeeRole,
      data.employeeSalary ?? 0,
      proposal.initiatorId,
      {
        experience: data.experience,
        humanTraits: data.humanTraits,
        skills: data.skills,
        stars: data.employeeStars as EmployeeStars,
      },
    )
  } else if (data.employeeId) {
    state.updateEmployeeInBusiness(businessId, data.employeeId, {
      role: data.employeeRole as EmployeeRole,
      salary: data.employeeSalary,
    })
  }
  approveAndSet(() => ({}))
  return {}
}

function handleFireEmployee(
  state: GameStore,
  businessId: string,
  data: BusinessChangeProposal['data'],
  approveAndSet: (updateFn: (state: GameStore) => Partial<GameStore>) => void,
): Record<string, unknown> {
  if (data.fireEmployeeId) {
    if (data.isMe) {
      state.leaveBusinessJob(businessId)
    } else {
      state.fireEmployee(businessId, data.fireEmployeeId)
    }
  }
  approveAndSet(() => ({}))
  return {}
}

function handleEmployeePromotion(
  state: GameStore,
  businessId: string,
  data: BusinessChangeProposal['data'],
  approveAndSet: (updateFn: (state: GameStore) => Partial<GameStore>) => void,
): Record<string, unknown> {
  if (data.employeeId) {
    state.updateEmployeeInBusiness(businessId, data.employeeId, {
      salary: data.newSalary,
      stars: data.newStars as EmployeeStars,
    })
  }
  approveAndSet(() => ({}))
  return {}
}

function handleFundCollection(
  state: GameStore,
  business: Business,
  data: BusinessChangeProposal['data'],
  approveAndSet: (updateFn: (state: GameStore) => Partial<GameStore>) => void,
): Record<string, unknown> | null {
  const amount = data.collectionAmount ?? 0
  const playerShare = getPlayerShare(business, state.player?.id ?? '')
  const PERCENT_MIN = 0
  const PERCENT_MAX = 100
  const contribution = Math.round(
    amount * (Math.max(PERCENT_MIN, Math.min(PERCENT_MAX, playerShare)) / PERCENT_MAX),
  )

  if (contribution > 0) {
    // Списываем деньги через транзакцию
    if (
      !state.performTransaction(
        { money: -contribution },
        { title: `Взнос в бизнес ${business.name}` },
      )
    ) {
      return null
    }

    approveAndSet(() => {
      state.updatePlayer((prev) => ({
        businesses: prev.businesses.map((b) =>
          b.id === business.id ? { ...b, walletBalance: (b.walletBalance ?? 0) + contribution } : b,
        ),
      }))
      return {}
    })
    return {
      walletBalance: (business.walletBalance ?? 0) + contribution,
    }
  } else {
    approveAndSet(() => ({}))
    return {}
  }
}
