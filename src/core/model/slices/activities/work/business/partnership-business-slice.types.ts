import type { Business, BusinessChangeType, BusinessProposal } from '@/core/types/business.types'
import type {
  BusinessChangeApprovedEvent,
  BusinessChangeProposedEvent,
  BusinessChangeRejectedEvent,
  BusinessUpdatedEvent,
} from '@/core/types/events.types'

export type BusinessChangeProposal = BusinessProposal

export interface PartnershipBusinessSlice {
  approveBusinessChange: (proposalId: string) => void

  // Предложения изменений
  businessProposals: BusinessChangeProposal[]

  onBusinessChangeApproved: (event: BusinessChangeApprovedEvent) => void
  // Event handlers
  onBusinessChangeProposed: (event: BusinessChangeProposedEvent) => void

  onBusinessChangeRejected: (event: BusinessChangeRejectedEvent) => void

  onBusinessUpdated: (event: BusinessUpdatedEvent) => void
  // Actions
  proposeBusinessChange: (
    businessId: string,
    changeType: BusinessChangeType,
    data: BusinessChangeProposal['data'],
  ) => void
  rejectBusinessChange: (proposalId: string) => void
  // Прямые изменения (для владельцев с > 50%)
  updateBusinessDirectly: (
    businessId: string,
    changes: {
      price?: number
      quantity?: number
      state?: Business['state']
    },
  ) => void
}
