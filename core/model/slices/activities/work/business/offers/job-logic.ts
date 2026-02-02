import { broadcastEvent } from '@/core/lib/multiplayer'
import type { JobOffer } from '@/core/types'
import type { Business, BusinessPartner, EmployeeRole } from '@/core/types/business.types'

import type { GameStore } from '../../../../types'

const DEFAULT_EMPLOYEE_STARS = 3

export interface JobOfferAcceptedPayload {
  businessId: string
  employeeId: string
  employeeName: string
  offerId: string
  role: EmployeeRole
  salary: number
}

export function handleAcceptJobOffer(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  offer: JobOffer,
) {
  if (!state.player) return

  // 1. Принимаем предложение работы
  state.joinBusinessAsEmployee(offer.details.businessId, offer.details.role, offer.details.salary)

  // 2. Уведомляем работодателя (отправителя)
  const payload: JobOfferAcceptedPayload = {
    businessId: offer.details.businessId,
    employeeId: state.player.id,
    employeeName: state.player.name,
    offerId: offer.id,
    role: offer.details.role,
    salary: offer.details.salary,
  }

  broadcastEvent({
    payload,
    toPlayerId: offer.fromPlayerId,
    type: 'JOB_OFFER_ACCEPTED',
  })

  // 3. Обновляем статус предложения
  set((state) => ({
    offers: state.offers.map((o) => (o.id === offer.id ? { ...o, status: 'accepted' } : o)),
  }))

  // 4. Уведомляем игрока
  state.pushNotification({
    message: `Вы устроились в "${offer.details.businessName}" на должность ${offer.details.role}`,
    title: 'Работа принята',
    type: 'success',
  })
}

export function handleOnJobOfferAccepted(
  state: GameStore,
  set: (fn: (state: GameStore) => Partial<GameStore>) => void,
  payload: JobOfferAcceptedPayload,
) {
  if (!state.player) return

  const business = state.player.businesses.find((b) => b.id === payload.businessId)

  if (business?.partners && business.partners.length > 0) {
    const APPROVAL_THRESHOLD = 50
    const TOTAL_SHARE = 100
    const requiresApproval = (business: Business, playerId: string) => {
      const partner = business.partners.find((p: BusinessPartner) => p.id === playerId)

      let partnersShareSum = 0
      for (const p of business.partners) {
        partnersShareSum += p.share
      }

      const share = partner?.share ?? TOTAL_SHARE - partnersShareSum
      return share <= APPROVAL_THRESHOLD
    }

    if (requiresApproval(business, state.player.id)) {
      state.proposeBusinessChange(payload.businessId, 'hire_employee', {
        employeeId: payload.employeeId,
        employeeName: payload.employeeName,
        employeeRole: payload.role,
        employeeSalary: payload.salary,
        employeeStars: DEFAULT_EMPLOYEE_STARS,
        isMe: false,
        isPlayer: true,
      })

      set((state) => ({
        offers: state.offers.map((o) =>
          o.id === payload.offerId ? { ...o, status: 'accepted' } : o,
        ),
      }))

      state.pushNotification({
        message: `${payload.employeeName} принял оффер. Создано предложение о найме для партнера.`,
        title: 'Оффер принят, создано предложение',
        type: 'info',
      })
      return
    }
  }

  state.addEmployeeToBusiness(
    payload.businessId,
    payload.employeeName,
    payload.role,
    payload.salary,
    payload.employeeId,
  )

  set((state) => ({
    offers: state.offers.map((o) => (o.id === payload.offerId ? { ...o, status: 'accepted' } : o)),
  }))

  state.pushNotification({
    message: `${payload.employeeName} принял ваше предложение и устроился на должность ${payload.role}`,
    title: 'Сотрудник нанят',
    type: 'success',
  })
}
