import type { Business, BusinessChangeType } from '@/core/types/business.types'

const MAJORITY_SHARE_THRESHOLD = 50
const FULL_SHARE = 100
const RADIX_BASE_36 = 36
const SLICE_START = 2
const SLICE_END = 9

/**
 * Проверяет, может ли игрок вносить изменения в бизнес без согласования
 * @returns true если доля > 50%
 */
export function canMakeDirectChanges(business: Business, playerId: string): boolean {
  const playerShare = getPlayerShare(business, playerId)
  return playerShare > MAJORITY_SHARE_THRESHOLD
}

/**
 * Проверяет, требуется ли согласование для изменений (доля = 50%)
 * @returns true если доля = 50%
 */
export function requiresApproval(business: Business, playerId: string): boolean {
  const playerShare = getPlayerShare(business, playerId)
  return playerShare === MAJORITY_SHARE_THRESHOLD
}

/**
 * Проверяет, может ли игрок вообще предлагать изменения
 * @returns true если доля >= 50%
 */
export function canProposeChanges(business: Business, playerId: string): boolean {
  const playerShare = getPlayerShare(business, playerId)
  return playerShare >= MAJORITY_SHARE_THRESHOLD
}

/**
 * Получает долю игрока в бизнесе
 */
export function getPlayerShare(business: Business, playerId: string): number {
  // Если это партнёрский бизнес с playerShare
  if (business.playerShare !== undefined) {
    return business.playerShare
  }

  // Ищем в списке партнёров
  const partner = business.partners.find((p) => p.id === playerId)
  if (partner) {
    return partner.share
  }

  // Если партнёров нет, игрок владеет 100%
  if (business.partners.length === 0) {
    return FULL_SHARE
  }

  return 0
}

/**
 * Получает партнёра по бизнесу
 */
export function getBusinessPartner(business: Business, playerId: string) {
  // Ищем в списке партнёров (приоритет)
  const partner = business.partners.find((p) => {
    return p.id !== playerId && p.type === 'player'
  })

  if (partner) {
    return {
      businessId: business.partnerBusinessId, // Используем partnerBusinessId из бизнеса
      id: partner.id,
      name: partner.name,
    }
  }

  // Если есть partnerId и это не текущий игрок (fallback)
  if (business.partnerId && business.partnerId !== playerId) {
    return {
      businessId: business.partnerBusinessId,
      id: business.partnerId,
      name: business.partnerName ?? 'Партнёр',
    }
  }

  return null
}

/**
 * Проверяет, является ли изменение критичным (требует согласования даже при > 50%)
 */
export function isCriticalChange(changeType: BusinessChangeType): boolean {
  // Можно расширить список критичных изменений
  const criticalChanges: BusinessChangeType[] = ['freeze']
  return criticalChanges.includes(changeType)
}

/**
 * Генерирует ID для предложения изменения
 */
export function generateProposalId(): string {
  return `proposal_${String(Date.now())}_${Math.random().toString(RADIX_BASE_36).slice(SLICE_START, SLICE_END)}`
}
