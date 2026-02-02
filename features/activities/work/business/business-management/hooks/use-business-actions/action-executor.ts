import { canMakeDirectChanges, requiresApproval } from '@/core/lib/business/partnership-permissions'
import { useGameStore } from '@/core/model/store'
import type { Business } from '@/core/types'
import type { BusinessChangeType, BusinessProposal } from '@/core/types/business.types'

export function useBusinessActionExecutor(business: Business | undefined) {
  const { player, proposeBusinessChange, pushNotification } = useGameStore()

  const executeAction = ({
    directAction,
    errorMessage = 'У вас недостаточно доли в бизнесе для выполнения этого действия',
    errorTitle = 'Недостаточно прав',
    notificationMessage,
    notificationTitle,
    proposalData,
    proposalType,
  }: {
    directAction: () => void
    proposalType: BusinessChangeType
    proposalData: BusinessProposal['data']
    notificationTitle: string
    notificationMessage: string
    errorTitle?: string
    errorMessage?: string
  }) => {
    if (!business) {
      return
    }

    if (business.partners.length > 0 && player) {
      const canDirect = canMakeDirectChanges(business, player.id)
      const needsApproval = requiresApproval(business, player.id)

      if (canDirect) {
        directAction()
      } else if (needsApproval) {
        proposeBusinessChange(business.id, proposalType, proposalData)

        pushNotification({
          message: notificationMessage,
          title: notificationTitle,
          type: 'info',
        })
      } else {
        pushNotification({
          message: errorMessage,
          title: errorTitle,
          type: 'error',
        })
      }
    } else {
      directAction()
    }
  }

  return { executeAction, player }
}
