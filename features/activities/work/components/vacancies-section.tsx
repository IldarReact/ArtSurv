'use client'

import { Briefcase } from 'lucide-react'
import React from 'react'

import { useInflatedPrices } from '@/core/hooks'
import { getAllJobsForCountry } from '@/core/lib/data-loaders/jobs-loader'
import { useGameStore } from '@/core/model/store'
import type { StatEffect } from '@/core/types'
import { OpportunityCard } from '@/features/activities/components/opportunity-card'

import { VacancyDetailCard } from './vacancy-detail-card'

interface VacanciesSectionProps {
  onApply: (
    title: string,
    company: string,
    salary: number,
    cost: StatEffect,
    requirements: { skill: string; level: number }[],
  ) => void
}

export function VacanciesSection({ onApply }: VacanciesSectionProps) {
  const player = useGameStore((state) => state.player)
  const pendingApplications = useGameStore((state) => state.pendingApplications)
  const countryId = player?.countryId ?? 'us'

  const jobs = getAllJobsForCountry(countryId)
  const jobsWithInflation = useInflatedPrices(jobs)

  const appliedJobTitles = new Set(pendingApplications.map((app) => app.jobTitle))

  return (
    <OpportunityCard
      actionLabel="Смотреть вакансии"
      description="Просмотрите вакансии на рынке труда. Откликнитесь сейчас, чтобы получить ответ в следующем квартале."
      icon={<Briefcase className="w-6 h-6 text-blue-400" />}
      image="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=600&fit=crop"
      title="Найти новую работу"
    >
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-200">
            ℹ️ Процесс найма занимает время. После отклика вы получите ответ (оффер или отказ) в
            начале следующего квартала.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {jobsWithInflation.map((job) => {
            const isApplied = appliedJobTitles.has(job.title)
            return (
              <VacancyDetailCard
                company={job.company}
                energyCost={job.cost.energy ?? 0}
                image={job.imageUrl}
                isApplied={isApplied}
                jobCost={job.cost}
                key={job.id}
                onApply={() => {
                  onApply(
                    job.title,
                    job.company,
                    job.inflatedPrice,
                    job.cost,
                    job.requirements?.skills?.map((s) => ({ level: s.level, skill: s.name })) ?? [],
                  )
                }}
                requirements={
                  job.requirements?.skills?.map((s) => ({ level: s.level, skill: s.name })) ?? []
                }
                salary={job.inflatedPrice}
                title={job.title}
              />
            )
          })}
        </div>
      </div>
    </OpportunityCard>
  )
}
