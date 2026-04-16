'use client'

import React from 'react'

import type { BusinessProposal, Player } from '@/core/types'
import { SectionSeparator } from '@/shared/components/section-separator'

import { BusinessManagement } from '../business/business-management/business-management'
import { BusinessProposals } from '../business/components/business-proposals'

interface MyBusinessesSectionProps {
  businessProposals: BusinessProposal[]
  player: Player
}

export function MyBusinessesSection({ businessProposals, player }: MyBusinessesSectionProps) {
  if (player.businesses.length === 0) return null

  return (
    <div className="space-y-4">
      <SectionSeparator title="Мои бизнесы" />
      <div className="grid grid-cols-3 gap-4">
        {player.businesses.map((business) => {
          const proposalsCount = businessProposals.filter(
            (p) =>
              p.businessId === business.id && p.status === 'pending' && p.initiatorId !== player.id,
          ).length

          return (
            <BusinessManagement
              business={business}
              key={business.id}
              proposalsCount={proposalsCount}
            />
          )
        })}
      </div>

      <BusinessProposals />
    </div>
  )
}
