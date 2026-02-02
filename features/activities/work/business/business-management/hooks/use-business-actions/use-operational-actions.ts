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

  return {
    handlePriceChange,
    handleQuantityChange,
  }
}
