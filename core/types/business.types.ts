// Business-related types

import type { Progressable } from './progress.types'
import type { StatEffect } from './stats.types'

export type EmployeeRole =
  | 'manager' // Управляющий
  | 'salesperson' // Продавец
  | 'accountant' // Бухгалтер
  | 'marketer' // Маркетолог
  | 'technician' // Техник/специалист
  | 'worker' // Рабочий
  | 'lawyer' // Юрист
  | 'hr' // HR-менеджер

export const STAR_1 = 1
export const STAR_2 = 2
export const STAR_3 = 3
export const STAR_4 = 4
export const STAR_5 = 5

export const PERCENT_MIN = 0
export const PERCENT_MAX = 100
export const NEUTRAL_RELATION = 50

export type EmployeeStars =
  | typeof STAR_1
  | typeof STAR_2
  | typeof STAR_3
  | typeof STAR_4
  | typeof STAR_5

export interface EmployeeSkills {
  efficiency: number // 0-100 - общая эффективность
  loyalty?: number // 0-100 - лояльность
  stressResistance?: number // 0-100 - стрессоустойчивость
}

export interface Employee {
  avatar?: string
  effortPercent?: number // Процент занятости (10-100)
  experience: number // Кварталы работы в компании
  familyMemberId?: string
  humanTraits: string[] // ID черт характера из human-traits.json
  id: string
  isFamilyMember?: boolean
  name: string
  productivity: number // 0-100 - текущая продуктивность (влияет на KPI)
  role: EmployeeRole
  salary: number // Ежеквартальная зарплата (базовая)
  skills: EmployeeSkills
  stars: EmployeeStars
}

/**
 * Доступная позиция в бизнесе для найма
 */
export interface BusinessPosition {
  description: string
  priority?: 'required' | 'recommended' | 'optional'
  role: EmployeeRole
  salary: number
}

/**
 * Роль в бизнесе с описанием и приоритетом (из конфига/шаблона)
 */
export interface BusinessRoleTemplate {
  description: string
  priority: 'required' | 'recommended' | 'optional'
  role: EmployeeRole
}

/**
 * Влияние роли на бизнес (результат)
 */
export interface StaffImpactResult {
  efficiencyBase?: number // Базовое значение эффективности (абсолютное)
  efficiencyMultiplier?: number // Бонус к эффективности команды (в процентах)
  expenseReduction?: number
  legalProtection?: number // Снижение шанса негативных событий
  reputationBonus?: number
  salesBonus?: number
  staffProductivityBonus?: number // Бонус к продуктивности остальных сотрудников
  taxReduction?: number
}

/**
 * Влияние игрока на бизнес
 */
export interface PlayerBusinessImpact {
  efficiencyBase: number
  efficiencyMultiplier: number
  expenseReduction: number
  legalProtection: number
  reputationBonus: number
  salesBonus: number
  staffProductivityBonus: number
  taxReduction: number
}

export type BusinessType =
  | 'retail' // Магазин
  | 'service' // Сервис
  | 'cafe' // Кафе/ресторан
  | 'tech' // IT-компания
  | 'manufacturing' // Производство
  | 'food' // Еда (для совместимости с данными)

export type BusinessState = 'opening' | 'active' | 'frozen'

export interface BusinessInventory {
  autoPurchaseAmount: number // Сколько закупать каждый квартал
  currentStock: number
  maxStock: number
  pricePerUnit: number // Цена продажи (внутренняя, для расчетов)
  purchaseCost: number // Цена закупки
}

export interface EmployeeData {
  baseSalaries: Record<EmployeeRole, number>
  firstNames: string[]
  humanTraits: string[]
  lastNames: string[]
  roleDescriptions: Record<EmployeeRole, { strengths: string[]; weaknesses: string[] }>
  roleModifiers: Record<EmployeeRole, StaffImpactResult>
  starMultipliers: number[]
}

export interface BusinessFinancials {
  cashFlow: number
  debug?: {
    productionCapacity?: number
    salesVolume: number
    marketDemand: number
    purchaseAmount: number
    purchaseCost: number
    priceUsed: number
    unitCost: number
    taxAmount: number
    opEx: number
    cogs: number
    grossProfit: number
    expensesBreakdown: {
      employees: number
      inventory: number
      marketing: number
      rent: number
      equipment: number
      other: number
    }
  }
  expenses: number
  income: number
  netProfit: number
  newInventory: BusinessInventory
  playerStatEffects: StatEffect
  profit: number
  taxAmount: number
}

export type PartnerType = 'player' | 'npc'

export interface BusinessPartner {
  id: string
  investedAmount: number
  name: string
  relation: number // 0-100, 50 = нейтрально
  share: number // 0-100%
  type: PartnerType
}

export type BusinessChangeType =
  | 'price' // Изменение цены
  | 'quantity' // Изменение количества
  | 'hire_employee' // Наем сотрудника
  | 'fire_employee' // Увольнение сотрудника
  | 'freeze' // Заморозка бизнеса
  | 'unfreeze' // Разморозка бизнеса
  | 'open_branch' // Открытие филиала
  | 'branch' // Открытие филиала (alias)
  | 'dividend' // Вывод дивидендов
  | 'auto_purchase' // Изменение автозакупки
  | 'change_role' // Изменение роли игрока
  | 'fund_collection' // Сбор средств партнёрами
  | 'promote_employee' // Повышение сотрудника
  | 'demote_employee' // Понижение сотрудника
  | 'set_salary' // Изменение зарплаты сотрудника
  | 'expand_storage' // Расширение склада
  | 'marketing_campaign' // Маркетинговая кампания
  | 'change_name' // Изменение названия
  | 'sell_business' // Продажа бизнеса

export interface BusinessProposal {
  businessId: string
  changeType: BusinessChangeType
  createdAt: number
  data: {
    // Для price
    newPrice?: number

    // Для dividend
    amount?: number

    // Для quantity
    newQuantity?: number

    // Для hire_employee
    employeeId?: string
    employeeName?: string
    employeeRole?: string
    employeeSalary?: number
    employeeStars?: number
    isPlayer?: boolean
    skills?: EmployeeSkills
    experience?: number
    humanTraits?: string[]

    // Для fire_employee
    fireEmployeeId?: string
    fireEmployeeName?: string

    // Для open_branch
    branchName?: string
    branchCost?: number

    // Для auto_purchase
    autoPurchaseAmount?: number

    // Для change_role
    newRole?: string
    oldRole?: string
    // Дополнительные поля для случая, когда игрок вступает в роль (используется как hire_employee для игрока)
    isMe?: boolean

    // Для fund_collection
    collectionAmount?: number

    // Для promote_employee / demote_employee
    newSalary?: number
    newStars?: number
    promoteEmployeeId?: string
    promoteEmployeeName?: string
    demoteEmployeeId?: string
    demoteEmployeeName?: string
    salaryEmployeeId?: string
    salaryEmployeeName?: string

    // Для expand_storage
    storageExpansion?: number

    // Для marketing_campaign
    campaignCost?: number
    campaignType?: string

    // Для change_name
    newName?: string

    // Для sell_business
    sellPrice?: number
  }
  id: string
  initiatorId: string
  initiatorName: string
  status: 'pending' | 'approved' | 'rejected'
  votes?: Record<string, boolean>
}

export interface BusinessEvent {
  description: string
  effects: StatEffect & {
    reputation?: number
    efficiency?: number
  }
  id: string
  title: string
  turn: number
  type: 'positive' | 'negative'
}

export interface BusinessGoal {
  id: string
  title: string
  description: string
  target: number
  current: number
  isCompleted: boolean
  type: 'price' | 'quantity' | 'revenue'
}

export interface Business {
  autoPurchaseAmount: number
  branches?: string[] // ID филиалов
  createdAt: number
  creationCost: StatEffect // Энергия, потраченная при создании (один раз)
  currentValue: number // Текущая стоимость бизнеса
  description: string
  efficiency: number // 0-100
  employeeRoles: BusinessRoleTemplate[] // Структурированные роли из шаблона
  // Сотрудники
  employees: Employee[]
  // История и события
  eventsHistory: BusinessEvent[]
  foundedTurn: number
  hasInsurance: boolean // Есть ли страховка
  id: string
  // Метаданные
  imageUrl?: string
  // Финансы
  initialCost: number // Стартовый капитал
  insuranceCost: number // Стоимость страховки за квартал
  // Склад и товары
  inventory: BusinessInventory

  isMainBranch: boolean
  isServiceBased: boolean

  lastQuarterlyUpdate: number
  lastQuarterSummary?: {
    sold: number
    priceUsed: number
    salesIncome: number
    taxes: number
    expenses: number
    netProfit: number
    reputationChange?: number
    efficiencyChange?: number
    profitDistribution?: { partnerId: string; share: number; amount: number }[]
    expensesBreakdown?: {
      employees: number
      inventory: number
      marketing: number
      rent: number
      equipment: number
      other: number
    }
  }
  // Последние затраты статов на управление для текущего игрока за квартал
  lastRoleEnergyCost?: number
  lastRoleSanityCost?: number
  maxEmployees: number // Максимум сотрудников
  minEmployees: number // Минимум сотрудников всего
  monthlyExpenses: number

  monthlyIncome: number
  name: string
  networkBonus?: {
    // Бонусы от сети
    marketingBonus: number
    reputationBonus: number
  }

  networkId?: string

  // Открытие
  openingProgress?: Progressable & {
    /** @deprecated use totalDuration */
    totalQuarters: number // Сколько кварталов нужно для открытия
    /** @deprecated use remainingDuration */
    quartersLeft: number // Сколько осталось
    investedAmount: number // Сколько уже вложено
    totalCost: number // Общая стоимость
    upfrontCost: number // Сумма, списанная сразу (регистрация, лицензии)
  }
  // Филиалы и сеть (старая система, оставляем для совместимости)
  parentId?: string // Если это филиал
  // Партнерские отношения
  partnerBusinessId?: string // ID бизнеса партнера
  partnerId?: string // ID партнера-игрока

  partnerName?: string // Имя партнера

  partners: BusinessPartner[]
  // ✅ НОВОЕ: Работа игрока в бизнесе
  /**
   * Информация о работе игрока в этом бизнесе
   * Если игрок устроился работать в свой бизнес, это поле содержит детали
   */
  playerEmployment?: {
    role: EmployeeRole
    salary: number
    startedTurn: number
    experience: number // Кварталы работы (для инфляции)
    effortPercent?: number
    productivity?: number // Текущая продуктивность (0-100)
  }

  playerInvestment?: number // Инвестиции текущего игрока
  // Роли игрока в бизнесе
  playerRoles: {
    // Управленческие роли (можно выполнять несколько одновременно)
    managerialRoles: EmployeeRole[] // Список активных управленческих ролей

    // Операционная роль (только одна, полный рабочий день)
    operationalRole: EmployeeRole | null // Текущая операционная роль или null
  }

  playerShare?: number // Доля текущего игрока в %
  price: number
  proposals: BusinessProposal[]

  // Кооперация
  // partners уже определены выше

  quantity: number

  quarterlyExpenses: number // Расходы за последний квартал
  quarterlyIncome: number // Доход за последний квартал
  quarterlyTax: number // Налог за последний квартал
  // Характеристики
  reputation: number // 0-100
  state: BusinessState

  businessGoals?: BusinessGoal[]

  // Налоги и страховка
  taxRate: number // Ставка налога (0-100, например 15 = 15%)

  type: BusinessType
  valuation: number // Оценка стоимости бизнеса
  walletBalance?: number // Деньги бизнеса (кошелёк для операций)
}

export interface EmployeeCandidate {
  avatar?: string
  countryId?: string
  experience: number
  humanTraits: string[] // ID черт характера из human-traits.json
  id: string
  meetsRequirements?: boolean
  name: string
  requestedSalary: number // За квартал
  role: EmployeeRole
  skills: EmployeeSkills
  stars: EmployeeStars
}
