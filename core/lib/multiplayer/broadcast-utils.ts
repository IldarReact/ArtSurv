import type { Business, Player } from '@/core/types'

import { broadcastEvent } from './index'

/**
 * Отправляет широковещательное сообщение об обновлении списка сотрудников бизнеса
 */
export function broadcastBusinessEmployeesUpdate(business: Business, player: Player) {
  broadcastEvent({
    fromPlayerId: player.id,
    payload: {
      businessId: business.id,
      changes: {
        employees: business.employees,
        playerEmployment: business.playerEmployment,
        playerRoles: business.playerRoles,
      },
    },
    type: 'BUSINESS_UPDATED',
  })
}
