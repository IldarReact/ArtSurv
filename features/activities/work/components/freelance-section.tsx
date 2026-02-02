'use client'

import { Laptop } from 'lucide-react'
import React from 'react'

import { useInflatedPrices } from '@/core/hooks'
import { getFreelanceGigs } from '@/core/lib/data-loaders/freelance-loader'
import { useGameStore } from '@/core/model/store'
import type { SkillLevel } from '@/core/types'
import { OpportunityCard } from '@/features/activities/components/opportunity-card'

import { FreelanceDetailCard } from './freelance-detail-card'

interface FreelanceSectionProps {
  onTakeOrder: (
    gigId: string,
    title: string,
    payment: number,
    energyCost: number,
    requirements: { skill: string; level: SkillLevel }[],
    duration: number,
  ) => void
}

export function FreelanceSection({ onTakeOrder }: FreelanceSectionProps) {
  const player = useGameStore((state) => state.player)
  const countryId = player?.countryId ?? 'us'

  const gigs = getFreelanceGigs(countryId)
  const gigsWithInflation = useInflatedPrices(gigs.map((g) => ({ ...g, salary: g.payment })))

  return (
    <OpportunityCard
      actionLabel="Искать заказы"
      description="Работайте на себя, выполняя заказы. Гибкий график, но нестабильный доход. Отличный вариант для подработки."
      icon={<Laptop className="w-6 h-6 text-amber-400" />}
      image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
      title="Фриланс"
    >
      <div className="space-y-4">
        <p className="text-white/60 mb-4">
          Выполняйте разовые заказы, чтобы заработать дополнительные деньги и улучшить навыки.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gigsWithInflation.map((gig, idx) => {
            const originalGig = gigs[idx]
            return (
              <FreelanceDetailCard
                category={originalGig.category}
                description={originalGig.title}
                duration={originalGig.duration}
                energyCost={Math.abs(originalGig.cost.energy ?? 0)}
                image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop"
                key={originalGig.id}
                onApply={() => {
                  onTakeOrder(
                    originalGig.id,
                    originalGig.title,
                    gig.inflatedPrice,
                    Math.abs(originalGig.cost.energy ?? 0),
                    originalGig.requirements.map((r) => ({
                      level: r.minLevel,
                      skill: r.skillId,
                    })),
                    originalGig.duration,
                  )
                }}
                payment={gig.inflatedPrice}
                requirements={originalGig.requirements.map((r) => ({
                  level: r.minLevel,
                  skill: r.skillId,
                }))}
                title={originalGig.title}
              />
            )
          })}
        </div>
      </div>
    </OpportunityCard>
  )
}
