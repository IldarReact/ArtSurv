'use client'

import React from 'react'

import type { Job, EmployeeRole } from '@/core/types'
import { SectionSeparator } from '@/shared/components/section-separator'

import { CurrentJobsList } from '../components/current-jobs-list'

interface UIJob extends Job {
  businessId?: string
  isBusinessRole?: boolean
  role?: EmployeeRole
}

interface CurrentJobsSectionProps {
  askForRaise: (jobId: string) => void
  jobs: UIJob[]
  quitJob: (jobId: string) => void
  unassignPlayerRole: (businessId: string, role: EmployeeRole) => void
}

export function CurrentJobsSection({
  askForRaise,
  jobs,
  quitJob,
  unassignPlayerRole,
}: CurrentJobsSectionProps) {
  return (
    <div className="space-y-4">
      <SectionSeparator title="Текущие работы" />
      <CurrentJobsList
        jobs={jobs}
        onAskForRaise={askForRaise}
        onQuit={(jobId) => {
          const businessJob = jobs.find((j) => j.id === jobId && j.isBusinessRole)
          if (businessJob?.businessId && businessJob.role) {
            unassignPlayerRole(businessJob.businessId, businessJob.role)
          } else {
            quitJob(jobId)
          }
        }}
      />
    </div>
  )
}
