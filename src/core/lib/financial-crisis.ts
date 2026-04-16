import { getCrisisOptions } from '@/core/lib/data-loaders/static-data-loader'
import type { CountryEconomy, EconomicEvent } from '@/core/types/economy.types'
import type { Player } from '@/core/types/game.types'

/**
 * Критический порог баланса для финансового кризиса
 */
export const FINANCIAL_CRISIS_THRESHOLD = 0

/**
 * Проверяет, находится ли игрок в финансовом кризисе
 */
export function isInFinancialCrisis(balance: number): boolean {
  return balance < FINANCIAL_CRISIS_THRESHOLD
}

/**
 * Варианты выхода из финансового кризиса
 */
export interface CrisisExitOption {
  available: boolean
  description: string
  id: string
  title: string
  type: 'sell_asset' | 'emergency_loan' | 'family_help' | 'bankruptcy'
  unavailableReason?: string
}

interface CrisisOptionTemplate {
  description?: string
  descriptionTemplate?: string
  emptyDescription?: string
  id: string
  noFamilyDescription?: string
  title: string
  type: 'sell_asset' | 'emergency_loan' | 'family_help' | 'bankruptcy'
  unavailableDescription?: string
  unavailableReason?: string
}

/**
 * Получает доступные варианты выхода из кризиса
 */
export function getCrisisExitOptions(player: Player): CrisisExitOption[] {
  const staticOptions = getCrisisOptions() as CrisisOptionTemplate[]
  const options: CrisisExitOption[] = []

  // 1. Продажа активов
  const sellAssetsOpt = staticOptions.find((o) => o.type === 'sell_asset')
  if (sellAssetsOpt) {
    options.push(createSellAssetsOption(player, sellAssetsOpt))
  }

  // 2. Экстренный кредит
  const loanOpt = staticOptions.find((o) => o.type === 'emergency_loan')
  if (loanOpt) {
    options.push(createEmergencyLoanOption(player, loanOpt))
  }

  // 3. Помощь семьи
  const familyOpt = staticOptions.find((o) => o.type === 'family_help')
  if (familyOpt) {
    options.push(createFamilyHelpOption(player, familyOpt))
  }

  // 4. Банкротство
  const bankruptcyOpt = staticOptions.find((o) => o.type === 'bankruptcy')
  if (bankruptcyOpt) {
    options.push({
      available: true,
      description: bankruptcyOpt.description ?? '',
      id: bankruptcyOpt.id,
      title: bankruptcyOpt.title,
      type: 'bankruptcy',
    })
  }

  return options
}

function createSellAssetsOption(player: Player, template: CrisisOptionTemplate): CrisisExitOption {
  const sellableAssets = player.assets.filter((a) => a.value > 0)
  const totalValue = sellableAssets.reduce((sum, a) => sum + a.value, 0)

  return {
    available: sellableAssets.length > 0,
    description:
      sellableAssets.length > 0
        ? (template.descriptionTemplate ?? '')
            .replace('{count}', String(sellableAssets.length))
            .replace('{value}', totalValue.toLocaleString())
        : (template.emptyDescription ?? 'Нет активов'),
    id: template.id,
    title: template.title,
    type: 'sell_asset',
  }
}

const MAX_DEBTS_BEFORE_LOAN_RESTRICTION = 3
const MIN_RELATIONS_FOR_FAMILY_HELP = 50
const EMERGENCY_LOAN_BUFFER = 1.2
const FAMILY_HELP_MONTHS = 3

function createEmergencyLoanOption(
  player: Player,
  template: CrisisOptionTemplate,
): CrisisExitOption {
  const canTakeLoan = player.debts.length < MAX_DEBTS_BEFORE_LOAN_RESTRICTION
  return {
    available: canTakeLoan,
    description: template.description ?? '',
    id: template.id,
    title: template.title,
    type: 'emergency_loan',
    unavailableReason: canTakeLoan ? undefined : template.unavailableReason,
  }
}

function createFamilyHelpOption(player: Player, template: CrisisOptionTemplate): CrisisExitOption {
  const hasFamily = player.personal.familyMembers.length > 0
  const relationsSum = player.personal.familyMembers.reduce((sum, m) => sum + m.relationLevel, 0)
  const familyRelations = relationsSum / Math.max(1, player.personal.familyMembers.length)
  const canAskFamily = hasFamily && familyRelations > MIN_RELATIONS_FOR_FAMILY_HELP

  return {
    available: canAskFamily,
    description: canAskFamily
      ? (template.description ?? '')
      : hasFamily
        ? (template.unavailableDescription ?? 'Отношения плохие')
        : (template.noFamilyDescription ?? 'Нет семьи'),
    id: template.id,
    title: template.title,
    type: 'family_help',
    unavailableReason: canAskFamily ? undefined : template.unavailableReason,
  }
}

/**
 * Генерирует экономическое событие кризиса для страны
 */
export function generateCrisisEconomicEvent(countryId: string, turn: number): EconomicEvent {
  return {
    description: 'Массовые банкротства граждан привели к экономическому кризису в стране',
    duration: 4, // 1 год (4 квартала)
    effects: {
      gdpGrowthChange: -2, // -2% к росту ВВП
      inflationChange: 5, // +5% к инфляции
      keyRateChange: 3, // +3% к ключевой ставке
      salaryModifierChange: -0.1, // -10% к зарплатам
      unemploymentChange: 2, // +2% безработица
    },
    id: `crisis_${countryId}_${String(turn)}`,
    title: '📉 Финансовый кризис',
    turn,
    type: 'crisis',
  }
}

/**
 * Применяет эффекты кризиса к экономике страны
 */
export function applyCrisisToCountry(
  country: CountryEconomy,
  event: EconomicEvent,
): CountryEconomy {
  return {
    ...country,
    activeEvents: [...country.activeEvents, event],
    gdpGrowth: country.gdpGrowth + (event.effects.gdpGrowthChange ?? 0),
    inflation: Math.max(0, country.inflation + (event.effects.inflationChange ?? 0)),
    keyRate: Math.max(0, country.keyRate + (event.effects.keyRateChange ?? 0)),
    salaryModifier: Math.max(
      0.5,
      country.salaryModifier + (event.effects.salaryModifierChange ?? 0),
    ),
    unemployment: Math.min(
      100,
      Math.max(0, country.unemployment + (event.effects.unemploymentChange ?? 0)),
    ),
  }
}

/**
 * Рассчитывает сумму экстренного кредита
 */
export function calculateEmergencyLoanAmount(deficit: number): number {
  // Кредит покрывает дефицит + 20% запас
  return Math.ceil(Math.abs(deficit) * EMERGENCY_LOAN_BUFFER)
}

/**
 * Рассчитывает помощь от семьи
 */
export function calculateFamilyHelp(familyMembers: Player['personal']['familyMembers']): number {
  // Семья может помочь суммой, равной их совокупному доходу за квартал
  let totalIncome = 0
  for (const m of familyMembers) {
    totalIncome += m.income
  }
  return totalIncome * FAMILY_HELP_MONTHS // Помощь = доход за 3 месяца
}
