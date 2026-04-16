// Finance-related types (assets and debts)

export type AssetType = 'housing' | 'real_estate' | 'stock' | 'business' | 'deposit'
export type DebtType = 'mortgage' | 'consumer_credit' | 'student_loan'

export interface Asset {
  currentValue: number // Текущая стоимость
  expenses: number // Расходы за месяц (обслуживание)
  id: string
  income: number // Доход за месяц (дивиденды, рента)
  lastSoldPrice?: number // Цена последней продажи (если продавался)
  liquidity: 'low' | 'medium' | 'high'
  name: string
  purchasePrice: number // Цена покупки
  quantity?: number
  risk: 'low' | 'medium' | 'high'
  soldAt?: number // Квартал продажи
  stockSymbol?: string
  type: AssetType
  unrealizedGain: number // Нереализованная прибыль (currentValue - purchasePrice)
  value: number // Deprecated: use currentValue instead
}

export interface Debt {
  id: string
  interestRate: number // Процентная ставка (годовая)
  name: string
  principalAmount: number // Основная сумма кредита
  quarterlyInterest: number // Проценты в платеже за квартал
  quarterlyPayment: number // Общий платеж за квартал
  quarterlyPrincipal: number // Основной долг в платеже за квартал
  remainingAmount: number // Остаток долга
  remainingQuarters: number // Осталось кварталов
  startTurn: number // Когда взят кредит
  termQuarters: number // Срок в кварталах (всегда кратно 1, т.е. 3 месяца)
  type: DebtType
}

export interface IncomeBreakdown {
  assetIncome: number // Доход от активов (дивиденды, рента)
  businessRevenue: number // Доход от бизнеса
  capitalGains: number // Прибыль от продажи активов
  familyIncome: number // Доход от семьи
  salary: number // Зарплата
  total: number // Общий доход
}

export interface ExpensesBreakdown {
  assetMaintenance: number // Обслуживание активов
  business: number // Расходы бизнеса
  credits: number // Потребительские кредиты
  debtInterest: number // Общие проценты (сумма credits + mortgage)
  family: number // Deprecated: теперь распределено по категориям
  food: number // Еда
  housing: number // Жилье

  living: number // Общие расходы на жизнь (сумма категорий ниже)
  mortgage: number // Ипотека
  other: number // Другое (включая личные траты семьи)
  total: number // Общие расходы
  transport: number // Транспорт
}

export interface TaxesBreakdown {
  business: number // Налог на прибыль бизнеса
  capital: number // Налог на прирост капитала
  income: number // Налог на доход (для наемных)
  property: number // Налог на имущество
  total: number // Общие налоги
}

export interface QuarterlyReport {
  expenses: ExpensesBreakdown
  income: IncomeBreakdown
  netProfit: number // Чистая прибыль
  taxes: TaxesBreakdown
  warning: string | null // Предупреждение
}
