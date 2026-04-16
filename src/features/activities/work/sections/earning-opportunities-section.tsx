'use client'

import React from 'react'

import type { SkillLevel, StatEffect } from '@/core/types'
import type { Business } from '@/core/types/business.types'
import { SectionSeparator } from '@/shared/components/section-separator'

import { BusinessesSection } from '../business/components/businesses-section'
import { FreelanceSection } from '../components/freelance-section'
import { StartupsSection } from '../components/startups-section'
import { VacanciesSection } from '../components/vacancies-section'

interface FeedbackState {
  message: string
  show: boolean
  success: boolean
}

interface EarningOpportunitiesSectionProps {
  onApply: (
    title: string,
    company: string,
    salary: number,
    cost: StatEffect,
    requirements: { skill: string; level: number }[],
  ) => void
  onOpenBusiness: (business: Business, upfrontCost: number) => void
  onTakeOrder: (
    gigId: string,
    title: string,
    payment: number,
    energyCost: number,
    requirements: { skill: string; level: SkillLevel }[],
    duration: number,
  ) => void
  playerCash: number
  setFeedback: React.Dispatch<React.SetStateAction<FeedbackState>>
}

export function EarningOpportunitiesSection({
  onApply,
  onOpenBusiness,
  onTakeOrder,
  playerCash,
  setFeedback,
}: EarningOpportunitiesSectionProps) {
  return (
    <div className="space-y-4">
      <SectionSeparator title="Возможности заработка" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <VacanciesSection onApply={onApply} />
        <StartupsSection />
        <BusinessesSection
          onError={(message) => {
            setFeedback({ message, show: true, success: false })
          }}
          onOpenBusiness={onOpenBusiness}
          onSuccess={(message) => {
            setFeedback({ message, show: true, success: true })
          }}
          playerCash={playerCash}
        />
        <FreelanceSection onTakeOrder={onTakeOrder} />
      </div>
    </div>
  )
}
