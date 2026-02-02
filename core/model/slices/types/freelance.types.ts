import type { FreelanceApplication } from '@/core/types'
import type { SkillRequirement } from '@/core/types/skill.types'
import type { StatEffect } from '@/core/types/stats.types'

export interface FreelanceSlice {
  acceptFreelanceGig: (applicationId: string) => void

  // Actions
  applyForFreelance: (
    gigId: string,
    title: string,
    payment: number,
    cost: StatEffect,
    requirements: SkillRequirement[],
    duration: number,
  ) => void
  completeFreelanceGig: (gigId: string) => void
  pendingFreelanceApplications: FreelanceApplication[]
}
