'use client'

import { LogOut, TrendingUp, Briefcase, Zap, Heart, Smile, Brain, ShieldAlert } from 'lucide-react'
import React from 'react'

import { useInflatedPrices } from '@/core/hooks'
import type { Job } from '@/core/types'
import { InfoCard } from '@/shared/components/info-card'

interface UIJob extends Job {
  businessId?: string
  effortPercent?: number
  isBusinessRole?: boolean
  role?: string
}

interface CurrentJobsListProps {
  jobs: UIJob[]
  onAskForRaise: (jobId: string) => void
  onQuit: (jobId: string) => void
}

const NEGATIVE_STAT_COLOR = 'text-rose-400'

const STAT_CONFIG = {
  energy: {
    color: 'text-amber-400',
    icon: <Zap className="w-4 h-4" />,
    label: 'Энергия',
  },
  happiness: {
    color: 'text-green-400',
    icon: <Smile className="w-4 h-4" />,
    label: 'Счастье',
  },
  health: {
    color: 'text-red-400',
    icon: <Heart className="w-4 h-4" />,
    label: 'Здоровье',
  },
  intelligence: {
    color: 'text-blue-400',
    icon: <Brain className="w-4 h-4" />,
    label: 'Интеллект',
  },
  sanity: {
    color: 'text-purple-400',
    icon: <ShieldAlert className="w-4 h-4" />,
    label: 'Стресс',
  },
} as const

export function CurrentJobsList({ jobs, onAskForRaise, onQuit }: CurrentJobsListProps) {
  // Apply inflation to all jobs at once
  const jobsWithInflation = useInflatedPrices(jobs)

  const getStatDetails = (job: UIJob) => {
    const details: { color: string; icon: React.ReactNode; label: string; value: string }[] = []

    if (job.isBusinessRole && job.effortPercent !== undefined) {
      details.push({
        color: 'text-blue-400',
        icon: <Briefcase className="w-4 h-4" />,
        label: 'Занятость',
        value: `${String(job.effortPercent)}%`,
      })
    }

    Object.entries(STAT_CONFIG).forEach(([key, config]) => {
      const val = job.cost[key as keyof typeof job.cost]
      if (val) {
        details.push({
          color: val > 0 ? config.color : NEGATIVE_STAT_COLOR,
          icon: config.icon,
          label: config.label,
          value: val > 0 ? `+${String(val)}` : val.toString(),
        })
      }
    })

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
            actionIcon={<LogOut className="w-4 h-4 mr-2" />}
            actionLabel="Уволиться"
            actionVariant="destructive"
            details={getStatDetails(job)}
            imageUrl={job.imageUrl}
            key={job.id}
            onAction={() => {
              onQuit(job.id)
            }}
            onSecondaryAction={
              !isBusinessRole
                ? () => {
                    onAskForRaise(job.id)
                  }
                : undefined
            }
            secondaryActionIcon={
              !isBusinessRole ? <TrendingUp className="w-4 h-4 mr-2" /> : undefined
            }
            secondaryActionLabel={!isBusinessRole ? 'Повышение' : undefined}
            subtitle={job.company}
            title={job.title}
            value={`$${(job.salary || job.inflatedPrice).toLocaleString()}/мес`}
          />
        )
      })}
    </div>
  )
}
