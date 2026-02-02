import type { Business, BusinessProposal, BusinessPartner } from '@/core/types/business.types'

const MIN_REASONABLE_PRICE = 4
const MAX_REASONABLE_PRICE = 8
const LOW_EFFICIENCY_THRESHOLD = 40
const HIGH_EFFICIENCY_THRESHOLD = 80
const FULL_STOCK_THRESHOLD = 0.8
const EMPTY_STOCK_THRESHOLD = 0.2
const CONSERVATIVE_CHANGE_THRESHOLD = 0.5
const BAD_RELATION_THRESHOLD = 30
const SPITE_VOTE_PROBABILITY = 0.3

/**
 * Рассчитывает голос NPC по предложению изменения цены
 */
function calculatePriceVote(proposal: BusinessProposal, business: Business): boolean {
  const newPrice = proposal.data.newPrice ?? business.price

  // Если цена в разумных пределах (4-8), то скорее всего ЗА
  if (newPrice >= MIN_REASONABLE_PRICE && newPrice <= MAX_REASONABLE_PRICE) return true

  // Если эффективность низкая, нужны перемены -> ЗА
  if (business.efficiency < LOW_EFFICIENCY_THRESHOLD) return true

  // Если эффективность высокая и цена растет -> ЗА (капитализация успеха)
  if (business.efficiency > HIGH_EFFICIENCY_THRESHOLD && newPrice > business.price) return true

  return false
}

/**
 * Рассчитывает голос NPC по предложению изменения объема производства
 */
function calculateQuantityVote(proposal: BusinessProposal, business: Business): boolean {
  const newQuantity = proposal.data.newQuantity ?? 0
  const currentStock = business.inventory.currentStock
  const maxStock = business.inventory.maxStock

  // Если склад почти полон (>80%) и мы снижаем производство -> ЗА
  if (currentStock > maxStock * FULL_STOCK_THRESHOLD && newQuantity < business.quantity) return true

  // Если склад почти пуст (<20%) и мы повышаем производство -> ЗА
  if (currentStock < maxStock * EMPTY_STOCK_THRESHOLD && newQuantity > business.quantity)
    return true

  // В остальных случаях NPC консервативен, если изменение резкое (>50%)
  const changePercent = Math.abs(newQuantity - business.quantity) / (business.quantity || 1)
  if (changePercent > CONSERVATIVE_CHANGE_THRESHOLD) return false

  return true
}

/**
 * Рассчитывает голос NPC по предложению
 */
export function calculateNPCVote(
  proposal: BusinessProposal,
  business: Business,
  partner: BusinessPartner,
): boolean {
  // Если отношение плохое, голосует против из вредности (с вероятностью 30%)
  if (partner.relation < BAD_RELATION_THRESHOLD && Math.random() < SPITE_VOTE_PROBABILITY) {
    return false
  }

  switch (proposal.changeType) {
    case 'price':
      return calculatePriceVote(proposal, business)

    case 'quantity':
      return calculateQuantityVote(proposal, business)

    case 'branch':
    case 'open_branch':
      // NPC всегда за расширение, если есть деньги
      return true

    case 'dividend':
      // Если денег много, то ЗА
      return true

    case 'hire_employee':
    case 'fire_employee':
    case 'freeze':
    case 'unfreeze':
    case 'auto_purchase':
    case 'change_role':
    case 'fund_collection':
    case 'promote_employee':
    case 'demote_employee':
    case 'set_salary':
    case 'expand_storage':
    case 'marketing_campaign':
    case 'change_name':
    case 'sell_business':
      // Для этих типов пока по умолчанию голосуем ЗА, если отношения нормальные
      return true

    default:
      return false
  }
}
