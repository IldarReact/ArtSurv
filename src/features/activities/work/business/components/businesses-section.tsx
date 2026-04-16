'use client'

import React from 'react'

import { useEconomy } from '@/core/hooks'
import { createBusinessPurchase } from '@/core/lib/business/purchase-logic'
import { getInflatedPrice } from '@/core/lib/calculations/price-helpers'
import type { BusinessTemplate } from '@/core/lib/data-loaders/businesses-loader'
import { useGameStore } from '@/core/model/store'
import type { Business } from '@/core/types'

import { AllBusinessesDialog } from './all-businesses-dialog'

interface BusinessesSectionProps {
  onError: (message: string) => void
  onOpenBusiness: (business: Business, upfrontCost: number) => void
  onSuccess: (message: string) => void
  playerCash: number
}

export function BusinessesSection({
  onError,
  onOpenBusiness,
  onSuccess,
  playerCash,
}: BusinessesSectionProps) {
  const player = useGameStore((state) => state.player)
  const sendOffer = useGameStore((state) => state.sendOffer)
  const currentTurn = useGameStore((state) => state.turn)

  const playerEnergy = player?.stats.energy ?? 0
  const economy = useEconomy()

  const handleOpenWithPartner = (
    partnerId: string,
    partnerName: string,
    playerShare: number,
    template: BusinessTemplate,
  ) => {
    if (playerEnergy < 20) {
      onError('Недостаточно энергии для открытия бизнеса с партнером! (нужно 20)')
      return
    }

    const inflatedCost = economy
      ? getInflatedPrice(template.initialCost, economy, 'business')
      : template.initialCost

    const { cost: playerInvestment } = createBusinessPurchase(
      {
        description: template.description ?? '',
        employeeRoles: template.employeeRoles,
        id: template.id,
        initialCost: template.initialCost,
        maxEmployees: template.maxEmployees,
        minEmployees: template.minEmployees,
        monthlyExpenses: template.monthlyExpenses,
        monthlyIncome: template.monthlyIncome,
        name: template.name,
        type: template.type,
        upfrontPaymentPercentage: template.upfrontPaymentPercentage ?? 20,
      },
      inflatedCost,
      currentTurn,
      {
        partnerId,
        partnerName,
        playerShare,
      },
    )

    const partnerInvestment = inflatedCost - playerInvestment

    if (playerCash < playerInvestment) {
      onError('Недостаточно средств для вашей доли инвестиций!')
      return
    }

    sendOffer(
      'business_partnership',
      partnerId,
      partnerName,
      {
        businessDescription: template.description ?? '',
        businessId: `biz_${String(Date.now())}`,
        businessName: template.name,
        businessType: template.type,
        employeeRoles: template.employeeRoles,
        partnerInvestment: partnerInvestment,
        partnerShare: 100 - playerShare,
        totalCost: inflatedCost,
        yourInvestment: playerInvestment,
        yourShare: playerShare,
      },
      `Предлагаю открыть ${template.name} вместе!`,
    )

    onSuccess(`Предложение отправлено ${partnerName}!`)
  }

  return (
    <AllBusinessesDialog
      onError={onError}
      onOpenBusiness={onOpenBusiness}
      onOpenWithPartner={handleOpenWithPartner}
      onSuccess={onSuccess}
      playerCash={playerCash}
      playerEnergy={playerEnergy}
    />
  )
}
