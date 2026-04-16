import type { BusinessProposal, BusinessChangeType } from '@/core/types/business.types'

import type { GameStateCreator, BusinessSlice } from '../../../types'

export const createPartnershipsSlice: GameStateCreator<Partial<BusinessSlice>> = (set, get) => ({
  addPartnerToBusiness: (
    businessId: string,
    partnerId: string,
    partnerName: string,
    share: number,
    investment: number,
  ) => {
    const state = get()
    if (!state.player) return

    const i = state.player.businesses.findIndex((b) => b.id === businessId)
    if (i === -1) return

    const business = state.player.businesses[i]

    const ownerPartner = business.partners.find(
      (p) => p.type === 'player' && p.id === state.player?.id,
    )

    let updatedPartners = [...business.partners]

    if (!ownerPartner) {
      updatedPartners.push({
        id: state.player.id,
        investedAmount: business.initialCost,
        name: state.player.name,
        relation: 100,
        share: 100,
        type: 'player',
      })
    }

    updatedPartners = updatedPartners.map((p) =>
      p.id === state.player?.id ? { ...p, share: Math.max(0, p.share - share) } : p,
    )

    let currentSum = 0
    for (const p of updatedPartners) {
      currentSum += p.share
    }
    const available = Math.max(0, 100 - currentSum)
    const finalShare = Math.min(share, available)
    if (finalShare <= 0) {
      state.pushNotification({
        message: 'Нельзя назначить долю партнёру: сумма долей превышает 100%',
        title: 'Недостаточная доступная доля',
        type: 'error',
      })
      return
    }

    updatedPartners.push({
      id: partnerId,
      investedAmount: investment,
      name: partnerName,
      relation: 50,
      share: finalShare,
      type: 'player',
    })

    const updatedBusiness = { ...business, partners: updatedPartners }

    state.updatePlayer((prev) => {
      const businesses = [...prev.businesses]
      businesses[i] = updatedBusiness
      return { businesses }
    })
  },

  // leaveBusinessJob remains delegated to employees slice; keep a thin wrapper
  leaveBusinessJob: (businessId: string) => {
    const s = get()
    if (typeof s.leaveBusinessJob === 'function') {
      s.leaveBusinessJob(businessId)
      return
    }
  },

  proposeAction: (
    businessId: string,
    changeType: BusinessChangeType,
    data: BusinessProposal['data'],
  ) => {
    const state = get()
    if (!state.player) return

    const business = state.player.businesses.find((b) => b.id === businessId)
    if (!business) return

    // Compute player's share
    const playerPartner = business.partners.find((p) => p.type === 'player')
    const playerShare = playerPartner?.share ?? 100

    // If player has controlling share, perform immediately
    const CONTROLLING_SHARE = 50
    if (playerShare > CONTROLLING_SHARE) {
      switch (changeType) {
        case 'price':
          if (data.newPrice !== undefined) get().changePrice(businessId, data.newPrice)
          break
        case 'quantity':
          if (data.newQuantity !== undefined) get().setQuantity(businessId, data.newQuantity)
          break
        case 'hire_employee':
        case 'fire_employee':
        case 'freeze':
        case 'unfreeze':
        case 'open_branch':
        case 'branch':
        case 'dividend':
        case 'auto_purchase':
        case 'change_role':
        case 'fund_collection':
        case 'promote_employee':
        case 'demote_employee':
        case 'set_salary':
          // These might also be immediate if share > 50, but currently we leave them for proposal flow or implement later
          break
        case 'expand_storage':
        case 'marketing_campaign':
        case 'change_name':
        case 'sell_business':
          break
        default:
          // Other actions require proposal
          break
      }
      if (changeType === 'price' || changeType === 'quantity') return
    }

    const proposal: BusinessProposal = {
      businessId,
      changeType,
      createdAt: Date.now(),
      data,
      id: `prop_${String(Date.now())}`,
      initiatorId: playerPartner?.id ?? 'player',
      initiatorName: state.player.name,
      status: 'pending',
      votes: { [playerPartner?.id ?? 'player']: true },
    }

    // В онлайн-партнёрстве решение принимают только игроки.
    // Предложение остаётся pending до получения голосов других игроков.

    state.updatePlayer((prev) => ({
      businesses: prev.businesses.map((b) =>
        b.id === businessId ? { ...b, proposals: [...b.proposals, proposal] } : b,
      ),
    }))
  },
})
