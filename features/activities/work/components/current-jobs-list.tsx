'use client'

import { LogOut, TrendingUp, Briefcase, Zap, Heart, Smile, Brain, ShieldAlert } from 'lucide-react'
import React from 'react'

import { useInflatedPrices } from '@/core/hooks'
import type { Job } from '@/core/types'
import { InfoCard } from '@/shared/ui/info-card'

interface UIJob extends Job {
  isBusinessRole?: boolean
  businessId?: string
  role?: string
  effortPercent?: number
}

interface CurrentJobsListProps {
  jobs: UIJob[]
  onQuit: (jobId: string) => void
  onAskForRaise: (jobId: string) => void
}

export function CurrentJobsList({ jobs, onQuit, onAskForRaise }: CurrentJobsListProps) {
  // Apply inflation to all jobs at once
  const jobsWithInflation = useInflatedPrices(jobs)

  const getStatDetails = (job: UIJob) => {
    const details = []

    if (job.isBusinessRole && job.effortPercent !== undefined) {
      details.push({
        label: 'Занятость',
        value: `${job.effortPercent}%`,
        icon: <Briefcase className="w-4 h-4" />,
        color: 'text-blue-400',
      })
    }

    if (job.cost) {
      const { energy, health, happiness, intelligence, sanity } = job.cost

      if (energy) {
        details.push({
          label: 'Энергия',
          value: energy > 0 ? `+${energy}` : energy,
          icon: <Zap className="w-4 h-4" />,
          color: energy > 0 ? 'text-amber-400' : 'text-rose-400',
        })
      }
      if (health) {
        details.push({
          label: 'Здоровье',
          value: health > 0 ? `+${health}` : health,
          icon: <Heart className="w-4 h-4" />,
          color: health > 0 ? 'text-red-400' : 'text-rose-400',
        })
      }
      if (happiness) {
        details.push({
          label: 'Счастье',
          value: happiness > 0 ? `+${happiness}` : happiness,
          icon: <Smile className="w-4 h-4" />,
          color: happiness > 0 ? 'text-green-400' : 'text-rose-400',
        })
      }
      if (intelligence) {
        details.push({
          label: 'Интеллект',
          value: intelligence > 0 ? `+${intelligence}` : intelligence,
          icon: <Brain className="w-4 h-4" />,
          color: intelligence > 0 ? 'text-blue-400' : 'text-rose-400',
        })
      }
      if (sanity) {
        details.push({
          label: 'Стресс',
          value: sanity > 0 ? `+${sanity}` : sanity,
          icon: <ShieldAlert className="w-4 h-4" />,
          color: sanity > 0 ? 'text-purple-400' : 'text-rose-400',
        })
      }
    }

    return details
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
        <p className="text-white/50">Вы пока что нигде не работаете</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobsWithInflation.map((job) => {
        const isBusinessRole = job.isBusinessRole

        return (
          <InfoCard
            key={job.id}
            title={job.title}
            subtitle={job.company}
            value={`$${(job.salary || job.inflatedPrice)?.toLocaleString()}/мес`}
            imageUrl={job.imageUrl}
            details={getStatDetails(job)}
            onAction={() => onQuit(job.id)}
            actionLabel="Уволиться"
            actionIcon={<LogOut className="w-4 h-4 mr-2" />}
            actionVariant="destructive"
            onSecondaryAction={
              !isBusinessRole
                ? () => {
                    onAskForRaise(job.id)
                  }
                : undefined
            }
            secondaryActionLabel={!isBusinessRole ? 'Повышение' : undefined}
            secondaryActionIcon={
              !isBusinessRole ? <TrendingUp className="w-4 h-4 mr-2" /> : undefined
            }
          />
        )
      })}
    </div>
  )
}
