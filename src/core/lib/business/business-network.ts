import type { Business, BusinessType } from '@/core/types/business.types'

/**
 * Утилиты для работы с сетью филиалов бизнеса
 */

/**
 * Проверяет, нужно ли создать сеть для бизнеса
 * Сеть создается, когда игрок открывает второй бизнес того же типа
 */
export function shouldCreateNetwork(
  existingBusinesses: Business[],
  newBusinessType: BusinessType,
): boolean {
  const sameTypeBusinesses = existingBusinesses.filter(
    (b) => b.type === newBusinessType && b.state !== 'frozen',
  )

  // Если это будет второй бизнес этого типа, создаем сеть
  return sameTypeBusinesses.length === SINGLE_BUSINESS_COUNT
}

const BASE_MARKETING_BONUS = 5
const BASE_REPUTATION_BONUS = 3
const EXTRA_BRANCH_BONUS = 2
const MIN_NETWORK_BRANCHES = 2
const SINGLE_BUSINESS_COUNT = 1

/**
 * Создает ID сети на основе типа бизнеса и временной метки
 */
export function generateNetworkId(businessType: BusinessType): string {
  return `network_${businessType}_${String(Date.now())}`
}

/**
 * Находит главный филиал в сети
 */
export function findMainBranch(businesses: Business[], networkId: string): Business | null {
  return businesses.find((b) => b.networkId === networkId && b.isMainBranch) ?? null
}

/**
 * Находит все филиалы в сети (включая главный)
 */
export function findNetworkBranches(businesses: Business[], networkId: string): Business[] {
  return businesses.filter((b) => b.networkId === networkId)
}

/**
 * Находит все филиалы в сети (исключая главный)
 */
export function findSubordinateBranches(businesses: Business[], networkId: string): Business[] {
  return businesses.filter((b) => b.networkId === networkId && !b.isMainBranch)
}

/**
 * Синхронизирует цену из главного филиала во все подчиненные
 */
export function syncPriceToNetwork(
  businesses: Business[],
  networkId: string,
  newPrice: number,
): Business[] {
  return businesses.map((business) => {
    if (business.networkId === networkId) {
      return {
        ...business,
        price: newPrice,
      }
    }
    return business
  })
}

/**
 * Создает сеть для существующего бизнеса и нового
 * Существующий бизнес становится главным
 */
export function createNetworkForBusinesses(
  existingBusiness: Business,
  newBusiness: Business,
): { main: Business; branch: Business; networkId: string } {
  const networkId = generateNetworkId(existingBusiness.type)

  const mainBranch: Business = {
    ...existingBusiness,
    isMainBranch: true,
    networkBonus: {
      marketingBonus: BASE_MARKETING_BONUS, // +5% к маркетингу
      reputationBonus: BASE_REPUTATION_BONUS, // +3% к репутации
    },
    networkId,
  }

  const subordinateBranch: Business = {
    ...newBusiness,
    isMainBranch: false,
    networkBonus: {
      marketingBonus: BASE_MARKETING_BONUS,
      reputationBonus: BASE_REPUTATION_BONUS,
    },
    networkId,
    price: existingBusiness.price, // Наследуем цену от главного
  }

  return { branch: subordinateBranch, main: mainBranch, networkId }
}

/**
 * Добавляет новый филиал к существующей сети
 */
export function addBranchToNetwork(
  newBusiness: Business,
  networkId: string,
  mainBranchPrice: number,
): Business {
  return {
    ...newBusiness,
    isMainBranch: false,
    networkBonus: {
      marketingBonus: BASE_MARKETING_BONUS,
      reputationBonus: BASE_REPUTATION_BONUS,
    },
    networkId,
    price: mainBranchPrice, // Наследуем цену от главного
  }
}

/**
 * Проверяет, может ли бизнес изменять цену
 * Только главный филиал может менять цену
 */
export function canChangePrice(business: Business): boolean {
  // Если нет сети, может менять
  if (!business.networkId) {
    return true
  }

  // Если есть сеть, только главный филиал может менять
  return business.isMainBranch
}

/**
 * Рассчитывает бонусы сети на основе количества филиалов
 */
export function calculateNetworkBonuses(branchCount: number): {
  marketingBonus: number
  reputationBonus: number
} {
  // Базовые бонусы
  const baseMarketing = BASE_MARKETING_BONUS
  const baseReputation = BASE_REPUTATION_BONUS

  // Дополнительные бонусы за каждый филиал сверх 2
  const extraBranches = Math.max(0, branchCount - MIN_NETWORK_BRANCHES)
  const bonusPerBranch = EXTRA_BRANCH_BONUS

  return {
    marketingBonus: baseMarketing + extraBranches * bonusPerBranch,
    reputationBonus: baseReputation + extraBranches * bonusPerBranch,
  }
}

/**
 * Обновляет бонусы сети для всех филиалов
 */
export function updateNetworkBonuses(businesses: Business[], networkId: string): Business[] {
  const branches = findNetworkBranches(businesses, networkId)
  const bonuses = calculateNetworkBonuses(branches.length)

  return businesses.map((business) => {
    if (business.networkId === networkId) {
      return {
        ...business,
        networkBonus: bonuses,
      }
    }
    return business
  })
}

/**
 * Получает информацию о сети
 */
export function getNetworkInfo(
  businesses: Business[],
  networkId: string,
): {
  branchCount: number
  mainBranch: Business | null
  subordinateBranches: Business[]
  totalIncome: number
  totalExpenses: number
  bonuses: { marketingBonus: number; reputationBonus: number }
} {
  const branches = findNetworkBranches(businesses, networkId)
  const mainBranch = findMainBranch(businesses, networkId)
  const subordinateBranches = findSubordinateBranches(businesses, networkId)

  const totalIncome = branches.reduce((sum, b) => sum + b.quarterlyIncome, 0)
  const totalExpenses = branches.reduce((sum, b) => sum + b.quarterlyExpenses, 0)

  const bonuses = calculateNetworkBonuses(branches.length)

  return {
    bonuses,
    branchCount: branches.length,
    mainBranch,
    subordinateBranches,
    totalExpenses,
    totalIncome,
  }
}
