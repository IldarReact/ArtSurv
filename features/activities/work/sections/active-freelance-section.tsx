'use client'

import { CheckCircle } from 'lucide-react'
import React from 'react'

import { useInflatedPrices } from '@/core/hooks'
import type { ActiveFreelanceGig } from '@/core/types'
import { Progress } from '@/shared/ui/progress'
import { SectionSeparator } from '@/shared/ui/section-separator'

interface ActiveFreelanceSectionProps {
  gigs: ActiveFreelanceGig[]
}

export function ActiveFreelanceSection({ gigs }: ActiveFreelanceSectionProps) {
  // Map gigs to priceable items
  const gigsWithPrices = gigs.map((gig) => ({
    ...gig,
    price: gig.payment,
    category: 'services' as const,
  }))
  const inflatedGigs = useInflatedPrices(gigsWithPrices) as Array<
    ActiveFreelanceGig & { inflatedPrice: number; title: string; id: string }
  >

  if (gigs.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <SectionSeparator title="Активные заказы" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inflatedGigs.map((gig) => {
          const progress = ((gig.totalDuration - gig.remainingDuration) / gig.totalDuration) * 100

          return (
            <div
              key={gig.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">{gig.title}</h4>
                  <span className="text-green-400 font-bold">
                    ${gig.inflatedPrice.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Прогресс выполнения</span>
                    <span>
                      {gig.totalDuration - gig.remainingDuration} / {gig.totalDuration} кв.
                    </span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-amber-400/60 italic">
                <CheckCircle className="w-3 h-3" />
                Выполняется автоматически...
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
