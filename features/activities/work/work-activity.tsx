'use client'

import React from 'react'

import { FeedbackAnimation } from '@/shared/components/feedback-animation'

import { useWorkActivity } from './hooks/use-work-activity'
import { ActiveFreelanceSection } from './sections/active-freelance-section'
import { CurrentJobsSection } from './sections/current-jobs-section'
import { EarningOpportunitiesSection } from './sections/earning-opportunities-section'
import { MyBusinessesSection } from './sections/my-businesses-section'

export function WorkActivity(): React.JSX.Element | null {
  const {
    allJobs,
    businessProposals,
    feedback,
    handleApply,
    handleAskForRaise,
    handleCompleteGig,
    handleFreelanceApply,
    openBusiness,
    player,
    quitJob,
    setFeedback,
    unassignPlayerRole,
  } = useWorkActivity()

  if (!player) return null

  return (
    <React.Fragment>
      <FeedbackAnimation
        message={feedback.message}
        onComplete={() => {
          setFeedback({ message: '', show: false, success: false })
        }}
        show={feedback.show}
        success={feedback.success}
      />

      <div className="space-y-8 pb-10">
        <ActiveFreelanceSection gigs={player.activeFreelanceGigs} onComplete={handleCompleteGig} />

        <MyBusinessesSection businessProposals={businessProposals} player={player} />

        <CurrentJobsSection
          askForRaise={handleAskForRaise}
          jobs={allJobs}
          quitJob={quitJob}
          unassignPlayerRole={unassignPlayerRole}
        />

        <EarningOpportunitiesSection
          onApply={handleApply}
          onOpenBusiness={openBusiness}
          onTakeOrder={handleFreelanceApply}
          playerCash={player.stats.money}
          setFeedback={setFeedback}
        />
      </div>
    </React.Fragment>
  )
}
