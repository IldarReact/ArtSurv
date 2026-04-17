import type { Business } from '@/core/types'

import { useBusinessActionExecutor } from './action-executor'

export function useOperationalActions(business: Business | undefined) {
  const { executeAction } = useBusinessActionExecutor(business)

  const handlePriceChange = (
    newPrice: number,
    onChangePrice: (businessId: string, price: number) => void,
  ) => {
    if (!business) return

    executeAction({
      directAction: () => {
        onChangePrice(business.id, newPrice)
      },
      errorMessage: 'У вас недостаточно доли в бизнесе для изменения цены (требуется минимум 50%)',
      notificationMessage: `Предложение об изменении цены на ${String(newPrice)} отправлено партнёру`,
      notificationTitle: 'Предложение отправлено',
      proposalData: { newPrice },
      proposalType: 'price',
    })
  }

  const handleQuantityChange = (
    newQuantity: number,
    onSetQuantity: (businessId: string, quantity: number) => void,
  ) => {
    if (!business) return

    executeAction({
      directAction: () => {
        onSetQuantity(business.id, newQuantity)
      },
      errorMessage:
        'У вас недостаточно доли в бизнесе для изменения производства (требуется минимум 50%)',
      notificationMessage: `Предложение об изменении производства на ${String(newQuantity)} отправлено партнёру`,
      notificationTitle: 'Предложение отправлено',
      proposalData: { newQuantity },
      proposalType: 'quantity',
    })
  }

  const handleFreezeBusiness = (onFreezeBusiness: (businessId: string) => void) => {
    if (!business) return

    executeAction({
      directAction: () => {
        onFreezeBusiness(business.id)
      },
      errorMessage:
        'У вас недостаточно доли в бизнесе для заморозки бизнеса (требуется минимум 50%)',
      notificationMessage: 'Предложение о заморозке бизнеса отправлено партнёру',
      notificationTitle: 'Предложение отправлено',
      proposalData: {},
      proposalType: 'freeze',
    })
  }

  const handleUnfreezeBusiness = (onUnfreezeBusiness: (businessId: string) => void) => {
    if (!business) return

    executeAction({
      directAction: () => {
        onUnfreezeBusiness(business.id)
      },
      errorMessage:
        'У вас недостаточно доли в бизнесе для разморозки бизнеса (требуется минимум 50%)',
      notificationMessage: 'Предложение о разморозке бизнеса отправлено партнёру',
      notificationTitle: 'Предложение отправлено',
      proposalData: {},
      proposalType: 'unfreeze',
    })
  }

  const handleOpenBranch = (onOpenBranch: (businessId: string) => void) => {
    if (!business) return

    executeAction({
      directAction: () => {
        onOpenBranch(business.id)
      },
      errorMessage:
        'У вас недостаточно доли в бизнесе для открытия филиала (требуется минимум 50%)',
      notificationMessage: 'Предложение об открытии филиала отправлено партнёру',
      notificationTitle: 'Предложение отправлено',
      proposalData: {},
      proposalType: 'open_branch',
    })
  }

  const handleCloseBusiness = (onCloseBusiness: (businessId: string) => void) => {
    if (!business) return

    executeAction({
      directAction: () => {
        onCloseBusiness(business.id)
      },
      errorMessage:
        'У вас недостаточно доли в бизнесе для закрытия бизнеса (требуется минимум 50%)',
      notificationMessage: 'Предложение о закрытии бизнеса отправлено партнёру',
      notificationTitle: 'Предложение отправлено',
      proposalData: {},
      proposalType: 'close_business',
    })
  }

  return {
    handleCloseBusiness,
    handleFreezeBusiness,
    handleOpenBranch,
    handlePriceChange,
    handleQuantityChange,
    handleUnfreezeBusiness,
  }
}
