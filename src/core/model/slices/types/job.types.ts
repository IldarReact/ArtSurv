import type { JobApplication } from '@/core/types'
import type { SkillRequirement } from '@/core/types/skill.types'
import type { StatEffect } from '@/core/types/stats.types'

export interface JobSlice {
  // ✅ Multiplayer Job Actions
  acceptExternalJob: (jobTitle: string, company: string, salary: number, businessId: string) => void

  acceptJobOffer: (applicationId: string) => void
  // Actions
  applyForJob: (
    jobTitle: string,
    company: string,
    salary: number,
    cost: StatEffect,
    requirements: SkillRequirement[],
  ) => void
  askForRaise: (jobId: string) => void
  pendingApplications: JobApplication[]

  quitJob: (jobId: string) => void
}
