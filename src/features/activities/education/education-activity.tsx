'use client'

import React from 'react'

import { FeedbackAnimation } from '@/shared/components/feedback-animation'

import { useEducation } from './hooks/use-education'
import { ActiveEducationSection } from './sections/active-education-section'
import { CoursesSection } from './sections/courses-section'
import { SkillsSection } from './sections/skills-section'
import { UniversitySection } from './sections/university-section'

export function EducationActivity(): React.JSX.Element | null {
  const {
    activeCourses,
    activeUniversity,
    currentCountry,
    feedback,
    getInflatedCoursePrice,
    handleCourseEnroll,
    handleUniversityApply,
    hasActiveEducation,
    hasSkills,
    player,
    setFeedback,
    skills,
  } = useEducation()

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
        <SkillsSection hasSkills={hasSkills} skills={skills} />

        <ActiveEducationSection
          activeCourses={activeCourses}
          activeUniversity={activeUniversity}
          hasActiveEducation={hasActiveEducation}
        />

        <UniversitySection
          currentCountryName={currentCountry?.name}
          getInflatedCoursePrice={getInflatedCoursePrice}
          handleUniversityApply={handleUniversityApply}
        />

        <CoursesSection
          getInflatedCoursePrice={getInflatedCoursePrice}
          handleCourseEnroll={handleCourseEnroll}
        />
      </div>
    </React.Fragment>
  )
}
