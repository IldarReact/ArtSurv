import React from 'react'

import type { ActiveUniversity, ActiveCourse } from '@/core/types'
import { SectionSeparator } from '@/shared/components/section-separator'

import { ActiveEducationCard } from '../components/active-education-card'

interface ActiveEducationSectionProps {
  activeCourses: ActiveCourse[]
  activeUniversity: ActiveUniversity[]
  hasActiveEducation: boolean
}

export const ActiveEducationSection: React.FC<ActiveEducationSectionProps> = ({
  activeCourses,
  activeUniversity,
  hasActiveEducation,
}) => {
  if (!hasActiveEducation) return null

  return (
    <div className="space-y-4">
      <SectionSeparator title="В процессе обучения" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeUniversity.map((uni) => (
          <ActiveEducationCard
            energy={uni.costPerTurn?.energy ?? 0}
            key={uni.id}
            progress={uni.totalDuration - uni.remainingDuration}
            title={uni.programName}
            total={uni.totalDuration}
          />
        ))}
        {activeCourses.map((course) => (
          <ActiveEducationCard
            energy={course.costPerTurn?.energy ?? 0}
            key={course.id}
            progress={course.totalDuration - course.remainingDuration}
            title={course.courseName}
            total={course.totalDuration}
          />
        ))}
      </div>
    </div>
  )
}
