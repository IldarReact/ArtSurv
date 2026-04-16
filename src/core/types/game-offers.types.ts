import type { BusinessRoleTemplate, EmployeeRole } from './business.types'

/**
 * Универсальная система предложений (offers) между игроками
 */

// Типы предложений
export type OfferType =
  | 'job_offer' // Предложение работы
  | 'business_partnership' // Предложение открыть бизнес вместе
  | 'share_sale' // Предложение купить/продать долю бизнеса

// Статусы предложения
export type OfferStatus =
  | 'pending' // Ожидает ответа
  | 'accepted' // Принято
  | 'rejected' // Отклонено
  | 'expired' // Истекло
  | 'cancelled' // Отменено отправителем

// Детали предложения работы
export interface JobOfferDetails {
  businessId: string
  businessName: string
  description?: string
  kpiBonus: number // Процент бонуса за KPI
  role: EmployeeRole
  salary: number // Квартальная зарплата
}

// Детали предложения партнерства
export interface PartnershipOfferDetails {
  businessDescription: string
  businessId: string // ID создаваемого/существующего бизнеса
  businessName: string
  businessType: string
  employeeRoles: BusinessRoleTemplate[]
  partnerInvestment: number // Сумма инвестиций партнера
  partnerShare: number // Процент доли партнера
  totalCost: number
  yourInvestment: number // Сумма инвестиций получателя
  yourShare: number // Процент доли получателя
}

// Детали предложения купить/продать долю
export interface ShareSaleOfferDetails {
  businessId: string
  businessName: string
  currentValue: number // Текущая стоимость бизнеса
  price: number // Цена за долю
  sharePercent: number // Процент доли для продажи
}

// Объединенный тип деталей
export type OfferDetails = JobOfferDetails | PartnershipOfferDetails | ShareSaleOfferDetails

// Базовый интерфейс предложения
export interface BaseGameOffer {
  createdTurn: number
  expiresInTurns: number // Через сколько кварталов истечет
  // Отправитель
  fromPlayerId: string
  fromPlayerName: string
  id: string
  // Дополнительная информация
  message?: string // Сообщение от отправителя
  // Метаданные
  status: OfferStatus
  // Получатель
  toPlayerId: string
  toPlayerName: string
}

// Специализированные типы предложений
export interface JobOffer extends BaseGameOffer {
  details: JobOfferDetails
  type: 'job_offer'
}

export interface PartnershipOffer extends BaseGameOffer {
  details: PartnershipOfferDetails
  type: 'business_partnership'
}

export interface ShareSaleOffer extends BaseGameOffer {
  details: ShareSaleOfferDetails
  type: 'share_sale'
}

// Основной тип предложения - теперь это дискриминированное объединение
export type GameOffer = JobOffer | PartnershipOffer | ShareSaleOffer

// Type guards для проверки типа деталей
export function isJobOffer(offer: GameOffer): offer is JobOffer {
  return offer.type === 'job_offer'
}

export function isPartnershipOffer(offer: GameOffer): offer is PartnershipOffer {
  return offer.type === 'business_partnership'
}

export function isShareSaleOffer(
  offer: GameOffer,
): offer is GameOffer & { details: ShareSaleOfferDetails } {
  return offer.type === 'share_sale'
}

const RADIX_36 = 36
const ID_SLICE_START = 2
const ID_SLICE_END = 11

// Хелпер для создания ID
export function generateOfferId(): string {
  return `offer_${String(Date.now())}_${Math.random().toString(RADIX_36).slice(ID_SLICE_START, ID_SLICE_END)}`
}
